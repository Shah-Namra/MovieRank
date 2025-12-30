const db = require("../config/database");
const tmdbService = require("../services/tmdbService");

const seedMovies = async () => {
  const client = await db.pool.connect();

  try {
    console.log("start movie db seeding...");

    // Check if movies already exist
    const existingMovies = await client.query("SELECT COUNT(*) FROM movies");
    const count = parseInt(existingMovies.rows[0].count);

    if (count > 0) {
      console.log(`db already contains ${count} movies.`);
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        readline.question("Do you want to add more movies? (y/n): ", resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== "y") {
        console.log("Seeding cancelled.");
        return;
      }
    }

    console.log("Fetching movies from TMDB...");

    const allMovies = [];

    // popular movies
    for (let page = 1; page <= 3; page++) {
      console.log(`Fetching popular movies page ${page}...`);
      const movies = await tmdbService.getPopularMovies(page);
      allMovies.push(...movies);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    // top rated movies
    for (let page = 1; page <= 3; page++) {
      console.log(`Fetching top rated movies page ${page}...`);
      const movies = await tmdbService.getTopRatedMovies(page);
      allMovies.push(...movies);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    // Remove duplicates based on tmdbid
    const uniqueMovies = allMovies.reduce((acc, movie) => {
      if (!acc.find((m) => m.tmdb_id === movie.tmdb_id)) {
        acc.push(movie);
      }
      return acc;
    }, []);

    console.log(`Found ${uniqueMovies.length} unique movies.`);
    console.log("insert into db...");

    let inserted = 0;
    let skipped = 0;

    for (const movie of uniqueMovies) {
      try {
        await client.query(
          `INSERT INTO movies (tmdb_id, title, release_year, poster_path, backdrop_path, overview)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (tmdb_id) DO NOTHING`,
          [
            movie.tmdb_id,
            movie.title,
            movie.release_year,
            movie.poster_path,
            movie.backdrop_path,
            movie.overview,
          ]
        );
        inserted++;

        if (inserted % 10 === 0) {
          process.stdout.write(`\rInserted ${inserted} movies...`);
        }
      } catch (error) {
        skipped++;
        console.log(`\nSkipped ${movie.title}: ${error.message}`);
      }
    }

    console.log("Seeding complete!");
    console.log(`Inserted: ${inserted} movies`);
    console.log(`Skipped: ${skipped} movies duplicates or errors)`);

    // Show stats
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        AVG(elo_rating) as avg_rating,
        MIN(elo_rating) as min_rating,
        MAX(elo_rating) as max_rating
      FROM movies
    `);

    console.log("DB Stats:");
    console.log(`Total movies: ${stats.rows[0].total}`);
    console.log(
      `Avg Elo rating: ${parseFloat(stats.rows[0].avg_rating).toFixed(2)}`
    );
    console.log(
      ` Rating range: ${stats.rows[0].min_rating} - ${stats.rows[0].max_rating}`
    );
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedMovies()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedMovies;
