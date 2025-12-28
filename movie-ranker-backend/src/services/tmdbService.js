const axios = require("axios");
require("dotenv").config();

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
    this.imageBaseURL = "https://image.tmdb.org/t/p";
  }

  //Get popular movies from TMDB
  async getPopularMovies(page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/popular`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        params: {
          page,
          language: "en-US",
        },
      });

      return response.data.results.map((movie) => this.formatMovie(movie));
    } catch (error) {
      console.error("Error fetching popular movies:", error.message);
      throw error;
    }
  }

  //Get top rated movies from TMDB
  async getTopRatedMovies(page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/top_rated`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        params: {
          page,
          language: "en-US",
        },
      });

      return response.data.results.map((movie) => this.formatMovie(movie));
    } catch (error) {
      console.error("Error fetching top rated movies:", error.message);
      throw error;
    }
  }

  // movie details by tmdbid
  async getMovieDetails(tmdbId) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/${tmdbId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        params: {
          language: "en-US",
        },
      });

      return this.formatMovie(response.data);
    } catch (error) {
      console.error(`Error fetching movie ${tmdbId}:`, error.message);
      throw error;
    }
  }

  //Format movie data for our db
  formatMovie(movie) {
    return {
      tmdb_id: movie.id,
      title: movie.title,
      release_year: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : null,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
    };
  }

  // full image URL
  getImageURL(path, size = "w500") {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }
}

module.exports = new TMDBService();
