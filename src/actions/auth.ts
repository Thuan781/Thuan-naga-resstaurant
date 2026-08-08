"use server";

import { redirect } from "next/navigation";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword } from "@/lib/auth";

export type AuthState = {
  ok?: boolean;
  error?: string;
  email?: string;
  code?: string;
  mode?: string;
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const OTP_TTL_MS = 10 * 60_000; // codes are valid for 10 minutes

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Step 1 of OTP login: validate the email, find (or create) the account,
 * and generate a 6-digit code. No email service is connected yet, so the
 * code is returned here for the UI to display.
 */
export async function requestOtpAction(formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const mode = String(formData.get("mode") ?? "customer");

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    if (mode === "admin") return { error: "No staff account found with that email." };
    // First-time customers get an account automatically.
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        passwordHash: await hashPassword(randomBytes(24).toString("hex")),
      },
    });
  } else if (name && user.name === email.split("@")[0] && user.name !== name) {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  const code = randomInt(100000, 1_000_000).toString();
  await prisma.passwordReset.create({
    data: {
      codeHash: sha256(code),
      userId: user.id,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  // tidy up old codes
  await prisma.passwordReset.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }] },
  });

  return { ok: true, email, code, mode };
}

/**
 * Step 2 of OTP login: verify the 6-digit code, create the session and
 * redirect. Staff logins additionally require the ADMIN role.
 */
export async function verifyOtpAction(formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const mode = String(formData.get("mode") ?? "customer");
  const next = String(formData.get("next") ?? "") || (mode === "admin" ? "/admin" : "/");

  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from the email." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email." };

  const otp = await prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      codeHash: sha256(code),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { error: "Invalid or expired code. Request a new one." };

  await prisma.passwordReset.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

  if (mode === "admin" && user.role !== "ADMIN") {
    return { error: "This account does not have admin access." };
  }

  await createSession(user.id);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : mode === "admin" ? "/admin" : "/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
