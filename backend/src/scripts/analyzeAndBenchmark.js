/**
 * ANALYZE + full end-to-end benchmark.
 * Measures: pair query, compare transaction, and total perceived latency.
 * Usage: node src/scripts/analyzeAndBenchmark.js
 */
require("dotenv").config();
const db = require("../config/database");
const MovieService = require("../services/movieService");

async function bench(label, fn, runs = 5) {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const t = Date.now();
    await fn();
    times.push(Date.now() - t);
  }
  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = Math.round(times.reduce((a, b) => a + b) / runs);
  console.log(
    `  ${label.padEnd(28)} min=${String(min).padStart(4)}ms  avg=${String(avg).padStart(4)}ms  max=${String(max).padStart(4)}ms`,
  );
  return avg;
}

async function run() {
  console.log("Running ANALYZE...");
  await db.query("ANALYZE movies");
  await db.query("ANALYZE comparisons");
  console.log("✓ Done\n");

  console.log("─── Benchmark (5 runs each) ───────────────────────────────");

  // 1. Pair query
  const avgPair = await bench("GET /api/movies/pair", () =>
    MovieService.getRandomPair(),
  );

  // 2. Compare transaction — grab a real pair first
  const pair = await MovieService.getRandomPair();
  const avgCompare = await bench("POST /api/movies/compare", () =>
    MovieService.recordComparison(pair.movie1.id, pair.movie2.id),
  );

  // 3. Simulate full user flow: click → compare fires → prefetch pair fires in parallel
  const avgFlow = await bench("Full flow (compare ∥ pair)", async () => {
    const p = await MovieService.getRandomPair();
    await Promise.all([
      MovieService.recordComparison(p.movie1.id, p.movie2.id),
      MovieService.getRandomPair(),
    ]);
  });

  console.log("───────────────────────────────────────────────────────────\n");

  const perceived = avgCompare; // The compare blocks UI; pair is parallel
  console.log(`Estimated perceived latency after click: ~${perceived}ms`);
  console.log(`(compare runs in foreground; pair prefetch runs in parallel)\n`);

  if (perceived < 300) console.log("✓ Excellent — users feel instant response");
  else if (perceived < 600) console.log("✓ Good — noticeable but acceptable");
  else if (perceived < 1200)
    console.log("⚠ Sluggish — likely cross-region DB. See below.");
  else console.log("✗ Slow — cross-region or cold connection issue.");

  console.log(`
Round-trip analysis:
  OLD: 5 sequential queries × ${avgPair}ms RTT ≈ ${5 * avgPair}ms per vote
  NEW: 2 queries (fetch ratings + 1 CTE transaction) ≈ ${avgCompare}ms per vote
  Improvement: ~${Math.round((5 * avgPair) / avgCompare)}x faster transaction

If avg > 400ms:
  → Your backend and DB are in different regions (most common cause).
  → Fix: redeploy backend to same region as DB (Render, Railway, Fly.io all let you pick).
  → On Render: Settings → Region. Match it to your Postgres region exactly.
  → This alone typically cuts 200-600ms off every query.

If avg < 400ms and frontend still feels slow:
  → Check CORS preflight — OPTIONS request adds one extra RTT before every POST.
  → Add: res.header('Access-Control-Max-Age', '86400') to cache preflight for 24h.
  `);

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
