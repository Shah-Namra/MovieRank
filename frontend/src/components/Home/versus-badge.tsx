"use client";

import { motion } from "framer-motion";

export const VersusBadge = () => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 shrink-0 z-20">
      {/* 1. Ambient Glow (Breathing) */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-primary/40 rounded-full blur-2xl"
      />

      {/* 2. Outer Ring */}
      <div className="absolute inset-0 border border-white/10 rounded-full backdrop-blur-sm bg-black/40" />

      {/* 3. Inner Ring (Spinning slowly) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border border-dashed border-white/20 rounded-full"
      />

      {/* 4. Text */}
      <span className="relative font-black text-2xl md:text-3xl italic tracking-tighter text-white drop-shadow-glow">
        VS
      </span>
    </div>
  );
};
