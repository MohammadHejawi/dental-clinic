import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(process.env.DATABASE_URL!);
  const adminPassword = process.env.ADMIN_PASSWORD || "clinic2024";
  const id = parseInt(req.query.id as string);

  if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid ID" });

  try {
    // ── PUT (update) ─────────────────────────────────────────────────────────
    if (req.method === "PUT") {
      const { password, title_ar, title_en, desc_ar, desc_en, icon, color, sort_order, active } = req.body || {};
      if (password !== adminPassword) return res.status(401).json({ success: false, error: "Unauthorized" });
      const rows = await sql`
        UPDATE services SET
          title_ar=${title_ar||''}, title_en=${title_en||''},
          desc_ar=${desc_ar||''},   desc_en=${desc_en||''},
          icon=${icon||'Star'},     color=${color||'from-sky-400 to-blue-500'},
          sort_order=${sort_order??99}, active=${active!==false}
        WHERE id=${id} RETURNING *`;
      return res.status(200).json({ success: true, service: rows[0] });
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === "DELETE") {
      const { password } = req.body || {};
      if (password !== adminPassword) return res.status(401).json({ success: false, error: "Unauthorized" });
      await sql`DELETE FROM services WHERE id=${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
}
