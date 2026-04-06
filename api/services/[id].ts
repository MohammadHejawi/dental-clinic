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
  if (!id) return res.status(400).json({ success: false, error: "Invalid ID" });

  if (req.method === "PUT") {
    const { password, title_ar, title_en, desc_ar, desc_en, icon, color, sort_order, active } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    try {
      const { rows } = await pool.query(
        `UPDATE services SET title_ar=$1,title_en=$2,desc_ar=$3,desc_en=$4,icon=$5,color=$6,sort_order=$7,active=$8
         WHERE id=$9 RETURNING *`,
        [title_ar, title_en, desc_ar, desc_en, icon, color, sort_order, active ?? true, id]
      );
      return res.json({ success: true, service: rows[0] });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "DELETE") {
    const { password } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    try {
      await pool.query("DELETE FROM services WHERE id=$1", [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
