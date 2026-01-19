"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Subheading } from "@/components/ui/subheading";
import { MoviePoster } from "@/components/Home/movie-poster";
import { VersusDisplay } from "@/components/versus-display";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { BoltIcon } from "@/components/icons";
import { useMoviePair, useCompare } from "@/hooks/useMovies";

// Skip Icon - Heroicons
const SkipIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 5l7 7-7 7M5 5l7 7-7 7"
    />
  </svg>
);

export function Hero() {
  const { data, isLoading, isError, refetch } = useMoviePair();
  const compareMutation = useCompare();
  const [isComparing, setIsComparing] = useState(false);

  const handleVote = async (winnerId: number, loserId: number) => {
    setIsComparing(true);
    try {
      await compareMutation.mutateAsync({ winnerId, loserId });
      setTimeout(() => setIsComparing(false), 500);
    } catch (error) {
      setIsComparing(false);
      console.error("Vote failed:", error);
    }
  };

  const handleSkip = () => {
    refetch();
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-background">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-background">
        <ErrorState onRetry={handleRetry} />
      </div>
    );
  }

  const movie1 = data?.data.movie1;
  const movie2 = data?.data.movie2;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Navbar spacer */}
      <div className="h-16 shrink-0" />

      <Container className="flex-1 flex flex-col py-3 sm:py-4 overflow-hidden">
        {/* Header Section - Very Compact */}
        <div className="text-center space-y-2 sm:space-y-3 shrink-0">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border"
          >
            <BoltIcon className="h-3 w-3 text-gold" />
            <span className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wider">
              Movie Battle
            </span>
          </motion.div>

          {/* Heading - Very Compact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <Heading className="text-foreground text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Which movie reigns supreme?
            </Heading>
          </motion.div>

          {/* Subheading - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Choose your favorite and watch the rankings evolve
            </p>
          </motion.div>
        </div>

        {/* Battle Section - Flex grow to fill space */}
        <AnimatePresence mode="wait">
          {movie1 && movie2 && (
            <motion.div
              key={`${movie1.id}-${movie2.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-3 sm:py-4"
            >
              {/* Movie Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-3 lg:gap-4 items-center">
                {/* Movie 1 */}
                <div className="flex justify-center md:justify-end">
                  <MoviePoster
                    title={movie1.title}
                    year={movie1.release_year}
                    posterPath={movie1.poster_path}
                    rating={movie1.elo_rating}
                    onClick={() => handleVote(movie1.id, movie2.id)}
                    disabled={isComparing}
                    position="left"
                    compact
                  />
                </div>

                {/* VS Display */}
                <VersusDisplay compact />

                {/* Movie 2 */}
                <div className="flex justify-center md:justify-start">
                  <MoviePoster
                    title={movie2.title}
                    year={movie2.release_year}
                    posterPath={movie2.poster_path}
                    rating={movie2.elo_rating}
                    onClick={() => handleVote(movie2.id, movie1.id)}
                    disabled={isComparing}
                    position="right"
                    compact
                  />
                </div>
              </div>

              {/* Stats + Skip Section - All in one line on desktop */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0">
                {/* Stats - Inline */}
                <div className="flex items-center divide-x divide-border rounded-xl bg-card border border-border shadow-sm">
                  <div className="px-4 py-2">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Battles
                    </div>
                    <div className="text-lg font-bold text-foreground tabular-nums">
                      {(
                        movie1.total_comparisons + movie2.total_comparisons
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className="px-4 py-2">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Rating Diff
                    </div>
                    <div className="text-lg font-bold text-foreground tabular-nums">
                      {Math.abs(
                        Math.round(movie1.elo_rating - movie2.elo_rating),
                      )}
                    </div>
                  </div>
                </div>

                {/* Skip Button */}
                <motion.button
                  onClick={handleSkip}
                  disabled={isComparing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-border"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipIcon />
                  <span>Skip</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
