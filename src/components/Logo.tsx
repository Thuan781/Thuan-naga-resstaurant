import Image from "next/image";

export function Logo({
  size = 42,
  glow = false,
  className = "",
  priority = false,
}: {
  size?: number;
  glow?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${glow ? "animate-neon-pulse" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-glow-spin"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,107,53,0), rgba(255,107,53,.9), rgba(46,206,118,.9), rgba(255,215,0,.9), rgba(255,107,53,0))",
            filter: "blur(6px)",
          }}
        />
      )}
      <Image
        src="/logo.png"
        alt="Thuan Naga Restaurant — Naga house emblem"
        width={1254}
        height={1254}
        priority={priority}
        className="relative rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
