import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false
});

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

function auth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Non connecté"
    });
  }

  try {
    req.user = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );

    next();
  } catch {
    return res.status(401).json({
      error: "Session invalide"
    });
  }
}

app.get("/", (req, res) => {
  res.send("EclipseSMP API online");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true
  });
});

app.post("/api/auth/register", async (req, res) => {
  const {
    email,
    password,
    minecraftUsername
  } = req.body;

  if (!email || !password || !minecraftUsername) {
    return res.status(400).json({
      error: "Champs manquants"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Mot de passe trop court"
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users
      (email, password_hash, minecraft_username)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [
        email.toLowerCase(),
        passwordHash,
        minecraftUsername
      ]
    );

    res.json({
      ok: true,
      id: result.rows[0].id
    });

  } catch {
    res.status(400).json({
      error: "Email ou pseudo déjà utilisé"
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase();

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({
      error: "Email ou mot de passe incorrect"
    });
  }

  const validPassword = await bcrypt.compare(
    req.body.password || "",
    user.password_hash
  );

  if (!validPassword) {
    return res.status(401).json({
      error: "Email ou mot de passe incorrect"
    });
  }

  res.json({
    token: signToken(user)
  });
});

app.get("/api/me", auth, async (req, res) => {
  const result = await db.query(
    `
    SELECT
      u.email,
      u.minecraft_username,
      COALESCE(p.rank_name, 'default') AS rank_name,
      COALESCE(p.money, 0) AS money,
      COALESCE(p.shards, 0) AS shards,
      COALESCE(p.kills, 0) AS kills,
      COALESCE(p.deaths, 0) AS deaths,
      COALESCE(p.playtime_seconds, 0) AS playtime_seconds
    FROM users u
    LEFT JOIN player_stats p
      ON p.user_id = u.id
    WHERE u.id = $1
    `,
    [req.user.sub]
  );

  const player = result.rows[0];

  if (!player) {
    return res.status(404).json({
      error: "Compte introuvable"
    });
  }

  player.playtime =
    Math.floor(
      Number(player.playtime_seconds) / 3600
    ) + "h";

  res.json(player);
});

app.get("/api/leaderboard", async (req, res) => {
  const allowed = new Set([
    "money",
    "shards",
    "kills",
    "deaths",
    "playtime"
  ]);

  const type = allowed.has(req.query.type)
    ? req.query.type
    : "money";

  const column =
    type === "playtime"
      ? "playtime_seconds"
      : type;

  try {
    const result = await db.query(
      `
      SELECT
        u.minecraft_username,
        p.rank_name,
        p.${column} AS value
      FROM player_stats p
      JOIN users u
        ON u.id = p.user_id
      ORDER BY p.${column} DESC NULLS LAST
      LIMIT 50
      `
    );

    res.json(result.rows);

  } catch {
    res.status(500).json({
      error: "Base de données indisponible"
    });
  }
});

app.listen(
  process.env.PORT || 3000,
  () => {
    console.log("EclipseSMP API online");
  }
);
