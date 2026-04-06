import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PW = () => process.env.ADMIN_PASSWORD || "clinic2024";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM services WHERE active = TRUE ORDER BY sort_order ASC, id ASC"
      );
      return res.json({ success: true, services: rows });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "POST") {
    const { password, title_ar, title_en, desc_ar, desc_en, icon, color, sort_order } = req.body;
    if (password !== PW()) return res.status(401).json({ success: false, error: "غير مصرح" });
    try {
      const { rows } = await pool.query(
        `INSERT INTO services (title_ar,title_en,desc_ar,desc_en,icon,color,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title_ar, title_en, desc_ar, desc_en, icon || "Star", color || "from-sky-400 to-blue-500", sort_order ?? 99]
      );
      return res.json({ success: true, service: rows[0] });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
