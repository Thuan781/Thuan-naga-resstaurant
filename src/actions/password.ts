"use server";

import { requestPasswordReset, resetPassword } from "@/lib/auth";

export type PasswordState = {
  ok?: boolean;
  error?: string;
  code?: string;
};

export async function requestResetAction(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  const res = await requestPasswordReset(email);
  if (res.error) return { error: res.error };
  return { ok: true, code: res.code };
}

export async function resetPasswordAction(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  const res = await resetPassword(email, code, password);
  if (res.error) return { error: res.error };
  return { ok: true };
}
