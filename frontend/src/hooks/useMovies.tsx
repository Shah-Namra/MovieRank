import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:3000/api";

interface Movie {
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
  data: {
    movie1: Movie;
    movie2: Movie;
    ratingDifference: number;
  };
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    movies: Movie[];
    meta: {
      total: number;
      minComparisons: number;
      limit: number;
    };
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

// Fetch movie pair for comparison
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

// Submit comparison vote
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
      const data: CompareResponse = await res.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate to get new pair
      queryClient.invalidateQueries({ queryKey: ["moviePair"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// Fetch leaderboard
export function useLeaderboard(limit = 50, minComparisons = 20) {
  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", limit, minComparisons],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/movies/leaderboard?limit=${limit}&minComparisons=${minComparisons}`
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}

// Fetch single movie details
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

// Fetch movie comparison history
export function useMovieHistory(id: string | number, limit = 20) {
  return useQuery({
    queryKey: ["movieHistory", id, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/movies/${id}/history?limit=${limit}`
      );
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      return data.success ? data.data.history : data;
    },
    enabled: !!id,
  });
}
