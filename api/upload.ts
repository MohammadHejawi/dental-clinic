import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { password, data, mimeType, filename } = req.body ?? {};

  if (password !== (process.env.ADMIN_PASSWORD || "clinic2024")) {
    return res.status(401).json({ error: "غير مصرح" });
  }
  if (!data) return res.status(400).json({ error: "لم يتم إرسال بيانات الصورة" });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id      SERIAL PRIMARY KEY,
      filename  TEXT,
      mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
      data      TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const result = await pool.query(
    `INSERT INTO uploads (filename, mime_type, data) VALUES ($1,$2,$3) RETURNING id`,
    [filename || "upload", mimeType || "image/jpeg", data]
  );

  return res.json({ success: true, url: `/api/image/${result.rows[0].id}` });
}
