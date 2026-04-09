import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).end();

  try {
    const result = await pool.query(
      `SELECT mime_type, data FROM uploads WHERE id = $1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).end();

    const { mime_type, data } = result.rows[0];
    const buffer = Buffer.from(data, "base64");

    res.setHeader("Content-Type", mime_type);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch {
    return res.status(500).end();
  }
}
