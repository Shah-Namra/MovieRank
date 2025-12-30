# Movie Ranker - Elo-Based Movie Comparison System

A head-to-head movie comparison application inspired by chess ratings. Choose between two movies, and watch the rankings evolve through the Elo rating system. Born from a love of both chess and cinema, this project brings competitive ranking mechanics to movie preferences.

## Table of Contents

- [Project Vision](#project-vision)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Current Progress](#current-progress)

## Project Vision

This project combines chess rating algorithms with movie comparisons. Instead of traditional star ratings, movies earn their ranks through direct matchups just like chess players. Starting small with a curated collection, the system learns preferences through repeated comparisons.

## How It Works

### The Elo Rating System

Every movie starts at **1500 points**. When users compare two movies:

- Winner gains points, loser loses points
- Amount gained/lost depends on rating difference
- Upset victories (lower-rated beating higher-rated) result in bigger point swings
- Expected outcomes result in smaller changes

**Formula**: `new_rating = old_rating + K × (actual_score - expected_score)`

**Expected Score**: `E = 1 / (1 + 10^((opponent_rating - own_rating) / 400))`

### Smart Pairing Strategy

Movies aren't paired randomly. The system uses **weighted pairing**:

- Movies with similar ratings match more frequently
- Weight formula: `1 / (1 + |rating_difference| / 200)`
- Creates competitive matchups while allowing occasional cross-tier battles
- Prevents top movies from constantly facing weak opponents

### K-Factor (Rating Volatility)

Different movies adjust at different speeds:

- **K=40**: New movies (<30 comparisons) - Fast calibration
- **K=32**: Established movies - Normal adjustment
- **K=20**: Elite/bottom tier (>100 comparisons, rating >1700 or <1300) - Stability

For preventing rating inflation/deflation and ensures fair rankings.

## Tech Stack

**Backend**

- Node.js + Express
- PostgreSQL
- TMDB API - Movie metadata and posters

## System Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP/JSON
┌──────▼──────────────────┐
│   Express API Server    │
│  - Rate Limiting        │
│  - Request Validation   │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│   Movie Service         │
│  - Elo Calculations     │
│  - Pairing Logic        │
│  - Transaction Mgmt     │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│  PostgreSQL             │
│  - movies table         │
│  - comparisons history  │
│  - Indexed queries      │
└─────────────────────────┘

```

**Database Design**:

- `movies` table: Stores ratings, win/loss records, TMDB metadata
- `comparisons` table: Full history with before/after ratings
- Composite indexes on (elo_rating, total_comparisons) for fast leaderboards
- SELECT FOR UPDATE locks prevent concurrent modification conflicts

## Getting Started

### Prerequisites

- Node, PostgreSQL
- TMDB API key ([get free key](https://www.themoviedb.org/settings/api))

### Clone & Setup

```bash
# Clone repository
git clone repolink
cd movie-ranker-backend

npm install

cp .env.example .env

npm run db:setup

npm run db:seed

npm run dev

```

Server runs at `http://localhost:3000`

## API Endpoints

| Endpoint                  | Method | Description                                               |
| ------------------------- | ------ | --------------------------------------------------------- |
| `/health`                 | GET    | Server health check                                       |
| `/api/movies/pair`        | GET    | Two movies for comparison (weighted by rating similarity) |
| `/api/movies/compare`     | POST   | Record comparison result and update Elo ratings           |
| `/api/movies/leaderboard` | GET    | Top-ranked movies (min 20 comparisons by default)         |
| `/api/movies/:id`         | GET    | Detailed stats for a specific movie                       |
| `/api/movies/:id/history` | GET    | Recent comparison history for a movie                     |

**Example Usage**:

```bash
# Get a pair to compare
curl http://localhost:3000/api/movies/pair

# Record a vote (movie 5 beats movie 12)
curl -X POST http://localhost:3000/api/movies/compare \
  -H "Content-Type: application/json" \
  -d '{"winnerId": 5, "loserId": 12}'

# View leaderboard
curl http://localhost:3000/api/movies/leaderboard

```

## Current Progress

**Phase 1: Backend Foundation**

- [x] PostgreSQL schema with optimized indexes
- [x] Elo rating calculation engine
- [x] Weighted pairing algorithm
- [x] Atomic transaction handling for concurrent votes
- [x] TMDB integration for movie data
- [x] RESTful API with rate limiting
- [x] Cloud database deployment (Neon)

**Phase 2: Frontend**

- [ ] Frontend

**Future Enhancements**

- [ ] User accounts and personal rankings
- [ ] Genre-specific leaderboards
- [ ] Historical rating graphs
- [ ] Export/share features

## Changelog

### Phase 1.1 - Elo Algorithm Improvements (Dec 2024)

- K-factor asymmetry to preserve rating conservation (zero-sum system)
- smooth K-factor decay (exponential curve instead of step function)
- Added rating bounds (800-2200) to prevent extreme outliers
- Improved pairing algorithm with steeper exponential falloff and 500-point cap
