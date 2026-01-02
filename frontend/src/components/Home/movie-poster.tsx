"use client";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import Image from "next/image";

interface MoviePosterProps {
  title: string;
  year: number;
  posterPath: string | null;
  rating: number;
  onClick?: () => void;
  disabled?: boolean;
  position?: "left" | "right";
}

export default function MoviePoster({
  title,
  year,
  posterPath,
  rating,
  onClick,
  disabled = false,
  position = "left",
}: MoviePosterProps) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-white/20 rounded-2xl"
      initial={{ opacity: 0, x: position === "left" ? -100 : 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Poster container */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-linear-to-br from-white/10 to-white/5">
            <Film className="h-20 w-20 text-white/20" strokeWidth={1.5} />
          </div>
        )}

        {/* Hover overlay */}
        {!disabled && (
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Rating badge */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border border-white/20">
          <span className="text-sm font-bold text-white">
            {Math.round(rating)}
          </span>
        </div>

        {/* Choose overlay on hover */}
        {!disabled && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-8 py-3 rounded-full bg-white text-black font-bold text-lg shadow-xl">
              Choose
            </div>
          </motion.div>
        )}
      </div>

      {/* Movie info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold text-black line-clamp-2 mb-1">
          {title}
        </h3>

        <p className="text-sm text-black/60 font-medium">{year}</p>
      </div>
    </motion.button>
  );
}
