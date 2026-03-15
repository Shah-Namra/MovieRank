/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { LoadingSkeleton } from "@/components/loading-state";
import Image from "next/image";
import { useLeaderboard, useStats, type StatsData } from "@/hooks/useMovies";
import { useState, useEffect, useRef } from "react";

const PAGE_PX = 32;
const NAV_H = 56;
const MARGIN_COL = 48;

function LiveNum({
  value,
  style,
}: {
  value: string | number;
  style?: React.CSSProperties;
}) {
  const [disp, setDisp] = useState(value);
  const [flip, setFlip] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      setFlip(true);
      const t = setTimeout(() => {
        setDisp(value);
        setFlip(false);
        prev.current = value;
      }, 150);
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <span
      key={flip ? "f" : "s"}
      className={flip ? "animate-num-flip" : ""}
      style={{
        display: "inline-block",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {disp}
    </span>
  );
}

function WinBar({ rate, rank }: { rate: number; rank: number }) {
  const col =
    rank === 1
      ? "var(--accent)"
      : rank <= 3
        ? "var(--fg-2)"
        : "var(--surface-3)";
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 96 }}
    >
      <div
        style={{
          flex: 1,
          height: 1.5,
          background: "var(--surface-3)",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{ height: "100%", background: col }}
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--fg-3)",
          width: 34,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {rate}%
      </span>
    </div>
  );
}

function PodiumCard({ movie, rank }: { movie: any; rank: 1 | 2 | 3 }) {
  const cfgs: Record<number, any> = {
    1: { col: "var(--accent)", w: 108, pedH: 64, label: "CHAMPION" },
    2: { col: "var(--fg-2)", w: 84, pedH: 42, label: "2ND" },
    3: { col: "var(--fg-3)", w: 76, pedH: 28, label: "3RD" },
  };
  const c = cfgs[rank];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: rank === 1 ? 0 : rank === 2 ? 0.1 : 0.2,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {rank === 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <div
            style={{ width: 14, height: 1.5, background: "var(--accent)" }}
          />
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Champion
          </span>
          <div
            style={{ width: 14, height: 1.5, background: "var(--accent)" }}
          />
        </div>
      )}
      <div
        style={{
          position: "relative",
          width: c.w,
          aspectRatio: "2/3",
          background: "var(--surface-2)",
          overflow: "hidden",
          outline: `1px solid ${c.col}30`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 16,
            height: 1.5,
            background: c.col,
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1.5,
            height: 16,
            background: c.col,
            zIndex: 3,
          }}
        />
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--surface-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 8, color: "var(--fg-4)" }}>No image</span>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,9,8,0.7) 0%, transparent 50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 7,
            left: 8,
            display: "flex",
            alignItems: "baseline",
            gap: 3,
            zIndex: 4,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: c.col,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(movie.elo_rating)}
          </span>
          <span
            style={{
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "rgba(245,240,232,0.5)",
            }}
          >
            elo
          </span>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: c.pedH,
          background: `${c.col}09`,
          borderTop: `1.5px solid ${c.col}30`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.26em",
            color: c.col,
          }}
        >
          {c.label}
        </span>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, width: c.w + 12 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "var(--fg)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {movie.title}
        </p>
        <p
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "var(--fg-3)",
            marginTop: 3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {movie.win_rate}% · {movie.total_comparisons.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

function HofCard({
  icon,
  label,
  movie,
  stat,
  delay = 0,
}: {
  icon: string;
  label: string;
  movie: string;
  stat: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        padding: "14px 16px",
        position: "relative",
      }}
    >
      {/* corner tick */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 12,
          height: 1,
          background: "var(--accent)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1,
          height: 12,
          background: "var(--accent)",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--fg-4)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--fg)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 4,
        }}
      >
        {movie || "—"}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: "var(--accent)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {stat}
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [minComp, setMinComp] = useState(0);
  const { data, isLoading, isError, refetch } = useLeaderboard(50, minComp);
  const { data: statsData } = useStats();
  const stats = statsData?.data as StatsData | undefined;
  const movies = data?.data.movies ?? [];
  const top3 = movies.slice(0, 3);
  const rest = movies.slice(3);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-0)" }}>
      <Navbar />

      {/* Grid lines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: PAGE_PX,
            width: 1,
            background: "var(--line)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: PAGE_PX + MARGIN_COL,
            width: 1,
            background: "var(--line)",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: PAGE_PX,
            width: 1,
            background: "var(--line)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: NAV_H,
            left: 0,
            right: 0,
            height: 1,
            background: "var(--line)",
          }}
        />
      </div>

      {/* Left margin annotation */}
      <div
        style={{
          position: "fixed",
          top: NAV_H + 80,
          bottom: 80,
          left: 0,
          width: PAGE_PX,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 4,
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--fg-4)",
          }}
        >
          Global · Rankings
        </span>
      </div>

      <div
        style={{ padding: `${NAV_H + 32}px ${PAGE_PX + MARGIN_COL}px 96px` }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 48 }}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 2,
                background: "var(--accent)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Global Rankings
            </span>
          </motion.div>

          {/* Big headline with contrast sizes */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            style={{ position: "relative" }}
          >
            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: -10,
                fontSize: "clamp(60px, 10vw, 120px)",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "var(--line)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              ★
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.025em",
                textTransform: "uppercase",
              }}
            >
              The
              <br />
              <span style={{ color: "var(--accent)" }}>Rankings</span>
            </h1>
          </motion.div>

          {/* Stats bar */}
          {stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
                background: "var(--border)",
                marginTop: 24,
              }}
              className="md:grid-cols-4"
            >
              {[
                {
                  label: "Total Battles",
                  value: stats.total_comparisons.toLocaleString(),
                },
                { label: "Films", value: stats.total_movies.toLocaleString() },
                {
                  label: "Avg / Film",
                  value: String(stats.avg_comparisons_per_movie),
                },
                {
                  label: "On Leaderboard",
                  value: stats.movies_on_leaderboard.toLocaleString(),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--surface-1)",
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 900,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "var(--fg-4)",
                    }}
                  >
                    {s.label}
                  </span>
                  <LiveNum
                    value={s.value}
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "var(--fg)",
                    }}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {isLoading && <LoadingSkeleton count={8} />}
        {isError && (
          <div style={{ padding: "64px 0", textAlign: "center" }}>
            <p
              style={{
                fontWeight: 700,
                marginBottom: 16,
                color: "var(--fg-2)",
              }}
            >
              Failed to load rankings
            </p>
            <button
              onClick={() => refetch()}
              style={{
                padding: "7px 20px",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {movies.length > 0 && (
          <>
            {/* ── Podium ── */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ marginBottom: 52 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "var(--fg-4)",
                  }}
                >
                  Podium
                </span>
                <div
                  style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
              </div>
              {/* Layout: #1 far left, #2 center-offset, #3 right — intentionally irregular */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 20,
                  justifyContent: "flex-start",
                }}
              >
                {top3[0] && <PodiumCard movie={top3[0]} rank={1} />}
                <div style={{ width: 32, flexShrink: 0 }} />{" "}
                {/* deliberate gap */}
                {top3[1] && <PodiumCard movie={top3[1]} rank={2} />}
                {top3[2] && <PodiumCard movie={top3[2]} rank={3} />}
              </div>
            </motion.section>

            {/* ── Rankings table ── */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 900,
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      color: "var(--fg-4)",
                    }}
                  >
                    All Films
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 1,
                      background: "var(--border)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[0, 5, 10, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMinComp(n)}
                      style={{
                        width: 28,
                        height: 24,
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: "pointer",
                        transition: "all 0.14s",
                        ...(minComp === n
                          ? {
                              background: "var(--accent)",
                              color: "var(--paper)",
                              border: "none",
                            }
                          : {
                              background: "transparent",
                              color: "var(--fg-3)",
                              border: "1px solid var(--border)",
                            }),
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 38px 1fr 64px 100px 64px",
                  gap: 10,
                  padding: "7px 12px",
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["#", "", "Film", "Rating", "Win Rate", "Battles"].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: 7,
                      fontWeight: 900,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "var(--fg-4)",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {rest.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.26 + i * 0.016, duration: 0.28 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 38px 1fr 64px 100px 64px",
                    gap: 10,
                    padding: "9px 12px",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      color: movie.rank <= 3 ? "var(--accent)" : "var(--fg-4)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(movie.rank).padStart(2, "0")}
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 40,
                      background: "var(--surface-2)",
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {movie.poster_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--fg)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.005em",
                        marginBottom: 2,
                      }}
                    >
                      {movie.title}
                    </p>
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "var(--fg-3)",
                      }}
                    >
                      {movie.release_year}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--fg)",
                    }}
                  >
                    {Math.round(movie.elo_rating)}
                  </span>
                  <WinBar rate={Number(movie.win_rate)} rank={movie.rank} />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--fg-2)",
                    }}
                  >
                    {movie.total_comparisons.toLocaleString()}
                  </span>
                </motion.div>
              ))}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                <div
                  style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "var(--fg-4)",
                  }}
                >
                  {movies.length} films ranked
                </span>
                <div
                  style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
              </div>
            </section>

            {/* ── Hall of Fame ── */}
            {stats && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                style={{ marginTop: 52 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 2,
                      background: "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                    }}
                  >
                    Hall of Fame
                  </span>
                  <div
                    style={{ flex: 1, height: 1, background: "var(--border)" }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(1, 1fr)",
                    gap: 1,
                    background: "var(--border)",
                  }}
                  className="sm:grid-cols-2 lg:grid-cols-3"
                >
                  <HofCard
                    icon="⚔"
                    label="Most Battles"
                    movie={stats.most_compared_movie}
                    stat={`${stats.most_compared_count?.toLocaleString() ?? "—"} battles`}
                    delay={0.05}
                  />
                  <HofCard
                    icon="🏆"
                    label="Most Wins"
                    movie={stats.most_wins_movie}
                    stat={`${stats.most_wins_count?.toLocaleString() ?? "—"} wins`}
                    delay={0.1}
                  />
                  <HofCard
                    icon="★"
                    label="Highest Rated"
                    movie={stats.highest_rated_movie}
                    stat={`${stats.highest_rated_score ?? "—"} ELO`}
                    delay={0.15}
                  />
                  <HofCard
                    icon="🔥"
                    label="Most Dominant"
                    movie={stats.most_dominant_movie}
                    stat={`${stats.most_dominant_rate ?? "—"}% win rate`}
                    delay={0.2}
                  />
                  <HofCard
                    icon="🛡"
                    label="The Underdog"
                    movie={stats.underdog_movie}
                    stat={`${stats.underdog_score ?? "—"} ELO · still fighting`}
                    delay={0.25}
                  />
                  <HofCard
                    icon="◎"
                    label="Hottest Right Now"
                    movie={stats.hottest_movie}
                    stat="On a streak"
                    delay={0.3}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <motion.div
                    style={{
                      width: 4,
                      height: 4,
                      background: "var(--accent)",
                      transform: "rotate(45deg)",
                    }}
                    animate={{ opacity: [1, 0.28, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 800,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--fg-4)",
                    }}
                  >
                    Live · Updates every 8 seconds
                  </span>
                </div>
              </motion.section>
            )}
          </>
        )}

        {!isLoading && !isError && movies.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 8,
                color: "var(--fg)",
              }}
            >
              No rankings yet
            </p>
            <p style={{ fontSize: 13, color: "var(--fg-2)" }}>
              Start battling films to build the rankings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
