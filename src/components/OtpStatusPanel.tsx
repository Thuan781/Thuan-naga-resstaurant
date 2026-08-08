export default function OtpStatusPanel({
  sent,
  email,
  code,
}: {
  sent: boolean;
  email: string;
  code?: string | null;
}) {
  if (sent) {
    return (
      <div className="rounded-xl bg-accent-50 px-4 py-3 ring-1 ring-accent-200">
        <p className="text-xs font-bold uppercase tracking-wide text-accent-700">📧 Code sent</p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          We emailed a 6-digit code to <span className="font-semibold">{email}</span>. Enter it below
          — it expires in 10 minutes.
        </p>
        <p className="mt-1 text-xs text-accent-700">Didn’t get it? Check spam, then press “Resend code”.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
        ⚠️ Email isn’t connected yet
      </p>
      <p className="mt-1 text-center text-3xl font-extrabold tracking-[0.35em] text-slate-900">
        {code ?? "······"}
      </p>
      <p className="mt-1 text-xs text-amber-700">
        The owner needs to add email settings for codes to be sent to your inbox.
      </p>
    </div>
  );
}
