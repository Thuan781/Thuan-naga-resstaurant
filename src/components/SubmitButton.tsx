"use client";

export function SubmitButton({
  pending,
  children,
  className = "",
  pendingText = "Please wait…",
  disabled = false,
}: {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
      )}
      {pending ? pendingText : children}
    </button>
  );
}
