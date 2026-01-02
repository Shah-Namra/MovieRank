"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Subheading } from "@/components/ui/subheading";
import MoviePoster from "./Home/movie-poster";
import VersusDisplay from "./versus-display";
import LoadingState from "./loading-state";
import ErrorState from "./error-state";
import { useMoviePair, useCompare } from "@/hooks/useMovies";
import { Sparkles } from "lucide-react";

export default function Hero() {
  const { data, isLoading, isError, refetch } = useMoviePair();
  const compareMutation = useCompare();
  const [isComparing, setIsComparing] = useState(false);

  const handleVote = async (winnerId: number, loserId: number) => {
    setIsComparing(true);
    try {
      await compareMutation.mutateAsync({ winnerId, loserId });
      // Wait a bit for smooth transition
      setTimeout(() => {
        setIsComparing(false);
      }, 600);
    } catch (error) {
      setIsComparing(false);
      console.error("Vote failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const movie1 = data?.data.movie1;
  const movie2 = data?.data.movie2;

  return (
    <div className="min-h-screen pt-16">
      <Container>
        {/* Header section */}
        <div className="text-center pt-20 pb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Movie Battle
            </span>
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </motion.div>

          <Heading>Which movie reigns supreme?</Heading>
          <Subheading>
            Choose your favorite and watch the rankings evolve
          </Subheading>
        </div>

        {/* Battle section */}
        <AnimatePresence mode="wait">
          {movie1 && movie2 && (
            <motion.div
              key={`${movie1.id}-${movie2.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-0 items-center">
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
                  />
                </div>

                {/* VS Display */}
                <VersusDisplay />

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
                  />
                </div>
              </div>

              {/* Stats footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 text-center"
              >
                <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/60 font-medium uppercase tracking-wide">
                      Comparisons
                    </span>
                    <span className="text-lg font-bold text-white">
                      {movie1.total_comparisons + movie2.total_comparisons}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-white/60 font-medium uppercase tracking-wide">
                      Rating Diff
                    </span>
                    <span className="text-lg font-bold text-white">
                      {Math.abs(
                        Math.round(movie1.elo_rating - movie2.elo_rating)
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
