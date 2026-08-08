export default function OtpStatusPanel({ email }: { email: string }) {
  return (
    <div className="rounded-xl bg-accent-50 px-4 py-3 ring-1 ring-accent-200">
      <p className="text-xs font-bold uppercase tracking-wide text-accent-700">📧 Code sent</p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        We emailed a 6-digit code to <span className="font-semibold">{email}</span>. Enter it below —
        it expires in 10 minutes.
      </p>
      <p className="mt-1 text-xs text-accent-700">
        Didn’t get it? Check spam, then press “Resend code”.
      </p>
    </div>
  );
}
