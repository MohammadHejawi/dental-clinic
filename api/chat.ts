import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { Pool } from "pg";

// ── Clients ───────────────────────────────────────────────────────────────────
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const openai =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    ? new OpenAI({
        baseURL:
          process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
          "https://api.openai.com/v1",
        apiKey:
          process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
          process.env.OPENAI_API_KEY!,
      })
    : null;

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

// ── Fetch clinic hours from DB ─────────────────────────────────────────────────
async function getHours(): Promise<{ ar: string; en: string; closedAr: string; closedEn: string }> {
  const defaults = {
    ar: "السبت–الخميس: 9 صباحاً – 8 مساءً",
    en: "Sat–Thu: 9:00 AM – 8:00 PM",
    closedAr: "الجمعة: مغلق",
    closedEn: "Friday: Closed",
  };
  if (!pool) return defaults;
  try {
    const { rows } = await pool.query(
      `SELECT key, value FROM site_content WHERE key IN ('hours_ar','hours_en','conHoursVal_ar','conHoursVal_en','conClosed_ar','conClosed_en')`
    );
    const m: Record<string, string> = {};
    rows.forEach((r: { key: string; value: string }) => { m[r.key] = r.value; });
    return {
      ar:        m["hours_ar"]       || m["conHoursVal_ar"] || defaults.ar,
      en:        m["hours_en"]       || m["conHoursVal_en"] || defaults.en,
      closedAr:  m["conClosed_ar"]   || defaults.closedAr,
      closedEn:  m["conClosed_en"]   || defaults.closedEn,
    };
  } catch {
    return defaults;
  }
}

// ── Build system prompts ──────────────────────────────────────────────────────
function buildSystemAr(hours: string, closed: string) {
  return `أنت مساعد ذكاء اصطناعي ودود ومحترف لعيادة الدكتور طارق الهيجاوي لطب وزراعة وتجميل الأسنان في إربد، الأردن.

معلومات العيادة:
- الطبيب: دكتور طارق الهيجاوي، خبرة أكثر من 21 عاماً في طب الأسنان
- الهاتف/واتساب: 0796317293
- ساعات العمل: ${hours} | ${closed}
- الموقع: إربد، الأردن

خدمات العيادة:
1. تبييض الأسنان: تبييض آمن وفعّال بنتائج فورية في جلسة واحدة باستخدام أحدث الأجهزة
2. زراعة الأسنان: زراعة بأفضل الزرعات العالمية مع ضمان طويل الأمد
3. تقويم الأسنان: تقويم معدني وشفاف (إنفزلاين) لابتسامة مستقيمة ومثالية
4. تنظيف الأسنان: إزالة الجير والرواسب وتلميع الأسنان بأحدث الأجهزة الطبية
5. التركيبات الثابتة: تيجان وجسور من الزيركون والإيماكس بأعلى جودة ومتانة
6. علاج قنوات العصب: علاج بلا ألم باستخدام أحدث التقنيات والأجهزة
7. ابتسامة هوليود: قشور بورسلين وزيركون لابتسامة ساحرة تشبه نجوم الأفلام
8. علاج اللثة: تشخيص وعلاج أمراض اللثة باحترافية عالية

تعليمات مهمة جداً — اتبعها بدقة:
- عند السؤال عن "الخدمات" بشكل عام: اذكر قائمة الخدمات مع وصف مختصر لكل واحدة
- عند السؤال عن خدمة معينة: اشرح الخدمة وفوائدها ومميزاتها بوضوح، ثم ادعُه للحجز
- لا تذكر الأسعار أبداً إلا إذا سأل المريض مباشرة عن السعر أو التكلفة
- إذا سأل عن السعر: قل أن الأسعار تختلف حسب كل حالة، ونقدم تقييماً مجانياً
- ردودك باللغة العربية الواضحة والودودة، مختصرة ومفيدة (3-6 جمل)
- لا تخترع معلومات غير موجودة في المعطيات أعلاه`;
}

function buildSystemEn(hours: string, closed: string) {
  return `You are a friendly, professional AI assistant for Dr. Tareq Al-Hijawi Dental Clinic in Irbid, Jordan.

Clinic Info:
- Doctor: Dr. Tareq Al-Hijawi, 21+ years of dental expertise
- Phone/WhatsApp: +962 79 631 7293
- Working Hours: ${hours} | ${closed}
- Location: Irbid, Jordan

Services:
1. Teeth Whitening: Safe, instant results in one session using latest technology
2. Dental Implants: Premium international implants with long-term warranty
3. Orthodontics: Metal braces & Invisalign for a perfectly aligned smile
4. Dental Cleaning: Tartar removal and polishing with modern equipment
5. Crowns & Bridges: Zirconia and E-max with highest quality and durability
6. Root Canal: Pain-free treatment using the latest techniques
7. Hollywood Smile: Porcelain and zirconia veneers for a celebrity smile
8. Gum Treatment: Professional diagnosis and treatment of gum diseases

Important rules — follow strictly:
- When asked about "services" in general: list all services with brief descriptions
- When asked about a specific service: explain it clearly with benefits, then invite them to book
- NEVER mention prices unless the patient specifically asks about price or cost
- If asked about price: say prices vary by case, offer free consultation
- Keep responses friendly, clear, and concise (3-6 sentences)`;
}

// ── Rule-based fallback ───────────────────────────────────────────────────────
type Rule = { kw: string[]; reply: string };

function buildRulesAr(hours: string, closed: string): Rule[] {
  return [
    {
      kw: ["خدمات","خدمة","ايش عندكم","شو عندكم","ماذا تقدم","ماذا تقدمون","ايش تعملوا","شو بتعملوا"],
      reply: "خدمات عيادة د. طارق الهيجاوي 🦷\n\n• تبييض الأسنان — نتائج فورية في جلسة واحدة\n• زراعة الأسنان — أفضل الزرعات العالمية\n• تقويم الأسنان — معدني وإنفزلاين شفاف\n• تنظيف الأسنان وإزالة الجير\n• تركيبات ثابتة (زيركون وإيماكس)\n• علاج قنوات العصب بلا ألم\n• ابتسامة هوليود بقشور البورسلين\n• علاج أمراض اللثة\n\nللاستفسار أو الحجز: واتساب 0796317293 😊"
    },
    {
      kw: ["مواعيد","ساعات","دوام","متى تفتح","متى تغلق","اوقات","وقت","دوامكم"],
      reply: `ساعات عمل العيادة: ${hours}\n${closed} 📅\nللحجز: واتساب 0796317293`
    },
    {
      kw: ["حجز","موعد","احجز","بدي موعد","اريد موعد","ابي موعد"],
      reply: `يسعدنا خدمتك! 😊\n📞 الهاتف: 0796317293\n💬 واتساب: 0796317293\nنعمل ${hours}`
    },
    {
      kw: ["سعر","تكلفة","كم","أسعار","بكم","فلوس","دينار"],
      reply: "الأسعار تختلف حسب كل حالة والوضع الصحي للمريض.\n✅ نقدم تقييماً مجانياً!\n📞 تواصل معنا: 0796317293 واتساب"
    },
    {
      kw: ["زراعة","زرعة","زرع"],
      reply: "🦷 زراعة الأسنان عند د. طارق الهيجاوي:\n• أفضل الزرعات العالمية المعتمدة\n• خبرة +21 عاماً في الزراعة\n• نتائج طبيعية ودائمة\n• تخدير موضعي مريح بلا ألم\n\nللحجز واستشارة مجانية: 0796317293 💬"
    },
    {
      kw: ["تبييض","أبيض","تفتيح"],
      reply: "✨ تبييض الأسنان:\n• نتائج فورية وآمنة في جلسة واحدة\n• تقنيات حديثة لا تضر المينا\n• فرق واضح بعد الجلسة الأولى\n\nللحجز: 0796317293 📞"
    },
    {
      kw: ["تقويم","انفزلاين","إنفزلاين","شفاف","اسنان مائلة","اسنان ملتوية"],
      reply: "😁 تقويم الأسنان:\n• تقويم معدني للحالات المتقدمة\n• إنفزلاين (شفاف) للراحة والجمالية\n• خطة علاجية مخصصة لكل حالة\n• استشارة مجانية لتحديد الأنسب لك\n\n📞 0796317293 واتساب"
    },
    {
      kw: ["هوليود","ابتسامة هوليود","قشور","فينير","لمينيت"],
      reply: "⭐ ابتسامة هوليود:\n• قشور بورسلين وزيركون بأعلى جودة\n• تصميم مخصص لشكل وجهك\n• نتائج طبيعية وجمال استثنائي\n• تدوم لسنوات طويلة\n\n💬 0796317293 لاستشارة مجانية"
    },
    {
      kw: ["عصب","حشو عصب","يوجعني سن","الم في السن"],
      reply: "🦷 علاج قنوات العصب:\n• علاج شامل بلا ألم\n• تخدير موضعي فعّال وآمن\n• أحدث الأجهزة الطبية المتطورة\n• إنقاذ السن الطبيعية بدل الخلع\n\n📞 0796317293 للحجز الفوري"
    },
    {
      kw: ["تنظيف","جير","تلميع"],
      reply: "✨ تنظيف الأسنان:\n• إزالة الجير والرواسب بشكل كامل\n• تلميع وتبييض خفيف\n• يُنصح به كل 6 أشهر للوقاية\n• بالموجات فوق الصوتية بلا ألم\n\n😊 واتساب: 0796317293"
    },
    {
      kw: ["تركيبات","تاج","زيركون","ايماكس","جسر","طاقية"],
      reply: "👑 التركيبات الثابتة:\n• تيجان زيركون وإيماكس بأعلى جودة\n• جسور ثابتة لتعويض الأسنان المفقودة\n• مطابقة تامة للون أسنانك الطبيعية\n• متانة وتحمّل لسنوات طويلة\n\n📞 0796317293"
    },
    {
      kw: ["اللثة","لثة","نزيف اللثة","التهاب اللثة"],
      reply: "🦷 علاج اللثة:\n• تشخيص دقيق لأمراض اللثة\n• علاج التهابات ونزيف اللثة\n• تنظيف عميق تحت اللثة\n• خطة وقائية لمنع التكرار\n\n📞 0796317293"
    },
    {
      kw: ["تخدير","مؤلم","ألم","خوف","خايف","خوفان"],
      reply: "😊 لا تقلق! نضمن لك تجربة مريحة تماماً:\n• تخدير موضعي حديث وفعّال\n• معالجة لطيفة وصبورة مع الخائفين\n• بيئة هادئة ومريحة\n\n📞 0796317293"
    },
    {
      kw: ["اطفال","طفل","طفلة","أطفال"],
      reply: "👶 نرحب بالأطفال!\n• طاقم متخصص في التعامل مع الأطفال\n• بيئة ودية ومشجعة\n• مناسب لجميع الأعمار\n\nللحجز: 0796317293 😊"
    },
    {
      kw: ["موقع","عنوان","وين","فين","اين","إربد","مكان"],
      reply: "📍 العيادة في إربد، الأردن\nللموقع التفصيلي والتوجيه: تواصل عبر واتساب 0796317293"
    },
    {
      kw: ["دكتور","طارق","الهيجاوي","خبرة","الطبيب","الدكتور"],
      reply: "👨‍⚕️ الدكتور طارق الهيجاوي:\n• متخصص في طب وزراعة وتجميل الأسنان\n• خبرة تتجاوز 21 عاماً\n• عدد كبير من المرضى الراضين\n\n📞 0796317293"
    },
    {
      kw: ["واتساب","تواصل","اتصل","تلفون","رقم","كيف اتواصل"],
      reply: "📞 الهاتف: 0796317293\n💬 واتساب: 0796317293\nأهلاً بك! 😊"
    },
    {
      kw: ["شكرا","شكراً","مرحبا","اهلا","السلام","مساء","صباح","هلا","هلو","كيف حالك"],
      reply: "أهلاً وسهلاً! 😊 كيف يمكنني مساعدتك في صحة أسنانك اليوم؟"
    },
  ];
}

function buildRulesEn(hours: string, closed: string): Rule[] {
  return [
    {
      kw: ["services","what do you offer","what you do","treatments"],
      reply: "Dr. Tareq Al-Hijawi Dental Clinic Services 🦷\n\n• Teeth Whitening — instant results in one session\n• Dental Implants — premium international brands\n• Orthodontics — metal braces & Invisalign\n• Dental Cleaning & scaling\n• Crowns & Bridges — Zirconia & E-max\n• Root Canal — pain-free treatment\n• Hollywood Smile — porcelain veneers\n• Gum Disease Treatment\n\nBookings: WhatsApp +962 79 631 7293 😊"
    },
    {
      kw: ["hours","working hours","open","close","schedule","when"],
      reply: `Working Hours: ${hours}\n${closed} 📅\nWhatsApp: +962 79 631 7293`
    },
    {
      kw: ["book","appointment","schedule","reserve"],
      reply: `We'd love to help! 😊\n📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\nOpen ${hours}`
    },
    {
      kw: ["price","cost","how much","fee","charge"],
      reply: "Prices vary depending on each case.\n✅ Free consultations available!\n📞 +962 79 631 7293"
    },
    {
      kw: ["implant","dental implant"],
      reply: "🦷 Dental Implants:\n• Premium international implants\n• 21+ years of implant experience\n• Natural-looking, permanent results\n• Comfortable local anesthesia\n\nFree consultation: +962 79 631 7293 💬"
    },
    {
      kw: ["whitening","bleaching","white teeth"],
      reply: "✨ Teeth Whitening:\n• Instant, safe results in ONE session\n• Modern technology gentle on enamel\n• Noticeable difference after first session\n\nBook: +962 79 631 7293 📞"
    },
    {
      kw: ["braces","orthodontic","invisalign","clear aligners","crooked"],
      reply: "😁 Orthodontics:\n• Metal braces for complex cases\n• Invisalign clear aligners for comfort\n• Personalized treatment plan\n• Free consultation available\n\n📞 +962 79 631 7293"
    },
    {
      kw: ["hollywood","veneer","smile makeover","porcelain"],
      reply: "⭐ Hollywood Smile:\n• Porcelain & zirconia veneers\n• Custom-designed for your face shape\n• Natural look, stunning results\n\n💬 +962 79 631 7293"
    },
    {
      kw: ["root canal","nerve","toothache","tooth pain"],
      reply: "🦷 Root Canal:\n• Completely pain-free procedure\n• Effective local anesthesia\n• Latest technology & equipment\n• Save your natural tooth\n\n📞 +962 79 631 7293"
    },
    {
      kw: ["cleaning","scaling","tartar","plaque"],
      reply: "✨ Dental Cleaning:\n• Complete tartar & plaque removal\n• Polishing & light whitening\n• Recommended every 6 months\n\n😊 WhatsApp: +962 79 631 7293"
    },
    {
      kw: ["crown","bridge","zirconia","emax"],
      reply: "👑 Crowns & Bridges:\n• Zirconia & E-max highest quality\n• Perfect color match\n• Durable and long-lasting\n\n📞 +962 79 631 7293"
    },
    {
      kw: ["gum","periodontal","bleeding"],
      reply: "🦷 Gum Treatment:\n• Accurate diagnosis\n• Treatment of inflammation & bleeding\n• Deep cleaning below the gumline\n\n📞 +962 79 631 7293"
    },
    {
      kw: ["pain","hurt","scared","fear","nervous"],
      reply: "😊 Don't worry! We ensure a completely comfortable experience:\n• Modern, effective local anesthesia\n• Gentle, patient-focused treatment\n\n📞 +962 79 631 7293"
    },
    {
      kw: ["children","child","kid","kids"],
      reply: "👶 Children are welcome!\n• Team experienced with young patients\n• Friendly, encouraging environment\n\nBook: +962 79 631 7293 😊"
    },
    {
      kw: ["location","address","where","irbid"],
      reply: "📍 Located in Irbid, Jordan\nFor directions: WhatsApp +962 79 631 7293"
    },
    {
      kw: ["doctor","dr","tareq","experience"],
      reply: "👨‍⚕️ Dr. Tareq Al-Hijawi:\n• Dental, implant & cosmetic specialist\n• 21+ years of experience\n\n📞 +962 79 631 7293"
    },
    {
      kw: ["whatsapp","contact","phone","call"],
      reply: "📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\n😊"
    },
    {
      kw: ["hello","hi","thanks","thank","hey","good morning","good evening"],
      reply: "Hello! 😊 How can I help with your dental health today?"
    },
  ];
}

function ruleReply(text: string, lang: string, rules: Rule[]): string {
  const t = text.toLowerCase();
  for (const r of rules) {
    if (r.kw.some((k) => t.includes(k))) return r.reply;
  }
  return lang === "en"
    ? "Thank you for your question! I'm here to help with anything dental-related 😊\n📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293"
    : "شكراً لسؤالك! أنا هنا لمساعدتك في كل ما يخص صحة أسنانك 😊\n📞 0796317293\n💬 واتساب: 0796317293";
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { messages, lang } = req.body ?? {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages required" });
  }

  const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
  const userText: string = lastUser?.content ?? "";
  const isEn = lang === "en";

  // Fetch live hours from DB
  const h = await getHours();
  const systemAr = buildSystemAr(h.ar, h.closedAr);
  const systemEn = buildSystemEn(h.en, h.closedEn);
  const rulesAr  = buildRulesAr(h.ar, h.closedAr);
  const rulesEn  = buildRulesEn(h.en, h.closedEn);

  // ── 1. Try Google Gemini ──────────────────────────────────────────────────
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: isEn ? systemEn : systemAr,
      });
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      return res.json({ reply: result.response.text() });
    } catch (e: any) {
      console.error("Gemini error:", e?.message);
    }
  }

  // ── 2. Try OpenAI ─────────────────────────────────────────────────────────
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_completion_tokens: 400,
        messages: [
          { role: "system", content: isEn ? systemEn : systemAr },
          ...messages.slice(-10),
        ],
      });
      return res.json({ reply: completion.choices[0]?.message?.content ?? "" });
    } catch (e: any) {
      console.error("OpenAI error:", e?.message);
    }
  }

  // ── 3. Rule-based fallback ────────────────────────────────────────────────
  return res.json({ reply: ruleReply(userText, lang ?? "ar", isEn ? rulesEn : rulesAr) });
}
