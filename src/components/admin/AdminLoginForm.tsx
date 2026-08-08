"use client";

import OtpLoginForm from "../OtpLoginForm";
import GoogleLoginButton from "../GoogleLoginButton";

export default function AdminLoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  return (
    <div className="mt-6">
      <OtpLoginForm mode="admin" emailPlaceholder="kthuan781@gmail.com" />
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <GoogleLoginButton mode="admin" enabled={googleEnabled} />
    </div>
  );
}
