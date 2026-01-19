"use client";

import { motion } from "framer-motion";
import { AlertIcon, RefreshIcon } from "@/components/icons";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Unable to load data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      {/* Error icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertIcon className="h-10 w-10 text-destructive" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Text */}
      <div className="space-y-2 max-w-md">
        <motion.h3
          className="text-xl font-semibold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      </div>

      {/* Retry button */}
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold transition-all hover:bg-foreground/90 active:scale-[0.98] focus-ring"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshIcon className="h-4 w-4" />
          <span>Try Again</span>
        </motion.button>
      )}
    </div>
  );
}
