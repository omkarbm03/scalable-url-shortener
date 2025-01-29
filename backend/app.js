require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const Redis = require("ioredis");
const { nanoid } = require("nanoid");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to the URL Shortener API!");
  });
  

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Redis connection
const redis = new Redis(process.env.REDIS_URL);

// Shorten URL Route
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: "URL is required" });

  const shortId = nanoid(7);
  await pool.query("INSERT INTO urls (short_id, original_url) VALUES ($1, $2)", [shortId, originalUrl]);

  res.json({ shortUrl: `${process.env.BASE_URL}/${shortId}` });
});

// Redirect Route
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  // Check Redis cache first
  const cachedUrl = await redis.get(shortId);
  if (cachedUrl) return res.redirect(cachedUrl);

  // If not in cache, check database
  const result = await pool.query("SELECT original_url FROM urls WHERE short_id = $1", [shortId]);
  if (result.rows.length === 0) return res.status(404).json({ error: "URL not found" });

  // Store in cache and redirect
  redis.set(shortId, result.rows[0].original_url, "EX", 86400);
  res.redirect(result.rows[0].original_url);
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
