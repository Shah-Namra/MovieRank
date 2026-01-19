"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Subheading } from "@/components/ui/subheading";
import { Navbar } from "@/components/navbar";
import { TrophyIcon, StarIcon, FilmIcon, ChartIcon } from "@/components/icons";
import { LoadingSkeleton } from "@/components/loading-state";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLeaderboard } from "@/hooks/useMovies";
import { useState } from "react";

function getRankStyle(rank: number) {
  if (rank === 1) return "badge-gold";
  if (rank === 2) return "badge-silver";
  if (rank === 3) return "badge-bronze";
  return "bg-muted text-muted-foreground";
}

export default function Leaderboard() {
  const [minComparisons, setMinComparisons] = useState(20);
  const { data, isLoading, isError, refetch } = useLeaderboard(
    50,
    minComparisons,
  );

  const movies = data?.data.movies;
  const meta = data?.data.meta;

  // CONSOLE Log data when it arrives
  console.log("Leaderboard data:", {
    hasData: !!data,
    moviesCount: movies?.length,
    meta,
    isLoading,
    isError,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <Container>
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6"
            >
              <TrophyIcon className="h-4 w-4 text-gold" strokeWidth={2} />
              <span className="text-xs font-bold text-accent-foreground uppercase tracking-wider">
                Top Ranked
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Heading as="h1" className="mb-4">
                Movie Leaderboard
              </Heading>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Subheading>
                The ultimate ranking based on head-to-head battles
              </Subheading>
            </motion.div>

            {/* CONSOLE LOG: Min Comparisons Selector (Remove this in PROD) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center justify-center gap-2"
            >
              <span className="text-sm text-muted-foreground">
                Min battles:
              </span>
              {[0, 5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setMinComparisons(num)}
                  className={`px-3 py-1 text-sm rounded-lg font-semibold transition-colors ${
                    minComparisons === num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {num}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Loading State */}
          {isLoading && <LoadingSkeleton count={8} />}

          {/* Error State */}
          {isError && (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                  Failed to load leaderboard
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-6">
                  Unable to fetch rankings. Please try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {movies && movies.length > 0 && (
            <>
              {/* Stats Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-card border border-border shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <ChartIcon
                    className="h-5 w-5 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {movies.length} Movies Ranked
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  Minimum {meta?.minComparisons || minComparisons} battles
                  requiredz
                </span>
              </motion.div>

              {/* Movie List */}
              <div className="space-y-2">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.04, duration: 0.4 }}
                    className="group card-interactive rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 p-4">
                      {/* Rank Badge */}
                      <div
                        className={cn(
                          "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0",
                          getRankStyle(movie.rank),
                        )}
                      >
                        #{movie.rank}
                      </div>

                      {/* Poster */}
                      <div className="relative w-10 h-14 sm:w-12 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                        {movie.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                            width={92}
                            height={138}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-secondary">
                            <FilmIcon
                              className="h-5 w-5 text-muted-foreground/40"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </div>

                      {/* Movie Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate text-sm sm:text-base leading-snug">
                          {movie.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                          {movie.release_year}
                        </p>
                      </div>

                      {/* Stats - Desktop */}
                      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
                        <div className="text-center min-w-15">
                          <div className="flex items-center justify-center gap-1.5 text-foreground font-bold mb-0.5">
                            <StarIcon
                              className="h-3.5 w-3.5 text-gold"
                              filled
                            />
                            <span className="tabular-nums">
                              {Math.round(movie.elo_rating)}
                            </span>
                          </div>
                          <div className="stat-label">Rating</div>
                        </div>

                        <div className="text-center min-w-12">
                          <div className="text-foreground font-bold tabular-nums mb-0.5">
                            {movie.win_rate}%
                          </div>
                          <div className="stat-label">Win Rate</div>
                        </div>

                        <div className="text-center min-w-12">
                          <div className="text-foreground font-bold tabular-nums mb-0.5">
                            {movie.total_comparisons.toLocaleString()}
                          </div>
                          <div className="stat-label">Battles</div>
                        </div>
                      </div>

                      {/* Stats - Mobile */}
                      <div className="md:hidden text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5 text-foreground font-bold mb-1">
                          <StarIcon className="h-3 w-3 text-gold" filled />
                          <span className="tabular-nums text-sm">
                            {Math.round(movie.elo_rating)}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                          {movie.total_comparisons.toLocaleString()} battles
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {movies && movies.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                <TrophyIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Rankings Yet
              </h3>
              <p className="text-muted-foreground">
                Movies need at least {meta?.minComparisons || minComparisons}{" "}
                battles to appear here.
                <br />
                Try lowering the minimum battles requirement above, or start
                voting!
              </p>
            </motion.div>
          )}
        </Container>
      </div>
    </div>
  );
}
