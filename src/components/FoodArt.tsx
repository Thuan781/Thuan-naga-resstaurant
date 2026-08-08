const GRADIENTS = [
  "from-orange-200 via-orange-100 to-amber-100",
  "from-rose-200 via-orange-100 to-yellow-100",
  "from-emerald-200 via-teal-100 to-lime-100",
  "from-sky-200 via-indigo-100 to-violet-100",
  "from-amber-200 via-yellow-100 to-orange-100",
  "from-red-200 via-rose-100 to-pink-100",
  "from-lime-200 via-emerald-100 to-teal-100",
];

export function FoodArt({
  emoji,
  className = "",
  float = false,
}: {
  emoji?: string | null;
  className?: string;
  float?: boolean;
}) {
  const code = emoji ? (emoji.codePointAt(0) ?? 0) : 0;
  const gradient = GRADIENTS[code % GRADIENTS.length];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
      aria-hidden
    >
      {/* soft light + frosted neon ring */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.85),transparent_55%)]" />
      <div className="absolute inset-2 rounded-2xl border border-white/60 shadow-[0_0_18px_rgba(255,255,255,0.55),inset_0_0_18px_rgba(255,255,255,0.4)]" />
      <span
        className={`relative select-none leading-none drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)] ${float ? "animate-float" : ""}`}
        style={{ fontSize: "1em" }}
      >
        {emoji ?? "🍛"}
      </span>
    </div>
  );
}
