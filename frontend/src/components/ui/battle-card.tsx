"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { StarIcon, FilmIcon } from "@/components/icons"; // Assuming you have these
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BattleCardProps {
  title: string;
  year: number;
  posterPath: string | null;
  rating: number;
  onClick?: () => void;
  disabled?: boolean;
}

export const BattleCard = ({
  title,
  year,
  posterPath,
  rating,
  onClick,
  disabled,
}: BattleCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse Tracking Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={!disabled ? onClick : undefined}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: disabled ? 0.5 : 1, scale: disabled ? 0.95 : 1 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative w-full max-w-[340px] aspect-[2/3] rounded-2xl cursor-pointer overflow-hidden bg-card border border-white/5",
        disabled && "grayscale pointer-events-none opacity-50",
      )}
    >
      {/* 1. The Spotlight Effect (The "Glow") */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-500 z-10"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([newX, newY]) =>
              `radial-gradient(600px circle at ${newX}px ${newY}px, rgba(255, 255, 255, 0.15), transparent 40%)`,
          ),
        }}
      />

      {/* 2. Image Layer */}
      <div className="absolute inset-0 bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 340px"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <FilmIcon className="w-12 h-12 opacity-20" />
          </div>
        )}
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* 3. Floating Glass UI (Bottom Info) */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
        <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-4 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20">
          {/* Rating Badge - Absolute Top Right of Glass Card */}
          <div className="absolute top-3 right-3 flex items-center gap-1 text-amber-400">
            <StarIcon className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold text-white">
              {rating.toFixed(1)}
            </span>
          </div>

          <h3 className="font-bold text-lg text-white leading-tight pr-8 line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-gray-400 font-medium mt-1">{year}</p>
        </div>
      </div>

      {/* 4. Selection Ring (Visual Feedback on Click) */}
      <div className="absolute inset-0 border-2 border-primary opacity-0 scale-95 transition-all duration-200 group-active:scale-100 group-active:opacity-100 rounded-2xl pointer-events-none z-30" />
    </motion.div>
  );
};
