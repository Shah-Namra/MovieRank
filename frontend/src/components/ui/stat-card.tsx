"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delay?: number;
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  delay = 0,
  compact = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`text-center ${compact ? "px-4 sm:px-5 py-2 sm:py-3" : "px-6 py-4"}`}
    >
      <div className="flex items-center justify-center gap-2 mb-0.5">
        {icon}
        <span
          className={`font-bold text-foreground tabular-nums ${
            compact ? "text-lg sm:text-xl" : "text-2xl"
          }`}
        >
          {value}
        </span>
      </div>
      <span
        className={`font-semibold text-muted-foreground uppercase tracking-wider ${
          compact ? "text-[9px] sm:text-[10px]" : "text-[11px]"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

interface StatGroupProps {
  children: ReactNode;
}

export function StatGroup({ children }: StatGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="inline-flex items-center divide-x divide-border rounded-xl sm:rounded-2xl bg-card border border-border shadow-soft"
    >
      {children}
    </motion.div>
  );
}
