"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// ── Film Leader Intro ─────────────────────────────────────────────────────
// Plays a full 3-2-1 countdown as a proper intro, always lasting ~3 seconds.
// `onComplete` fires when both the countdown AND the data are ready.
// Pass `dataReady={true}` once your data has loaded — the countdown waits
// for it if it finishes early, or the data waits for the countdown if slow.

interface FilmLeaderProps {
  dataReady: boolean;
  onComplete: () => void;
}

export function FilmLeader({ dataReady, onComplete }: FilmLeaderProps) {
  const [count, setCount] = useState(3);
  const [flicker, setFlicker] = useState(false);
  const [countDone, setCountDone] = useState(false);
  const firedRef = useRef(false);

  // Countdown: 3 → 2 → 1, each showing for 800ms
  useEffect(() => {
    let step = 3;
    const tick = () => {
      step -= 1;
      if (step >= 1) {
        setCount(step);
        // Random projector flicker
        if (Math.random() > 0.6) {
          setFlicker(true);
          setTimeout(() => setFlicker(false), 55);
        }
        setTimeout(tick, 800);
      } else {
        setCountDone(true);
      }
    };
    const id = setTimeout(tick, 800);
    return () => clearTimeout(id);
  }, []);

  // Fire onComplete when BOTH countdown done AND data ready
  useEffect(() => {
    if (countDone && dataReady && !firedRef.current) {
      firedRef.current = true;
      // Brief beat after "1" before revealing
      setTimeout(onComplete, 220);
    }
  }, [countDone, dataReady, onComplete]);

  const size = 148;
  const cx = size / 2;
  const r = 54;
  const innerR = 36;

  const pct = (3 - count) / 2; // 0 at 3, 0.5 at 2, 1 at 1
  const sweepAngle = pct * 2 * Math.PI - Math.PI / 2;
  const sx = cx + r * Math.cos(sweepAngle);
  const sy = cx + r * Math.sin(sweepAngle);
  const large = pct > 0.5 ? 1 : 0;
  const sweepPath =
    pct > 0.001
      ? `M ${cx} ${cx - r} A ${r} ${r} 0 ${large} 1 ${sx.toFixed(2)} ${sy.toFixed(2)}`
      : "";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7"
      style={{ background: "var(--background)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeIn" }}
    >
      <motion.div
        animate={{ opacity: flicker ? 0.45 : 1 }}
        transition={{ duration: 0.04 }}
        className="relative"
      >
        {/* Horizontal film strips — top and bottom */}
        {[-1, 1].map((side) => (
          <div
            key={side}
            className="absolute left-0 right-0 flex justify-between px-8"
            style={{
              [side === -1 ? "top" : "bottom"]: -14,
              height: 11,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: "100%",
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        ))}

        {/* Film frame body */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: size + 44,
            height: size + 44,
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Side sprocket holes */}
          {[0, 1, 2, 3, 4].map((i) =>
            [0, 1].map((side) => (
              <div
                key={`${side}-${i}`}
                style={{
                  position: "absolute",
                  [side === 0 ? "left" : "right"]: 7,
                  top: 20 + i * 22,
                  width: 8,
                  height: 12,
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                }}
              />
            )),
          )}

          {/* The frame window */}
          <div
            className="relative overflow-hidden"
            style={{
              width: size,
              height: size,
              background: "var(--background)",
            }}
          >
            {/* Drifting scan line */}
            <motion.div
              className="absolute left-0 right-0 h-px"
              style={{ background: "rgba(255,255,255,0.12)" }}
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />

            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Outer ring */}
              <circle
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke="var(--text-dim)"
                strokeWidth={0.5}
                opacity={0.35}
              />

              {/* Cross-hairs */}
              {[
                [cx - r - 10, cx, cx - innerR + 2, cx],
                [cx + innerR - 2, cx, cx + r + 10, cx],
                [cx, cx - r - 10, cx, cx - innerR + 2],
                [cx, cx + innerR - 2, cx, cx + r + 10],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--text-dim)"
                  strokeWidth={0.5}
                  opacity={0.25}
                />
              ))}

              {/* Progress sweep arc */}
              {sweepPath && (
                <motion.path
                  d={sweepPath}
                  fill="none"
                  stroke="var(--amber)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  opacity={0.75}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  key={count}
                />
              )}

              {/* Inner circle */}
              <circle
                cx={cx}
                cy={cx}
                r={innerR}
                fill="var(--surface-1)"
                stroke="var(--text-dim)"
                strokeWidth={0.5}
                opacity={0.4}
              />

              {/* Countdown digit */}
              <AnimatePresence mode="wait">
                <motion.text
                  key={count}
                  x={cx}
                  y={cx + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--foreground)"
                  fontSize={34}
                  fontWeight={900}
                  fontFamily="var(--font-geist-sans)"
                  letterSpacing="-2"
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  {count}
                </motion.text>
              </AnimatePresence>

              {/* Center dot when data waiting */}
              {countDone && !dataReady && (
                <motion.circle
                  cx={cx}
                  cy={cx}
                  r={3}
                  fill="var(--amber)"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Label */}
      <motion.p
        className="text-[10px] font-black tracking-[0.3em] uppercase"
        style={{ color: "var(--text-dim)" }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        {countDone && !dataReady ? "Loading films…" : "Cueing films"}
      </motion.p>
    </motion.div>
  );
}

// ── Leaderboard skeleton ──────────────────────────────────────────────────
export function LoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-px">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-16 rounded-sm"
          style={{ background: "var(--surface-1)" }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

// Keep old LoadingState name as alias for any other consumers
export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--amber)" }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
