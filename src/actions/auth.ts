"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { loginSchema, registerSchema } from "@/lib/validation";
import { destroySession, loginUser, registerUser } from "@/lib/auth";

export type AuthState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function flatten<T>(result: { error: z.ZodError<T> }): Record<string, string> {
  const fe = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0] ?? ""]));
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  }
  const res = await registerUser(parsed.data);
  if (res.error) return { error: res.error };
  redirect("/");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  }
  const next = (formData.get("next") as string) || "/";
  const res = await loginUser(parsed.data.email, parsed.data.password);
  if (res.error) return { error: res.error };
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function adminLoginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed) };
  }
  const res = await loginUser(parsed.data.email, parsed.data.password);
  if (res.error) return { error: res.error };
  if (!res.user || res.user.role !== "ADMIN") {
    await destroySession();
    return { error: "This account does not have admin access." };
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
