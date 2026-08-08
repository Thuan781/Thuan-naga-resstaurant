"use server";

import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export type PasswordState = {
  ok?: boolean;
  error?: string;
  email?: string;
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const OTP_TTL_MS = 10 * 60_000;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Step 1: email a 6-digit reset code to the account's inbox. */
export async function requestResetAction(formData: FormData): Promise<PasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email." };

  const code = randomInt(100000, 1_000_000).toString();
  const mail = await sendOtpEmail(email, code);
  if (!mail.sent) {
    return {
      error: "We couldn’t email your reset code — the email service isn’t set up yet. Please try again later.",
    };
  }

  await prisma.passwordReset.create({
    data: {
      codeHash: sha256(code),
      email,
      userId: user.id,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await prisma.passwordReset.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }] },
  });

  return { ok: true, email };
}

/** Step 2: verify the code and set the new password. */
export async function resetPasswordAction(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from the email." };
  if (newPassword.length < 6) return { error: "Password must be at least 6 characters." };
  if (newPassword !== confirm) return { error: "Passwords do not match." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email." };

  const otp = await prisma.passwordReset.findFirst({
    where: {
      email,
      userId: user.id,
      codeHash: sha256(code),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { error: "Invalid or expired code. Request a new one." };

  await prisma.$transaction([
    prisma.passwordReset.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    }),
    // log out any existing sessions for this account
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
  return { ok: true };
}
