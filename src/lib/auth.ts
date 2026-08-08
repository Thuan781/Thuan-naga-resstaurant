import { cookies } from "next/headers";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
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
