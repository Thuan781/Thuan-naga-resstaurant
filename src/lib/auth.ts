import { cookies } from "next/headers";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomInt } from "node:crypto";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = "tn_session";
const SESSION_DAYS = 30;

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
});

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user?: User; error?: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists" };
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      passwordHash: await hashPassword(input.password),
    },
  });
  await createSession(user.id);
  return { user };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password" };
  }
  await createSession(user.id);
  return { user };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const RESET_TTL_MS = 30 * 60_000; // codes are valid for 30 minutes

/**
 * Starts a password reset for an account. Returns the 6-digit code.
 * NOTE: no email service is configured yet, so the code is returned to the
 * caller to display. Once an email provider is added, send it there instead.
 */
export async function requestPasswordReset(
  email: string
): Promise<{ code?: string; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { error: "No account found with that email." };
  const code = randomInt(100000, 1_000_000).toString();
  await prisma.passwordReset.create({
    data: {
      codeHash: sha256(code),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  // tidy up old codes
  await prisma.passwordReset.deleteMany({
    where: { OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }] },
  });
  return { code };
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ ok?: boolean; error?: string }> {
  if (newPassword.length < 6) return { error: "Password must be at least 6 characters." };
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { error: "No account found with that email." };
  const reset = await prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      codeHash: sha256(code.trim()),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!reset) return { error: "Invalid or expired reset code. Request a new one." };

  await prisma.$transaction([
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } }),
    // log out any existing sessions for this account
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
  return { ok: true };
}
