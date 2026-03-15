"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VersusDisplayProps {
  compact?: boolean;
  triggerKey?: number;
  onCountdownComplete?: () => void;
}

const COUNTDOWN = ["3", "2", "1", "VS"];
const DIGIT_MS  = 270;
const VS_HOLD_MS = 180;

export function VersusDisplay({
  compact = false,
  triggerKey = 0,
  onCountdownComplete,
}: VersusDisplayProps) {
  const [phase, setPhase] = useState<"counting" | "idle">("counting");
  const [countIndex, setCountIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SIZE = compact ? 60 : 76;
  const cx = SIZE / 2;
  const r  = SIZE / 2 - 5;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setPhase("counting");
    setCountIndex(0);

    let idx = 0;
    const tick = () => {
      idx++;
      if (idx < COUNTDOWN.length) {
        setCountIndex(idx);
        const delay = idx === COUNTDOWN.length - 1 ? VS_HOLD_MS : DIGIT_MS;
        timer.current = setTimeout(() => {
          if (idx === COUNTDOWN.length - 1) {
            setPhase("idle");
            onCountdownComplete?.();
          } else {
            tick();
          }
        }, delay);
      }
    };
    timer.current = setTimeout(tick, DIGIT_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [triggerKey]); // eslint-disable-line

  const current = COUNTDOWN[countIndex];
  const isVS    = current === "VS";

  /* Reel spokes — 12 dots arranged in a circle */
  const spokes = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + (r - 1) * Math.cos(angle),
      y: cx + (r - 1) * Math.sin(angle),
      large: i % 3 === 0,
    };
  });

  return (
    <div
      className="flex items-center justify-center"
      style={{ padding: compact ? "12px 8px" : "20px 12px" }}
    >
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>

        {/* Spinning reel ring */}
        <svg
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            position: "absolute", inset: 0,
            animation: phase === "counting"
              ? "spin-reel 0.45s linear infinite"
              : "spin-reel 6s linear infinite",
          }}
        >
          {spokes.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.large ? 2.2 : 1}
              fill={isVS ? "var(--gold)" : "var(--text-muted)"}
              style={{ transition: "fill 0.12s" }}
            />
          ))}
          <circle
            cx={cx} cy={cx}
            r={r - 7}
            fill="none"
            stroke={isVS ? "var(--gold)" : "var(--text-muted)"}
            strokeWidth="0.6"
            strokeDasharray="2.5 4.5"
            style={{ transition: "stroke 0.12s" }}
          />
        </svg>

        {/* Inner circle */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: SIZE - 18,
            height: SIZE - 18,
            borderRadius: "50%",
            background: isVS ? "var(--gold)" : "var(--surface-1)",
            border: `1.5px solid ${isVS ? "var(--gold)" : "var(--border-mid)"}`,
            transition: "background 0.1s, border-color 0.1s",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`${triggerKey}-${current}`}
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              style={{
                fontSize: isVS ? (compact ? 12 : 14) : compact ? 18 : 22,
                fontWeight: 900,
                letterSpacing: isVS ? "0.1em" : "-0.02em",
                lineHeight: 1,
                color: isVS ? "var(--surface-0)" : "var(--gold)",
                userSelect: "none",
              }}
            >
              {current}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Idle pulse ring */}
        {phase === "idle" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "1px solid var(--gold)" }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.28, 0, 0.28] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
}
