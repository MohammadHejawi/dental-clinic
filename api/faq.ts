import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PW = () => process.env.ADMIN_PASSWORD || "clinic2024";

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS faq_items (
      id SERIAL PRIMARY KEY,
      question_ar TEXT NOT NULL,
      question_en TEXT NOT NULL,
      answer_ar TEXT NOT NULL,
      answer_en TEXT NOT NULL,
      sort_order INTEGER DEFAULT 99,
      active BOOLEAN DEFAULT TRUE
    )
  `);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  await ensureTable();

  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM faq_items WHERE active = TRUE ORDER BY sort_order ASC, id ASC"
      );
      return res.json({ success: true, items: rows });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "POST") {
    const { password, question_ar, question_en, answer_ar, answer_en, sort_order } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    if (!question_ar || !question_en || !answer_ar || !answer_en)
      return res.status(400).json({ success: false, error: "جميع الحقول مطلوبة" });
    try {
      const { rows } = await pool.query(
        `INSERT INTO faq_items (question_ar, question_en, answer_ar, answer_en, sort_order)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [question_ar, question_en, answer_ar, answer_en, sort_order ?? 99]
      );
      return res.json({ success: true, item: rows[0] });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
