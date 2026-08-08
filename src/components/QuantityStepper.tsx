"use client";

export function QuantityStepper({
  quantity,
  onChange,
  small = false,
}: {
  quantity: number;
  onChange: (q: number) => void;
  small?: boolean;
}) {
  const btn = small ? "h-7 w-7 text-sm" : "h-9 w-9 text-base";
  return (
    <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(quantity - 1)}
        className={`${btn} flex items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white hover:text-primary-600 disabled:opacity-40`}
        disabled={quantity <= 1}
      >
        −
      </button>
      <span className={`min-w-8 text-center font-semibold text-slate-800 ${small ? "text-sm" : ""}`}>
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        className={`${btn} flex items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white hover:text-primary-600`}
      >
        +
      </button>
    </div>
  );
}
