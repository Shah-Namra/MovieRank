"use client";
import { motion } from "framer-motion";
import Image from "next/image";

// Using Remix Icons instead of lucide
const StarIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const FilmIcon = () => (
  <svg
    className="h-16 w-16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" strokeWidth={1.5} />
    <path d="M7 3v18M17 3v18M2 9h20M2 15h20" strokeWidth={1.5} />
  </svg>
);

interface MoviePosterProps {
  title: string;
  year: number;
  posterPath: string | null;
  rating: number;
  onClick?: () => void;
  disabled?: boolean;
  position?: "left" | "right";
  compact?: boolean;
}

export function MoviePoster({
  title,
  year,
  posterPath,
  rating,
  onClick,
  disabled = false,
  position = "left",
  compact = false,
}: MoviePosterProps) {
  // FIXED: Use w500 for better quality, or w342 for balance
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  const maxWidth = compact ? "max-w-[220px]" : "max-w-[240px]";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full ${maxWidth} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-2xl`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!disabled ? { y: -6, transition: { duration: 0.2 } } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-muted border border-border shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, 280px"
            priority
            quality={90}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-secondary">
            <FilmIcon />
          </div>
        )}

        {/* Subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-card/95 backdrop-blur-sm shadow-md flex items-center gap-1.5 border border-border">
          <StarIcon filled />
          <span className="text-sm font-bold text-foreground tabular-nums">
            {Math.round(rating)}
          </span>
        </div>

        {/* Call-to-action on hover */}
        {!disabled && (
          <motion.div
            className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-xl">
              Choose This
            </div>
          </motion.div>
        )}
      </div>

      {/* Movie Info - Compact */}
      <div className="mt-3 px-1">
        <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug mb-0.5">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">{year}</p>
      </div>
    </motion.button>
  );
}
