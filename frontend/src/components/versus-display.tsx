"use client";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";

export default function VersusDisplay() {
  return (
    <div className="flex items-center justify-center px-8">
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main VS circle */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-black/20 to-black/5 border-2 border-black/30 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col items-center gap-1">
            <Swords className="h-6 w-6 text-black" strokeWidth={2.5} />
            <span className="text-2xl font-black text-black tracking-tight">
              VS
            </span>
          </div>
        </div>

        {/* Animated particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-black/40"
            style={{
              top: "50%",
              left: "50%",
            }}
            animate={{
              x: [0, (i - 1) * 40, 0],
              y: [0, Math.sin(i) * 40, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
