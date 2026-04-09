import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PW = () => process.env.ADMIN_PASSWORD || "clinic2024";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_content (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      const { rows } = await pool.query("SELECT key, value FROM site_content ORDER BY key");
      const content: Record<string, string> = {};
      for (const row of rows) content[row.key] = row.value;
      return res.json({ success: true, content });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "POST") {
    const { password, updates } = req.body as { password: string; updates: Record<string, string> };
    if (password !== PW()) return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
    if (!updates || typeof updates !== "object") return res.status(400).json({ success: false, error: "Missing updates" });
    try {
      for (const [key, value] of Object.entries(updates)) {
        await pool.query(
          `INSERT INTO site_content (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [key, value]
        );
      }
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
