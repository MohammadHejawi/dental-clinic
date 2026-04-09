import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

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

// ── System prompts ────────────────────────────────────────────────────────────
const CLINIC_INFO = `
عيادة الدكتور طارق الهيجاوي لطب وزراعة وتجميل الأسنان – إربد، الأردن.
الطبيب: دكتور طارق الهيجاوي، خبرة +21 عاماً.
الهاتف/واتساب: 0796317293
ساعات العمل: السبت–الخميس 9ص–8م (الجمعة: إجازة)
الخدمات: تبييض الأسنان، زراعة الأسنان، تقويم (إنفزلاين)، تنظيف، تركيبات ثابتة (زيركون/إيماكس)، علاج عصب، ابتسامة هوليود، علاج اللثة.
الأسعار: تختلف حسب كل حالة — ننصح بالتواصل للحصول على تقييم مجاني.
`.trim();

const SYSTEM_AR = `أنت مساعد ذكاء اصطناعي ودود ومحترف لعيادة أسنان. ${CLINIC_INFO}
- رد دائماً بالعربية الواضحة.
- عند سؤاله عن الأسعار: أخبره أن الأسعار تختلف حسب الحالة وشجّعه على التواصل للتقييم المجاني.
- اجعل ردودك مختصرة ومفيدة (3-5 جمل).
- إذا سألك عن أي شيء خارج نطاق العيادة، أجب بلطف ثم أعده لموضوع العيادة.`;

const SYSTEM_EN = `You are a friendly, professional AI assistant for a dental clinic. Dr. Tareq Al-Hijawi Dental Clinic, Irbid, Jordan. Phone/WhatsApp: +962 79 631 7293. Open Sat–Thu 9AM–8PM.
Services: whitening, implants, orthodontics (Invisalign), cleaning, crowns/bridges, root canal, Hollywood smile, gum treatment.
- Respond in clear, friendly English.
- For prices, explain they vary by case and recommend a free consultation.
- Keep responses concise (3-5 sentences).`;

// ── Rule-based fallback ───────────────────────────────────────────────────────
type Rule = { kw: string[]; reply: string };

const RULES_AR: Rule[] = [
  { kw: ["مواعيد","ساعات","دوام","متى تفتح","متى تغلق","اوقات","وقت"],
    reply: "ساعات عمل العيادة: السبت–الخميس 9ص–8م، الجمعة إجازة. 📅\nللحجز: واتساب 0796317293" },
  { kw: ["حجز","موعد","احجز","بدي موعد","اريد موعد"],
    reply: "يسعدنا خدمتك! 😊\n📞 0796317293\n💬 واتساب: 0796317293\nنعمل السبت–الخميس 9ص–8م." },
  { kw: ["سعر","تكلفة","كم","أسعار","بكم","فلوس","دينار"],
    reply: "الأسعار تختلف حسب كل حالة. نقدم تقييماً مجانياً! 📞 اتصل على 0796317293 أو واتساب." },
  { kw: ["زراعة","زرعة","زرع"],
    reply: "نتخصص في زراعة الأسنان بأفضل الزرعات العالمية. خبرة +21 عاماً. 🦷\nللاستفسار: 0796317293 واتساب." },
  { kw: ["تبييض","أبيض","تفتيح"],
    reply: "تبييض الأسنان بنتائج فورية في جلسة واحدة. 😁 للحجز: 0796317293." },
  { kw: ["تقويم","انفزلاين","إنفزلاين","شفاف"],
    reply: "نوفر التقويم المعدني والشفاف (إنفزلاين). 📞 0796317293 لاستشارة مجانية." },
  { kw: ["هوليود","ابتسامة","قشور","فينير","porcelain"],
    reply: "ابتسامة هوليود بقشور البورسلين والزيركون. ✨ 0796317293." },
  { kw: ["عصب","حشو عصب"],
    reply: "علاج قنوات العصب بأحدث الأجهزة. 🦷 للحجز: 0796317293." },
  { kw: ["تنظيف","جير","تلميع"],
    reply: "تنظيف الأسنان وإزالة الجير بأحدث الأجهزة. 😊 واتساب: 0796317293." },
  { kw: ["موقع","عنوان","وين","فين","اين","إربد"],
    reply: "العيادة في إربد، الأردن. 📍 للموقع الدقيق: واتساب 0796317293." },
  { kw: ["دكتور","طارق","الهيجاوي","خبرة","الطبيب"],
    reply: "د. طارق الهيجاوي متخصص في طب وزراعة وتجميل الأسنان، خبرة +21 عاماً. 🏆" },
  { kw: ["اللثة","لثة","gum"],
    reply: "نقدم علاج أمراض اللثة باحترافية عالية. 📞 0796317293." },
  { kw: ["تركيبات","تاج","زيركون","ايماكس","جسر","crown"],
    reply: "نقدم التركيبات الثابتة (تيجان وجسور زيركون وإيماكس) بأعلى جودة. 📞 0796317293." },
  { kw: ["شكرا","شكراً","ممتاز","مرحبا","اهلا","السلام","مساء","صباح"],
    reply: "أهلاً وسهلاً! 😊 كيف يمكنني مساعدتك في صحة أسنانك؟" },
  { kw: ["واتساب","whatsapp","تواصل","اتصل","تلفون","رقم"],
    reply: "يمكنك التواصل معنا عبر:\n📞 الهاتف: 0796317293\n💬 واتساب: 0796317293\nنعمل السبت–الخميس 9ص–8م. 😊" },
  { kw: ["تخدير","مؤلم","ألم","خوف"],
    reply: "نستخدم أحدث تقنيات التخدير الموضعي لضمان علاج مريح وخالٍ من الألم. 😊 لا تتردد في الاتصال على 0796317293." },
  { kw: ["اطفال","طفل","طفلة","أطفال"],
    reply: "نستقبل المرضى من جميع الأعمار بما فيهم الأطفال. 👶 للحجز: 0796317293." },
];

const RULES_EN: Rule[] = [
  { kw: ["hours","working hours","open","close","schedule","when"],
    reply: "Open Saturday–Thursday, 9AM–8PM. Friday closed. 📅\nWhatsApp: +962 79 631 7293" },
  { kw: ["book","appointment","schedule","reserve"],
    reply: "We'd love to help! 😊\n📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\nOpen Sat–Thu, 9AM–8PM." },
  { kw: ["price","cost","how much","fee","charge"],
    reply: "Prices vary by case. Free consultations available! 📞 +962 79 631 7293." },
  { kw: ["implant","dental implant"],
    reply: "We specialize in dental implants with 21+ years experience. 🦷\n+962 79 631 7293 (WhatsApp)." },
  { kw: ["whitening","bleaching","white"],
    reply: "Safe, instant whitening in one session! 😁 Book: +962 79 631 7293." },
  { kw: ["braces","orthodontic","invisalign","clear"],
    reply: "Metal braces & Invisalign available. Free consultation: +962 79 631 7293." },
  { kw: ["hollywood","veneer","smile"],
    reply: "Hollywood smile with porcelain & zirconia veneers. ✨ +962 79 631 7293." },
  { kw: ["root canal","nerve"],
    reply: "Root canal with the latest technology. 🦷 Book: +962 79 631 7293." },
  { kw: ["cleaning","scaling","tartar"],
    reply: "Professional dental cleaning available. 😊 WhatsApp: +962 79 631 7293." },
  { kw: ["location","address","where","irbid"],
    reply: "Located in Irbid, Jordan. 📍 WhatsApp for directions: +962 79 631 7293." },
  { kw: ["doctor","dr","tareq","experience"],
    reply: "Dr. Tareq Al-Hijawi – dental specialist with 21+ years experience. 🏆" },
  { kw: ["gum","periodontal"],
    reply: "We treat gum disease professionally. 📞 +962 79 631 7293." },
  { kw: ["crown","bridge","zirconia","emax"],
    reply: "We offer Zirconia & E-max crowns and bridges. 📞 +962 79 631 7293." },
  { kw: ["hello","hi","thanks","thank","hey","good morning","good evening"],
    reply: "Hello! 😊 How can I help you with your dental health today?" },
  { kw: ["whatsapp","contact","phone","number","call"],
    reply: "📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\nOpen Sat–Thu, 9AM–8PM. 😊" },
  { kw: ["pain","hurt","scared","fear","anesthesia"],
    reply: "We use the latest local anesthesia for a comfortable, pain-free experience. 😊 Call us: +962 79 631 7293." },
  { kw: ["children","child","kid","kids"],
    reply: "We welcome patients of all ages, including children! 👶 Book: +962 79 631 7293." },
];

function ruleReply(text: string, lang: string): string {
  const t = text.toLowerCase();
  const rules = lang === "en" ? RULES_EN : RULES_AR;
  for (const r of rules) {
    if (r.kw.some((k) => t.includes(k))) return r.reply;
  }
  return lang === "en"
    ? "Thank you for your question! For more info:\n📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\nOpen Sat–Thu, 9AM–8PM. 😊"
    : "شكراً لسؤالك! للمزيد من المعلومات:\n📞 0796317293\n💬 واتساب: 0796317293\nنعمل السبت–الخميس 9ص–8م. 😊";
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

  // ── 1. Try Google Gemini (Vercel: set GEMINI_API_KEY) ─────────────────────
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: isEn ? SYSTEM_EN : SYSTEM_AR,
      });
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      const reply = result.response.text();
      return res.json({ reply });
    } catch (e: any) {
      console.error("Gemini error:", e?.message);
    }
  }

  // ── 2. Try OpenAI / Replit AI Integration ─────────────────────────────────
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_completion_tokens: 400,
        messages: [
          { role: "system", content: isEn ? SYSTEM_EN : SYSTEM_AR },
          ...messages.slice(-10),
        ],
      });
      const reply = completion.choices[0]?.message?.content ?? "";
      return res.json({ reply });
    } catch (e: any) {
      console.error("OpenAI error:", e?.message);
    }
  }

  // ── 3. Rule-based fallback (always works, no API needed) ──────────────────
  return res.json({ reply: ruleReply(userText, lang ?? "ar") });
}
