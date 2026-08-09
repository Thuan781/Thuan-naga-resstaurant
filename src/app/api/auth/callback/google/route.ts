import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");
  const cookieStore = await cookies();
  const savedRaw = cookieStore.get("tn_oauth_state")?.value;

  const fail = (path: string) => {
    cookieStore.delete("tn_oauth_state");
    return NextResponse.redirect(new URL(path, origin));
  };

  if (oauthError || !code || !state || !savedRaw) {
    return fail("/login?error=google_failed");
  }

  let saved: { state: string; mode: string; next: string };
  try {
    saved = JSON.parse(savedRaw) as { state: string; mode: string; next: string };
  } catch {
    return fail("/login?error=google_failed");
  }
  if (saved.state !== state) return fail("/login?error=google_failed");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("/login?error=google_not_configured");

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/callback/google`;
  const mode = saved.mode === "admin" ? "admin" : "customer";
  const loginPath = mode === "admin" ? "/admin/login" : "/login";

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return fail(`${loginPath}?error=google_failed`);

  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const info = (await infoRes.json()) as { email?: string; name?: string };
  const email = String(info.email || "").toLowerCase();
  if (!email) return fail(`${loginPath}?error=google_failed`);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Random password — the account signs in via Google; "Forgot password" can set one later.
    user = await prisma.user.create({
      data: {
        email,
        name: String(info.name || email.split("@")[0]).slice(0, 80),
        passwordHash: await hashPassword(randomBytes(24).toString("hex")),
      },
    });
  }

  if (mode === "admin" && user.role !== "ADMIN") {
    return fail(`${loginPath}?error=not_admin`);
  }

  await createSession(user.id);
  cookieStore.delete("tn_oauth_state");

  const next =
    saved.next && saved.next.startsWith("/") && !saved.next.startsWith("//")
      ? saved.next
      : mode === "admin"
        ? "/admin"
        : "/";
  return NextResponse.redirect(new URL(next, origin));
}
