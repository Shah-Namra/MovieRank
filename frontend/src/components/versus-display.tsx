"use client";

import { motion } from "framer-motion";

interface VersusDisplayProps {
  compact?: boolean;
}

export function VersusDisplay({ compact = false }: VersusDisplayProps) {
  return (
    <div
      className={`flex items-center justify-center py-6 md:py-0 ${compact ? "px-3 md:px-5" : "px-4 md:px-6"}`}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.25,
        }}
        className="relative"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-foreground/5 to-foreground/10 blur-xl scale-150" />

        {/* Main VS Circle */}
        <div
          className={`relative rounded-full bg-foreground flex items-center justify-center shadow-elevated border-4 border-background ${
            compact ? "w-12 h-12 md:w-14 md:h-14" : "w-16 h-16 md:w-20 md:h-20"
          }`}
        >
          <span
            className={`font-black text-background tracking-tighter ${
              compact ? "text-base md:text-lg" : "text-xl md:text-2xl"
            }`}
          >
            VS
          </span>
        </div>

        {/* Animated pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-foreground/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Second pulse ring with offset */}
        <motion.div
          className="absolute inset-0 rounded-full border border-foreground/10"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </motion.div>
    </div>
  );
}
