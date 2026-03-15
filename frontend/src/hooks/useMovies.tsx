import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  release_year: number;
  poster_path: string;
  elo_rating: number;
  total_comparisons: number;
  wins: number;
  losses: number;
  win_rate: string;
  rank: number;
}

interface MoviePairResponse {
  success: boolean;
  data: { movie1: Movie; movie2: Movie; ratingDifference: number };
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    movies: Movie[];
    meta: { total: number; minComparisons: number; limit: number };
  };
}

interface CompareResponse {
  success: boolean;
  data: {
    winner: {
      id: number;
      ratingChange: number;
      newRating: number;
      oldRating: number;
    };
    loser: {
      id: number;
      ratingChange: number;
      newRating: number;
      oldRating: number;
    };
  };
}

export interface StatsData {
  // Global
  total_comparisons: number;
  total_movies: number;
  movies_on_leaderboard: number;
  avg_comparisons_per_movie: number;
  // Hall of fame
  most_compared_movie: string;
  most_compared_count: number;
  most_wins_movie: string;
  most_wins_count: number;
  highest_rated_movie: string;
  highest_rated_score: number;
  most_dominant_movie: string;
  most_dominant_rate: number;
  underdog_movie: string;
  underdog_score: number;
  hottest_movie: string;
}

// ── Movie pair ────────────────────────────────────────────────
export function useMoviePair() {
  return useQuery<MoviePairResponse>({
    queryKey: ["moviePair"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/pair`);
      if (!res.ok) throw new Error("Failed to fetch movie pair");
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

// ── Compare / vote ────────────────────────────────────────────
export function useCompare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      winnerId,
      loserId,
    }: {
      winnerId: number;
      loserId: number;
    }) => {
      const res = await fetch(`${API_BASE}/movies/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, loserId }),
      });
      if (!res.ok) throw new Error("Failed to submit vote");
      return res.json() as Promise<CompareResponse>;
    },
    onSuccess: () => {
      // Invalidate everything that changes after a vote
      queryClient.invalidateQueries({ queryKey: ["moviePair"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      // Stats update immediately after a vote — users see live numbers
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ── Leaderboard ───────────────────────────────────────────────
export function useLeaderboard(limit = 50, minComparisons = 0) {
  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", limit, minComparisons],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/movies/leaderboard?limit=${limit}&minComparisons=${minComparisons}`,
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}

// ── Stats — polls every 8s AND invalidated on every vote ─────
// This gives real-time feel: numbers update after your own vote
// immediately (via invalidation) and also pick up other users'
// votes within 8 seconds (via polling).
export function useStats() {
  return useQuery<{ success: boolean; data: StatsData }>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 5000,
    refetchInterval: 8000, // poll every 8s for other users' activity
    refetchIntervalInBackground: false, // don't poll when tab is hidden
  });
}

// ── Single movie ──────────────────────────────────────────────
export function useMovie(id: string | number) {
  return useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/movies/${id}`);
      if (!res.ok) throw new Error("Failed to fetch movie");
      const data = await res.json();
      return data.success ? data.data : data;
    },
    enabled: !!id,
  });
}

// ── Movie history ─────────────────────────────────────────────
export function useMovieHistory(id: string | number, limit = 20) {
  return useQuery({
    queryKey: ["movieHistory", id, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/movies/${id}/history?limit=${limit}`,
      );
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      return data.success ? data.data.history : data;
    },
    enabled: !!id,
  });
}
