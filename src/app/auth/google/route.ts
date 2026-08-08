import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const mode = req.nextUrl.searchParams.get("mode") === "admin" ? "admin" : "customer";
  const loginPath = mode === "admin" ? "/admin/login" : "/login";

  if (!clientId) {
    return NextResponse.redirect(
      new URL(`${loginPath}?error=google_not_configured`, req.nextUrl.origin)
    );
  }

  const next = req.nextUrl.searchParams.get("next") || (mode === "admin" ? "/admin" : "/");
  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("tn_oauth_state", JSON.stringify({ state, mode, next }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
