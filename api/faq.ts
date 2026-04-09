import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PW = () => process.env.ADMIN_PASSWORD || "clinic2024";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        `SELECT id, question_ar, question_en, answer_ar, answer_en
         FROM faq ORDER BY sort_order ASC, id ASC`
      );
      return res.json({ success: true, items: rows });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "POST") {
    const { password, question_ar, question_en, answer_ar, answer_en, sort_order } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    if (!question_ar || !answer_ar)
      return res.status(400).json({ success: false, error: "جميع الحقول مطلوبة" });
    try {
      const { rows } = await pool.query(
        `INSERT INTO faq (question_ar, question_en, answer_ar, answer_en, sort_order)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [question_ar, question_en || question_ar, answer_ar, answer_en || answer_ar, sort_order ?? 0]
      );
      return res.json({ success: true, id: rows[0].id });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "DELETE") {
    const { password } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ success: false, error: "Invalid id" });
    try {
      await pool.query("DELETE FROM faq WHERE id=$1", [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
