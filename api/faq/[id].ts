import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PW = () => process.env.ADMIN_PASSWORD || "clinic2024";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ success: false, error: "id مطلوب" });

  if (req.method === "PUT") {
    const { password, question_ar, question_en, answer_ar, answer_en, sort_order, active } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    try {
      const { rows } = await pool.query(
        `UPDATE faq_items SET question_ar=$1, question_en=$2, answer_ar=$3, answer_en=$4,
         sort_order=$5, active=$6 WHERE id=$7 RETURNING *`,
        [question_ar, question_en, answer_ar, answer_en, sort_order ?? 99, active ?? true, id]
      );
      if (!rows[0]) return res.status(404).json({ success: false, error: "السؤال غير موجود" });
      return res.json({ success: true, item: rows[0] });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "DELETE") {
    const { password } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    try {
      await pool.query("DELETE FROM faq_items WHERE id=$1", [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
