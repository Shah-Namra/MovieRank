"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MoviePoster } from "@/components/Home/movie-poster";
import { VersusDisplay } from "@/components/versus-display";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useMoviePair, useCompare, useStats } from "@/hooks/useMovies";
import { useQueryClient } from "@tanstack/react-query";

type Selection = { winnerId: number; loserId: number } | null;
const RESULT_HOLD_MS = 550;

// ── Shared layout constants — must match navbar and CSS tokens ──
// Any change here must also update --nav-h, --page-px in globals.css
const NAV_H = 64; // px — navbar height (h-16)
const PAGE_PX = 24; // px — horizontal padding (px-6)
const BAR_H = 52; // px — bottom action bar
const TICKER_H = 36; // px — ticker strip

// ── Line animation timing ──
// Horizontal rule animates after header text settles
const LINE_DELAY = 0.72; // seconds

function StatPill({ label, value }: { label: string; value: string | number }) {
  const display = typeof value === "number" ? value.toLocaleString() : value;
  const [shown, setShown] = useState(display);
  const [flip, setFlip] = useState(false);
  const prev = useRef(display);

  useEffect(() => {
    if (display !== prev.current) {
      setFlip(true);
      const t = setTimeout(() => {
        setShown(display);
        setFlip(false);
        prev.current = display;
      }, 140);
      return () => clearTimeout(t);
    }
  }, [display]);

  return (
    <div className="flex items-baseline gap-1.5">
      <span
        key={flip ? "f" : "s"}
        className={
          "text-[19px] font-black tabular-nums leading-none" +
          (flip ? " animate-num-flip" : "")
        }
        style={{ color: "var(--foreground)" }}
      >
        {shown}
      </span>
      <span
        className="text-[9px] font-bold tracking-[0.14em] uppercase"
        style={{ color: "var(--text-mid)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function Hero({
  skipInitialLoad = false,
}: {
  skipInitialLoad?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useMoviePair();
  const compareMutation = useCompare();
  const { data: statsData } = useStats();
  const stats = statsData?.data;

  type Phase = "countdown" | "ready" | "selected" | "transitioning";
  const [phase, setPhase] = useState<Phase>("countdown");
  const [selection, setSelection] = useState<Selection>(null);
  const [vsKey, setVsKey] = useState(0);

  // ── Precise line positioning ─────────────────────────────────────────────
  // We measure the exact heading bounds so lines start/end at real content edges.
  // The vertical columns use the same PAGE_PX offset as the navbar — everything
  // on the page snaps to one grid.
  const line1Ref = useRef<HTMLSpanElement>(null); // "Which film"
  const line2Ref = useRef<HTMLSpanElement>(null); // "reigns supreme?"
  const headerRef = useRef<HTMLDivElement>(null);

  // Measured positions (null until DOM is ready)
  type LinePositions = {
    // Horizontal rule: runs from right edge of "FILM" to right viewport edge,
    // at the vertical midline of "Which film"
    hTop: number; // px from viewport top (fixed position)
    hLeft: number; // px from left (right edge of "FILM")
    // Vertical rule: drops from bottom of "supreme?" to top of bottom bar
    vLeft: number; // px from left (right edge of "supreme?")
    vTop: number; // px from viewport top
    vBottom: number; // px from viewport bottom (bottom bar + ticker)
  } | null;

  const [lines, setLines] = useState<LinePositions>(null);

  const measure = useCallback(() => {
    if (!line1Ref.current || !line2Ref.current) return;
    const r1 = line1Ref.current.getBoundingClientRect();
    const r2 = line2Ref.current.getBoundingClientRect();

    setLines({
      // Horizontal: vertically centered on "Which film" row
      hTop: r1.top + r1.height / 2,
      hLeft: r1.right,
      // Vertical: right edge of "supreme?", drops to BAR_H + TICKER_H from bottom
      vLeft: r2.right,
      vTop: r2.bottom,
      vBottom: BAR_H + TICKER_H,
    });
  }, []);

  useEffect(() => {
    const id = setTimeout(measure, 100); // wait one tick for font render
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // ── Phase machine ────────────────────────────────────────────────────────
  const prevPairKey = useRef<string | null>(null);
  const ownTransitionRef = useRef(false);
  const movie1 = data?.data.movie1;
  const movie2 = data?.data.movie2;
  const pairKey = movie1 && movie2 ? `${movie1.id}-${movie2.id}` : null;

  useEffect(() => {
    if (!pairKey || pairKey === prevPairKey.current) return;
    if (ownTransitionRef.current) {
      ownTransitionRef.current = false;
      prevPairKey.current = pairKey;
      return;
    }
    prevPairKey.current = pairKey;
    setSelection(null);
    setPhase("countdown");
    setVsKey((k) => k + 1);
  }, [pairKey]);

  const handleCountdownComplete = useCallback(() => setPhase("ready"), []);

  const handleVote = async (winnerId: number, loserId: number) => {
    if (phase !== "ready") return;
    setSelection({ winnerId, loserId });
    setPhase("selected");

    queryClient.prefetchQuery({
      queryKey: ["moviePairNext"],
      queryFn: async () => {
        const res = await fetch("http://localhost:3000/api/movies/pair");
        if (!res.ok) throw new Error("prefetch failed");
        return res.json();
      },
      staleTime: 0,
    });

    try {
      await compareMutation.mutateAsync({ winnerId, loserId });
    } catch {
      setSelection(null);
      setPhase("ready");
      return;
    }

    setTimeout(() => {
      setPhase("transitioning");
      const cached = queryClient.getQueryData(["moviePairNext"]);
      if (cached) {
        ownTransitionRef.current = true;
        queryClient.setQueryData(["moviePair"], cached);
        queryClient.removeQueries({ queryKey: ["moviePairNext"] });
        setTimeout(() => {
          setSelection(null);
          setPhase("countdown");
          setVsKey((k) => k + 1);
        }, 16);
      } else {
        refetch();
      }
    }, RESULT_HOLD_MS);
  };

  const handleSkip = () => {
    setSelection(null);
    setPhase("countdown");
    setVsKey((k) => k + 1);
    refetch();
  };

  if (!skipInitialLoad && isLoading && !movie1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const ratingDiff = data?.data.ratingDifference ?? 0;
  const isInteractive = phase === "ready";
  const showPosters = phase === "ready" || phase === "selected";

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* ════════════════════════════════════════════════════════
          GRID LINES
          Every line is anchored to real content geometry:

          Left vertical   ─── aligns with left edge of page content (PAGE_PX from viewport left)
          Right vertical  ─── aligns with right edge of page content (PAGE_PX from viewport right)
          Nav bottom rule ─── sits exactly at navbar bottom (NAV_H from top), full width
          Horizontal rule ─── measured: right edge of "FILM" → right viewport edge, at text midline
          Vertical drop   ─── measured: bottom of "supreme?" → top of bottom bar, at text right edge
          ════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-10" aria-hidden>
        {/* Left column rule — matches page padding exactly */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: PAGE_PX, background: "var(--bg-line)" }}
        />
        {/* Right column rule — mirrors left precisely */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ right: PAGE_PX, background: "var(--bg-line)" }}
        />

        {/* Navbar bottom rule — full width, sits flush with navbar base */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{ top: NAV_H, background: "var(--bg-line)" }}
        />

        {/* Ticker top rule — sits flush with ticker top = bottom bar + ticker from bottom */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{ bottom: TICKER_H, background: "var(--bg-line)" }}
        />

        {/* ── Measured lines — only rendered after DOM measurement ── */}
        {lines && (
          <>
            {/* Horizontal rule: starts at right edge of "FILM", runs to right viewport edge */}
            {/* Amber tick at the origin — marks the exact start point */}
            <motion.div
              className="absolute h-px"
              style={{
                top: lines.hTop,
                left: lines.hLeft,
                right: 0,
                background: "var(--bg-line)",
                transformOrigin: "left center",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1],
                delay: LINE_DELAY,
              }}
            />
            {/* Amber origin tick — 1px wide × 10px tall, centered on the h-line */}
            <motion.div
              className="absolute w-px"
              style={{
                top: lines.hTop - 5,
                left: lines.hLeft,
                height: 10,
                background: "var(--amber)",
                opacity: 0.6,
                transformOrigin: "top center",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.18, delay: LINE_DELAY }}
            />

            {/* Vertical drop: starts at bottom of "supreme?", drops to ticker */}
            <motion.div
              className="absolute w-px"
              style={{
                top: lines.vTop,
                left: lines.vLeft,
                bottom: lines.vBottom,
                background: "var(--bg-line)",
                transformOrigin: "top center",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.65,
                ease: [0.4, 0, 0.2, 1],
                delay: LINE_DELAY + 0.08,
              }}
            />
            {/* Amber origin tick — 10px wide × 1px tall, marks the start of vertical */}
            <motion.div
              className="absolute h-px"
              style={{
                top: lines.vTop,
                left: lines.vLeft - 5,
                width: 10,
                background: "var(--amber)",
                opacity: 0.6,
                transformOrigin: "left center",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.18, delay: LINE_DELAY + 0.08 }}
            />
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          PAGE CONTENT
          All horizontal padding = PAGE_PX (24px) so content edges
          align with the left/right column rules above.
          ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col" style={{ paddingTop: NAV_H }}>
        {/* ── Header ── */}
        <div
          className="flex items-end justify-between gap-4"
          style={{ padding: `20px ${PAGE_PX}px 16px` }}
        >
          {/* Left: eyebrow + headline */}
          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, delay: 0.05 }}
            >
              {/* Amber dash — exactly 20px wide, 2px tall */}
              <div
                style={{
                  width: 20,
                  height: 2,
                  background: "var(--amber)",
                  flexShrink: 0,
                }}
              />
              <span
                className="text-[10px] font-black tracking-[0.26em] uppercase"
                style={{ color: "var(--amber)" }}
              >
                Head to Head
              </span>
            </motion.div>

            <h1
              className="font-black leading-[0.9] tracking-tight uppercase"
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                color: "var(--foreground)",
              }}
            >
              <motion.span
                ref={line1Ref}
                className="block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.36,
                  delay: 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onAnimationComplete={measure}
              >
                Which film
              </motion.span>
              <motion.span
                ref={line2Ref}
                className="block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.36,
                  delay: 0.24,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onAnimationComplete={measure}
              >
                <span style={{ color: "var(--amber)" }}>reigns</span> supreme?
              </motion.span>
            </h1>
          </div>

          {/* Right: live stats — desktop only, baseline-aligned with headline bottom */}
          <motion.div
            className="hidden md:flex items-end gap-8 shrink-0"
            style={{ paddingBottom: 3 }} // optical alignment to headline baseline
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.35 }}
          >
            {stats && (
              <>
                <StatPill label="Battles" value={stats.total_comparisons} />
                <StatPill label="Films" value={stats.total_movies} />
                <StatPill label="Avg" value={stats.avg_comparisons_per_movie} />
              </>
            )}
          </motion.div>
        </div>

        {/* ── Battle arena ── */}
        <div className="flex-1 flex flex-col">
          {movie1 && movie2 && (
            <div className="flex-1 flex flex-col">
              {/* Poster + VS grid — centered, fixed max-width */}
              <div
                className="flex-1 flex items-center justify-center"
                style={{ padding: `16px ${PAGE_PX}px` }}
              >
                <div
                  className="w-full grid items-center"
                  style={{
                    maxWidth: 600,
                    // Columns: equal sides + auto center for VS badge
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: 12,
                  }}
                >
                  {/* Left poster */}
                  <div className="flex justify-end">
                    {showPosters ? (
                      <motion.div
                        key={`left-${movie1.id}-${vsKey}`}
                        className="w-[210px]"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <MoviePoster
                          title={movie1.title}
                          year={movie1.release_year}
                          posterPath={movie1.poster_path}
                          rating={movie1.elo_rating}
                          onClick={() => handleVote(movie1.id, movie2!.id)}
                          disabled={!isInteractive}
                          position="left"
                          compact
                          selectionState={
                            selection === null
                              ? null
                              : selection.winnerId === movie1.id
                                ? "winner"
                                : "loser"
                          }
                        />
                      </motion.div>
                    ) : (
                      <div
                        className="w-[210px]"
                        style={{ aspectRatio: "2/3" }}
                      />
                    )}
                  </div>

                  {/* VS badge — always present, drives the countdown */}
                  <VersusDisplay
                    compact
                    triggerKey={vsKey}
                    onCountdownComplete={handleCountdownComplete}
                  />

                  {/* Right poster */}
                  <div className="flex justify-start">
                    {showPosters ? (
                      <motion.div
                        key={`right-${movie2.id}-${vsKey}`}
                        className="w-[210px]"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.32,
                          delay: 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <MoviePoster
                          title={movie2.title}
                          year={movie2.release_year}
                          posterPath={movie2.poster_path}
                          rating={movie2.elo_rating}
                          onClick={() => handleVote(movie2.id, movie1!.id)}
                          disabled={!isInteractive}
                          position="right"
                          compact
                          selectionState={
                            selection === null
                              ? null
                              : selection.winnerId === movie2.id
                                ? "winner"
                                : "loser"
                          }
                        />
                      </motion.div>
                    ) : (
                      <div
                        className="w-[210px]"
                        style={{ aspectRatio: "2/3" }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* ── Bottom action bar ── */}
              {/* Height = BAR_H (52px), padding matches PAGE_PX */}
              <div
                className="flex items-center justify-between gap-4 border-t"
                style={{
                  height: BAR_H,
                  padding: `0 ${PAGE_PX}px`,
                  borderColor: "var(--border)",
                  flexShrink: 0,
                }}
              >
                {/* Rating gap */}
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 20,
                      height: 1,
                      background: "rgba(245,200,66,0.5)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="text-[10px] font-bold tracking-[0.14em] uppercase"
                    style={{ color: "var(--text-mid)" }}
                  >
                    Rating gap
                  </span>
                  <span
                    className="text-[13px] font-black tabular-nums"
                    style={{ color: "var(--amber)" }}
                  >
                    {Math.abs(Math.round(ratingDiff))}
                  </span>
                </div>

                {/* Mobile: total battles */}
                {stats && (
                  <div className="md:hidden">
                    <span
                      className="text-[10px] font-bold tracking-[0.1em] uppercase"
                      style={{ color: "var(--text-mid)" }}
                    >
                      {stats.total_comparisons.toLocaleString()} battles
                    </span>
                  </div>
                )}

                {/* Skip button */}
                <motion.button
                  onClick={handleSkip}
                  disabled={!isInteractive}
                  className="group relative flex items-center gap-2 overflow-hidden border"
                  style={{
                    height: 32,
                    padding: "0 14px",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                  whileHover="hovered"
                  whileTap={{ scale: 0.96 }}
                  initial="idle"
                >
                  <motion.div
                    className="absolute inset-0 origin-left"
                    style={{ background: "var(--amber)" }}
                    variants={{ idle: { scaleX: 0 }, hovered: { scaleX: 1 } }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  />
                  <motion.span
                    className="relative z-10"
                    variants={{
                      idle: { color: "var(--text-secondary)" },
                      hovered: { color: "#0a0a0b" },
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    Skip
                  </motion.span>
                  <motion.svg
                    className="relative z-10"
                    width={11}
                    height={11}
                    viewBox="0 0 12 12"
                    fill="none"
                    variants={{
                      idle: { x: 0, color: "var(--text-secondary)" },
                      hovered: { x: 3, color: "#0a0a0b" },
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <path
                      d="M2 6h8M6 2l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Ticker ── */}
      {/* Height = TICKER_H (36px), sits above the page bottom */}
      {stats && (
        <div
          className="overflow-hidden relative border-t"
          style={{
            height: TICKER_H,
            flexShrink: 0,
            background: "var(--surface-1)",
            borderColor: "var(--border)",
          }}
        >
          {/* Fade masks — width matches PAGE_PX so content aligns */}
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{
              left: 0,
              width: PAGE_PX * 2,
              background:
                "linear-gradient(to right, var(--surface-1), transparent)",
            }}
          />
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{
              right: 0,
              width: PAGE_PX * 2,
              background:
                "linear-gradient(to left, var(--surface-1), transparent)",
            }}
          />
          <div className="flex items-center h-full">
            <div className="animate-ticker whitespace-nowrap flex items-center">
              {[0, 1].map((rep) => (
                <span key={rep} className="inline-flex items-center">
                  {[
                    { label: "Most Battled", value: stats.most_compared_movie },
                    { label: "Most Wins", value: stats.most_wins_movie },
                    {
                      label: "Highest Rated",
                      value: stats.highest_rated_movie,
                    },
                    {
                      label: "Most Dominant",
                      value: stats.most_dominant_movie,
                    },
                    { label: "Underdog", value: stats.underdog_movie },
                  ].map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.15em] uppercase border-r"
                      style={{
                        padding: `0 ${PAGE_PX}px`,
                        borderColor: "var(--border)",
                      }}
                    >
                      <span style={{ color: "var(--amber)" }}>◆</span>
                      <span style={{ color: "var(--text-dim)" }}>
                        {item.label}
                      </span>
                      <span style={{ color: "var(--foreground)" }}>
                        {item.value ?? "—"}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
