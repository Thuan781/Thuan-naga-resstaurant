export function SpiceLevel({ level, className = "" }: { level: number; className?: string }) {
  if (level <= 0) {
    return <span className={`text-[11px] font-medium text-slate-400 ${className}`}>Mild</span>;
  }
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} title={`Spice level ${level}/3`}>
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={i < level ? "" : "opacity-20 grayscale"}>
          🌶️
        </span>
      ))}
      <span className="ml-0.5 text-[11px] font-medium text-slate-500">
        {level === 1 ? "Mild" : level === 2 ? "Spicy" : "Extra hot"}
      </span>
    </span>
  );
}

export function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] border ${isVeg ? "border-accent-600" : "border-red-500"}`}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className={`h-2 w-2 rounded-full ${isVeg ? "bg-accent-600" : "bg-red-500"}`} />
    </span>
  );
}
