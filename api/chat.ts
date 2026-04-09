import { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const hasOpenAI =
  !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY);

const openai = hasOpenAI
  ? new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY!,
    })
  : null;

const SYSTEM_AR = `أنت مساعد ذكاء اصطناعي لعيادة الدكتور طارق الهيجاوي لطب وزراعة وتجميل الأسنان في إربد، الأردن.

معلومات العيادة:
- الطبيب: الدكتور طارق الهيجاوي – متخصص في زراعة الأسنان وتجميلها، خبرة تزيد عن 21 عاماً
- الموقع: إربد، الأردن
- الهاتف وواتساب: 0796317293
- ساعات العمل: السبت–الخميس 9ص–8م (الجمعة: إجازة)
- فيسبوك: https://www.facebook.com/share/18gHHhErYC/

خدمات العيادة:
1. تبييض الأسنان – نتائج فورية وآمنة في جلسة واحدة
2. زراعة الأسنان – حلول دائمة بأفضل الزرعات العالمية
3. تقويم الأسنان – معدني أو شفاف (إنفزلاين)
4. تنظيف الأسنان – إزالة الجير والتصبغات
5. التركيبات الثابتة – تيجان وجسور زيركون وإيماكس
6. علاج العصب – بأحدث الأجهزة
7. ابتسامة هوليود – قشور البورسلين والزيركون
8. علاج أمراض اللثة

تعليمات:
- رد دائماً بالعربية الفصيحة الواضحة
- كن ودوداً ومهنياً
- ساعد المريض في الحصول على المعلومات التي يحتاجها
- عند سؤاله عن الأسعار: أخبره أن الأسعار تختلف حسب كل حالة وأنصحه بزيارة العيادة أو الاتصال للحصول على تقييم مجاني
- شجّع على حجز موعد: "احجز موعدك الآن عبر الاتصال على 0796317293 أو واتساب"
- اجعل ردودك قصيرة ومفيدة (3-5 جمل كحد أقصى إلا إذا طُلب تفصيل)`;

const SYSTEM_EN = `You are an AI assistant for Dr. Tareq Al-Hijawi's Dental, Implant & Cosmetic Clinic in Irbid, Jordan.

Clinic Information:
- Doctor: Dr. Tareq Al-Hijawi – Specialist in dental implants and cosmetics, 21+ years of experience
- Location: Irbid, Jordan
- Phone & WhatsApp: +962 79 631 7293
- Working Hours: Sat–Thu 9AM–8PM (Friday: closed)
- Facebook: https://www.facebook.com/share/18gHHhErYC/

Services:
1. Teeth Whitening – Safe, instant results in one session
2. Dental Implants – Permanent solutions with world-class implants
3. Orthodontics – Metal or clear (Invisalign)
4. Teeth Cleaning – Tartar & stain removal
5. Dental Prosthetics – Zirconia & E-max crowns and bridges
6. Root Canal Treatment – Latest technology
7. Hollywood Smile – Porcelain & zirconia veneers
8. Gum Disease Treatment

Instructions:
- Always respond in clear, friendly English
- Be professional and empathetic
- For price inquiries: explain prices vary by case and recommend a free consultation
- Encourage booking: "Book your appointment now by calling or WhatsApp: +962 79 631 7293"
- Keep responses concise (3-5 sentences unless detail is requested)`;

type RuleEntry = { keywords: string[]; reply: string };

const RULES_AR: RuleEntry[] = [
  {
    keywords: ["مواعيد", "ساعات", "دوام", "وقت العمل", "متى تفتح", "متى تغلق", "اوقات"],
    reply: "ساعات عمل العيادة: السبت حتى الخميس من 9 صباحاً حتى 8 مساءً. يوم الجمعة إجازة. 📅 لحجز موعد تواصل معنا على واتساب: 0796317293",
  },
  {
    keywords: ["حجز", "موعد", "احجز", "اريد موعد", "حجزت", "بدي موعد"],
    reply: "يسعدنا خدمتك! 😊 لحجز موعد يرجى التواصل معنا عبر:\n📞 الهاتف: 0796317293\n💬 واتساب: 0796317293\nنعمل السبت–الخميس 9ص–8م.",
  },
  {
    keywords: ["سعر", "تكلفة", "كم", "أسعار", "تكاليف", "بكم", "فلوس", "دينار"],
    reply: "الأسعار تختلف حسب كل حالة ونوع العلاج. نقدم تقييماً مجانياً للكشف عن احتياجاتك. 📞 اتصل بنا على 0796317293 أو تواصل عبر واتساب للحصول على استشارة مجانية.",
  },
  {
    keywords: ["زراعة", "زرعة", "implant", "زرع اسنان"],
    reply: "عيادتنا متخصصة في زراعة الأسنان بأفضل الزرعات العالمية. الدكتور طارق الهيجاوي لديه خبرة تزيد عن 21 عاماً في هذا المجال. 🦷 للاستفسار عن الأسعار والمواعيد: 0796317293 واتساب.",
  },
  {
    keywords: ["تبييض", "whitening", "أبيض", "تفتيح"],
    reply: "نقدم خدمة تبييض الأسنان بنتائج فورية وآمنة في جلسة واحدة. 😁 للحجز تواصل معنا على 0796317293.",
  },
  {
    keywords: ["تقويم", "orthodontics", "invisalign", "انفزلاين", "شفاف", "معدني"],
    reply: "نوفر تقويم الأسنان المعدني والشفاف (إنفزلاين). يتم تحديد النوع الأنسب بعد الكشف. 📞 تواصل معنا على 0796317293 لحجز استشارة مجانية.",
  },
  {
    keywords: ["هوليود", "ابتسامة هوليود", "قشور", "فينير", "veneers"],
    reply: "نقدم ابتسامة هوليود بأحدث تقنيات قشور البورسلين والزيركون. ✨ تواصل معنا على 0796317293 لمعرفة المزيد.",
  },
  {
    keywords: ["عصب", "حشو عصب", "root canal", "علاج العصب"],
    reply: "نقدم علاج قنوات العصب بأحدث الأجهزة لضمان راحتك وسلامتك. 🦷 للحجز: 0796317293.",
  },
  {
    keywords: ["تنظيف", "جير", "cleaning", "تلميع"],
    reply: "نقدم خدمة تنظيف الأسنان وإزالة الجير والتصبغات بأحدث الأجهزة. للحجز: 0796317293 واتساب. 😊",
  },
  {
    keywords: ["موقع", "عنوان", "وين", "فين", "اين", "إربد", "location", "address"],
    reply: "العيادة موجودة في إربد، الأردن. 📍 للحصول على الموقع الدقيق تواصل معنا على واتساب: 0796317293",
  },
  {
    keywords: ["الطبيب", "دكتور", "طارق", "الهيجاوي", "خبرة"],
    reply: "الدكتور طارق الهيجاوي متخصص في طب وزراعة وتجميل الأسنان، ولديه خبرة تزيد عن 21 عاماً في خدمة المرضى. 🏆 نلتزم بأعلى معايير الجودة والدقة.",
  },
  {
    keywords: ["شكرا", "شكراً", "ممتاز", "مرحبا", "اهلا", "أهلاً", "السلام"],
    reply: "أهلاً وسهلاً! 😊 كيف يمكنني مساعدتك اليوم؟ نحن هنا لخدمتك في كل ما يخص صحة أسنانك.",
  },
];

const RULES_EN: RuleEntry[] = [
  {
    keywords: ["hours", "working hours", "open", "close", "schedule", "when"],
    reply: "We're open Saturday to Thursday, 9AM–8PM. Friday is closed. 📅 To book an appointment, contact us on WhatsApp: +962 79 631 7293",
  },
  {
    keywords: ["book", "appointment", "schedule", "reserve"],
    reply: "We'd love to help! 😊 To book an appointment:\n📞 Phone: +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\nWe're open Sat–Thu, 9AM–8PM.",
  },
  {
    keywords: ["price", "cost", "how much", "fee", "charge"],
    reply: "Prices vary depending on each case and treatment type. We offer free consultations to assess your needs. 📞 Call or WhatsApp us at +962 79 631 7293.",
  },
  {
    keywords: ["implant", "dental implant", "implants"],
    reply: "We specialize in dental implants using world-class brands. Dr. Tareq has 21+ years of experience. 🦷 For pricing and appointments: +962 79 631 7293 (WhatsApp).",
  },
  {
    keywords: ["whitening", "bleaching", "white teeth"],
    reply: "We offer safe, instant teeth whitening results in a single session! 😁 Book via WhatsApp: +962 79 631 7293.",
  },
  {
    keywords: ["braces", "orthodontic", "invisalign", "clear aligner"],
    reply: "We offer both metal braces and clear aligners (Invisalign). The best option is determined after examination. 📞 +962 79 631 7293.",
  },
  {
    keywords: ["hollywood", "veneers", "smile makeover", "porcelain"],
    reply: "We create Hollywood smiles using the latest porcelain and zirconia veneer techniques. ✨ Contact us at +962 79 631 7293.",
  },
  {
    keywords: ["root canal", "nerve", "canal"],
    reply: "We perform root canal treatments with the latest technology for your comfort. 🦷 Book at +962 79 631 7293.",
  },
  {
    keywords: ["cleaning", "scaling", "tartar"],
    reply: "We offer professional dental cleaning and tartar removal. Book via WhatsApp: +962 79 631 7293. 😊",
  },
  {
    keywords: ["location", "address", "where", "irbid"],
    reply: "Our clinic is located in Irbid, Jordan. 📍 For the exact address, contact us on WhatsApp: +962 79 631 7293.",
  },
  {
    keywords: ["doctor", "dr", "tareq", "experience"],
    reply: "Dr. Tareq Al-Hijawi is a specialist in dental medicine, implants, and cosmetics with 21+ years of experience. 🏆 We're committed to the highest standards of care.",
  },
  {
    keywords: ["hello", "hi", "thanks", "thank you", "hey"],
    reply: "Hello! 😊 How can I help you today? We're here for all your dental health needs.",
  },
];

function ruleBasedReply(userText: string, lang: string): string {
  const text = userText.toLowerCase();
  const rules = lang === "en" ? RULES_EN : RULES_AR;

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.reply;
    }
  }

  return lang === "en"
    ? "Thank you for your question! For more details, please contact us directly:\n📞 +962 79 631 7293\n💬 WhatsApp: +962 79 631 7293\nWe're open Sat–Thu, 9AM–8PM. 😊"
    : "شكراً لسؤالك! للحصول على مزيد من المعلومات يرجى التواصل معنا مباشرة:\n📞 0796317293\n💬 واتساب: 0796317293\nنعمل السبت–الخميس 9ص–8م. 😊";
}

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

  const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
  const userText: string = lastUserMessage?.content ?? "";

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_completion_tokens: 400,
        messages: [
          { role: "system", content: lang === "en" ? SYSTEM_EN : SYSTEM_AR },
          ...messages.slice(-10),
        ],
      });
      const reply = completion.choices[0]?.message?.content ?? "";
      return res.json({ reply });
    } catch (err: any) {
      console.error("OpenAI error, falling back:", err?.message);
    }
  }

  const reply = ruleBasedReply(userText, lang ?? "ar");
  return res.json({ reply });
}
