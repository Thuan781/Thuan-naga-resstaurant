"use server";

import { redirect } from "next/navigation";
import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export type AuthState = {
  ok?: boolean;
  error?: string;
  email?: string;
  name?: string;
  password?: string;
  next?: string;
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const OTP_TTL_MS = 10 * 60_000; // codes are valid for 10 minutes

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Emails a 6-digit code to the account's inbox and stores a hash of it.
 * The code itself is never returned to the UI.
 */
async function issueOtp(email: string, userId: string | null): Promise<{ ok: boolean; error?: string }> {
  const code = randomInt(100000, 1_000_000).toString();
  const mail = await sendOtpEmail(email, code);
  if (!mail.sent) {
    return {
      ok: false,
      error:
        "We couldn’t email your code — the email service isn’t set up yet. Please try again later.",
    };
  }

  await prisma.passwordReset.create({
    data: {
      codeHash: sha256(code),
      email,
      userId,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  // tidy up old codes
  await prisma.passwordReset.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }] },
  });

  return { ok: true };
}

/**
 * Step 1 of sign-up: validate the details and email a verification code.
 * The account is only created after the code is verified.
 */
export async function registerAction(formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/";

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (name.length < 2) return { error: "Please enter your name." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error:
        "An account with this email already exists. Use “Forgot password” if you need to set a new password.",
    };
  }

  const otp = await issueOtp(email, null);
  if (!otp.ok) return { error: otp.error };
  return { ok: true, email, name, password, next };
}

/**
 * Step 2 of sign-up: verify the code, then create the account with the
 * password the customer chose and log them in.
 */
export async function verifyRegisterAction(formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/";

  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from the email." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const otp = await prisma.passwordReset.findFirst({
    where: { email, codeHash: sha256(code), userId: null, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { error: "Invalid or expired code. Request a new one." };

  await prisma.passwordReset.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      passwordHash: await hashPassword(password),
    },
  });

  await createSession(user.id);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

/** Logs in with email + password (the password set at sign-up). */
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/";

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (!password) return { error: "Enter your password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

/** Staff login — same as login, but only accounts with admin access can proceed. */
export async function adminLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (!password) return { error: "Enter your password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  if (user.role !== "ADMIN") {
    return { error: "This account does not have admin access." };
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
