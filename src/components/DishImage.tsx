import Image from "next/image";
import { FoodArt } from "./FoodArt";

export function DishImage({
  imageUrl,
  emoji,
  className = "",
  float = false,
  priority = false,
}: {
  imageUrl?: string | null;
  emoji?: string | null;
  className?: string;
  float?: boolean;
  priority?: boolean;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover"
        />
        {/* soft vignette so text/badges stay legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        {float && (
          <span
            aria-hidden
            className="absolute inset-0 animate-float"
            style={{ animationDuration: "6s" }}
          />
        )}
      </div>
    );
  }
  return <FoodArt emoji={emoji} className={className} float={float} />;
}
