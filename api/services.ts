import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_SERVICES = [
  { title_ar:"تبييض الأسنان",     title_en:"Teeth Whitening",       desc_ar:"تبييض احترافي آمن يمنحك ابتسامة ناصعة البياض في جلسة واحدة.",               desc_en:"Professional safe whitening for a brilliantly white smile in a single session.",          icon:"Smile",        color:"from-sky-400 to-blue-500",      sort_order:1 },
  { title_ar:"زراعة الأسنان",     title_en:"Dental Implants",       desc_ar:"حلول دائمة ومتينة لتعويض الأسنان المفقودة باستخدام أفضل الزرعات العالمية.",   desc_en:"Permanent and durable solutions for missing teeth using world-class implants.",          icon:"ShieldCheck",  color:"from-blue-500 to-indigo-600",   sort_order:2 },
  { title_ar:"تقويم الأسنان",     title_en:"Orthodontics",          desc_ar:"تقويم معدني أو شفاف (إنفزلاين) للحصول على أسنان مرتبة وإطباق سليم.",         desc_en:"Metal or clear (Invisalign) braces for perfectly aligned teeth and correct bite.",      icon:"Layers",       color:"from-violet-400 to-violet-600", sort_order:3 },
  { title_ar:"تنظيف الأسنان",     title_en:"Teeth Cleaning",        desc_ar:"تنظيف عميق وإزالة الجير والتصبغات للحفاظ على صحة لثتك وأسنانك.",            desc_en:"Deep cleaning and tartar removal to preserve the health of your gums and teeth.",       icon:"Droplets",     color:"from-cyan-400 to-cyan-600",     sort_order:4 },
  { title_ar:"التركيبات الثابتة", title_en:"Dental Prosthetics",    desc_ar:"تيجان وجسور عالية الجودة (زيركون وإيماكس) تعيد وظيفة وجمال أسنانك.",        desc_en:"High-quality crowns and bridges (Zirconia & E-max) restoring function and beauty.",    icon:"Activity",     color:"from-sky-500 to-sky-700",       sort_order:5 },
  { title_ar:"علاج العصب",        title_en:"Root Canal Treatment",  desc_ar:"علاج دقيق وفعال بأحدث الأجهزة لإنقاذ الأسنان المتضررة وتخفيف الألم.",       desc_en:"Precise treatment with the latest equipment to save damaged teeth and relieve pain.",  icon:"Stethoscope",  color:"from-blue-600 to-blue-800",     sort_order:6 },
  { title_ar:"ابتسامة هوليود",   title_en:"Hollywood Smile",       desc_ar:"قشور البورسلين والزيركون لتحقيق ابتسامة ساحرة تُشبه نجوم السينما.",          desc_en:"Porcelain and zirconia veneers for a stunning celebrity-style smile transformation.",   icon:"Sparkles",     color:"from-amber-400 to-orange-500",  sort_order:7 },
  { title_ar:"علاج أمراض اللثة", title_en:"Gum Disease Treatment", desc_ar:"تشخيص وعلاج شامل لأمراض اللثة والحفاظ على صحة نسيجها.",                    desc_en:"Comprehensive diagnosis and treatment of gum disease to preserve healthy tissue.",      icon:"CheckCircle2", color:"from-emerald-400 to-emerald-600",sort_order:8 },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(process.env.DATABASE_URL!);
  const adminPassword = process.env.ADMIN_PASSWORD || "clinic2024";

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id          SERIAL PRIMARY KEY,
        title_ar    TEXT    NOT NULL DEFAULT '',
        title_en    TEXT    NOT NULL DEFAULT '',
        desc_ar     TEXT    NOT NULL DEFAULT '',
        desc_en     TEXT    NOT NULL DEFAULT '',
        icon        TEXT    NOT NULL DEFAULT 'Star',
        color       TEXT    NOT NULL DEFAULT 'from-sky-400 to-blue-500',
        sort_order  INT     NOT NULL DEFAULT 99,
        active      BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )`;

    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === "GET") {
      const count = await sql`SELECT COUNT(*)::int AS c FROM services`;
      if (count[0].c === 0) {
        for (const s of DEFAULT_SERVICES) {
          await sql`
            INSERT INTO services (title_ar,title_en,desc_ar,desc_en,icon,color,sort_order)
            VALUES (${s.title_ar},${s.title_en},${s.desc_ar},${s.desc_en},${s.icon},${s.color},${s.sort_order})`;
        }
      }
      const services = await sql`SELECT * FROM services ORDER BY sort_order, id`;
      return res.status(200).json({ success: true, services });
    }

    // ── POST (create) ────────────────────────────────────────────────────────
    if (req.method === "POST") {
      const { password, title_ar, title_en, desc_ar, desc_en, icon, color, sort_order, active } = req.body || {};
      if (password !== adminPassword) return res.status(401).json({ success: false, error: "Unauthorized" });
      const rows = await sql`
        INSERT INTO services (title_ar,title_en,desc_ar,desc_en,icon,color,sort_order,active)
        VALUES (${title_ar||''},${title_en||''},${desc_ar||''},${desc_en||''},${icon||'Star'},${color||'from-sky-400 to-blue-500'},${sort_order??99},${active!==false})
        RETURNING *`;
      return res.status(200).json({ success: true, service: rows[0] });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
}
