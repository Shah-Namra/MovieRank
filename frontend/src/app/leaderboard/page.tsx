"use client";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Subheading } from "@/components/ui/subheading";
import Navbar from "@/components/navbar";
import LeaderboardCard from "@/components/leaderboard-card";
import LoadingState, { LoadingSkeleton } from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import { useLeaderboard } from "@/hooks/useMovies";
import { motion } from "framer-motion";
import { Trophy, Award } from "lucide-react";

export default function LeaderboardPage() {
  const { data, isLoading, isError, refetch } = useLeaderboard(50, 20);

  return (
    <div className="min-h-screen font-display">
      <Navbar />
      <div className="pt-16">
        <Container>
          {/* Header */}
          <div className="text-center pt-20 pb-12 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Award className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                Top Ranked
              </span>
              <Award className="h-5 w-5 text-yellow-400" />
            </motion.div>

            <Heading>Movie Leaderboard</Heading>
            <Subheading>
              The ultimate ranking based on head-to-head battles
            </Subheading>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto pb-20">
            {isLoading && <LoadingSkeleton count={10} />}

            {isError && (
              <ErrorState
                title="Failed to load leaderboard"
                message="Unable to fetch rankings. Please try again."
                onRetry={() => refetch()}
              />
            )}

            {data?.data.movies && data.data.movies.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                {/* Stats header */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-white/80">
                      {data.data.movies.length} Movies Ranked
                    </span>
                  </div>
                  <span className="text-xs text-white/50">
                    Minimum {data.data.meta.minComparisons} comparisons
                  </span>
                </div>

                {/* Leaderboard cards */}
                {data.data.movies.map((movie, index) => (
                  <LeaderboardCard
                    key={movie.id}
                    rank={movie.rank}
                    title={movie.title}
                    year={movie.release_year}
                    posterPath={movie.poster_path}
                    rating={movie.elo_rating}
                    totalComparisons={movie.total_comparisons}
                    winRate={parseFloat(movie.win_rate)}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {data?.data.movies && data.data.movies.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/60">
                  No movies have enough comparisons yet. Start voting!
                </p>
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
