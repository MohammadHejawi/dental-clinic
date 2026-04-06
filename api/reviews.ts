import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const { name, rating, comment } = req.body as {
      name: string;
      rating: number;
      comment: string;
    };

    if (!name || !rating || !comment) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    try {
      await pool.query(
        `INSERT INTO reviews (name, rating, comment) VALUES ($1, $2, $3)`,
        [name.trim(), Number(rating), comment.trim()]
      );
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ success: false, error: "DB error" });
    }
  }

  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        `SELECT id, name, rating, comment, created_at FROM reviews ORDER BY created_at DESC LIMIT 50`
      );
      return res.json({ success: true, reviews: rows });
    } catch {
      return res.status(500).json({ success: false, error: "DB error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
