import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const { rows } = await pool.query(
        "SELECT key, value FROM site_content ORDER BY key"
      );
      const content: Record<string, string> = {};
      for (const row of rows) content[row.key] = row.value;
      return res.json({ success: true, content });
    } catch {
      return res.status(500).json({ success: false, error: "DB error" });
    }
  }

  if (req.method === "POST") {
    const adminPassword = process.env.ADMIN_PASSWORD || "clinic2024";
    const { password, updates } = req.body as {
      password: string;
      updates: Record<string, string>;
    };

    if (password !== adminPassword) {
      return res
        .status(401)
        .json({ success: false, error: "كلمة المرور غير صحيحة" });
    }

    if (!updates || typeof updates !== "object") {
      return res
        .status(400)
        .json({ success: false, error: "Missing updates" });
    }

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
    } catch {
      return res.status(500).json({ success: false, error: "DB error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
