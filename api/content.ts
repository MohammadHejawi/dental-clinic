import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ─── Text defaults — seeded once on first request ─────────────────────────────
const TEXT_DEFAULTS: Array<{ key: string; ar: string; en: string }> = [
  { key: "navHome",          ar: "الرئيسية",      en: "Home" },
  { key: "navServices",      ar: "خدماتنا",       en: "Services" },
  { key: "navAbout",         ar: "عن الطبيب",     en: "About" },
  { key: "navGallery",       ar: "المعرض",        en: "Gallery" },
  { key: "navTestimonials",  ar: "آراء العملاء",  en: "Testimonials" },
  { key: "navContact",       ar: "اتصل بنا",      en: "Contact" },
  { key: "bookNow",          ar: "احجز موعد",     en: "Book Now" },
  { key: "heroTag",    ar: "عيادة متخصصة بتجميل الأسنان", en: "Specialized Dental & Cosmetic Clinic" },
  { key: "heroTitle1", ar: "ابتسامتك صحة..", en: "Your Smile Is" },
  { key: "heroTitle2", ar: "وصحتك أمانة",   en: "Our Commitment" },
  { key: "heroSub",    ar: "نقدم لكم أفضل خدمات طب وتجميل الأسنان بأيدٍ متخصصة وتجهيزات حديثة لضمان راحة وسلامة مرضانا والحصول على ابتسامة أحلامهم.", en: "We offer the finest dental and cosmetic care with expert hands and modern technology to ensure patient comfort and the smile of their dreams." },
  { key: "heroBtn1",   ar: "احجز موعد الآن",   en: "Book an Appointment" },
  { key: "heroBtn2",   ar: "تعرف على خدماتنا", en: "Explore Our Services" },
  { key: "heroYears",  ar: "عاماً من الخبرة",   en: "Years of Experience" },
  { key: "svcTag",   ar: "خدماتنا",              en: "Our Services" },
  { key: "svcTitle", ar: "رعاية شاملة لصحة فمك", en: "Comprehensive Oral Care" },
  { key: "svcSub",   ar: "نقدم طيفاً شاملاً من خدمات طب وتجميل الأسنان لتلبية كافة احتياجاتك تحت سقف واحد.", en: "We provide a full spectrum of dental and cosmetic services to meet all your needs under one roof." },
  { key: "abtTag",   ar: "عن الطبيب",                    en: "About The Doctor" },
  { key: "abtName",  ar: "الدكتور طارق الهيجاوي",         en: "Dr. Tareq Al-Hijawi" },
  { key: "abtTitle", ar: "أخصائي طب وتجميل الأسنان",      en: "Specialist in Dental & Cosmetic Dentistry" },
  { key: "abtBio",   ar: "يحمل الدكتور طارق شهادة البكالوريوس في طب الأسنان، مع تخصص دقيق في طب تجميل الأسنان والتركيبات. عضو الهيئة الأردنية لزراعة الأسنان. عمل مع نخبة من أفضل المراكز الطبية في الأردن والخارج، ويتميز بأسلوبه اللطيف ودقته العالية في العمل، مما يضمن تجربة مريحة وخالية من الألم لجميع مرضاه.", en: "Dr. Tareq holds a Bachelor's degree in Dentistry, with advanced specialization in cosmetic dentistry and prosthetics. He is a member of the Jordan Implant Board. He has worked with leading medical centers in Jordan and abroad, and is known for his gentle approach and exceptional precision — ensuring a comfortable, pain-free experience for all patients." },
  { key: "abtCred1", ar: "عضو الهيئة الأردنية لزراعة الأسنان",       en: "Member – Jordan Implant Board" },
  { key: "abtCred2", ar: "خبرة تزيد عن 15 عاماً في طب الأسنان",   en: "15+ Years of Dental Experience" },
  { key: "abtCred3", ar: "آلاف الحالات الناجحة والموثقة",            en: "Thousands of Successful Cases" },
  { key: "abtCred4", ar: "استخدام أحدث تقنيات طب الأسنان الرقمي",  en: "Latest Digital Dentistry Technologies" },
  { key: "abtBtn",   ar: "تواصل مع الطبيب",                         en: "Contact The Doctor" },
  { key: "clinicTag",   ar: "عيادتنا",                     en: "Our Clinic" },
  { key: "clinicTitle", ar: "بيئة مريحة وتجهيزات متكاملة", en: "A Comfortable Environment & Full Equipment" },
  { key: "clinicSub",   ar: "عيادتنا مجهزة بأحدث الأجهزة الطبية في بيئة نظيفة ومريحة تجعل زيارتك تجربة إيجابية من البداية للنهاية.", en: "Our clinic is equipped with the latest medical devices in a clean and comfortable environment that makes your visit a positive experience from start to finish." },
  { key: "galTag",    ar: "معرض الحالات",           en: "Case Gallery" },
  { key: "galTitle",  ar: "نتائج تتحدث عن نفسها",   en: "Results That Speak for Themselves" },
  { key: "galSub",    ar: "شاهد التحول المذهل لابتسامات مرضانا قبل وبعد تلقي العلاج في عيادتنا.", en: "Witness the remarkable transformation of our patients' smiles before and after treatment." },
  { key: "galAfter",  ar: "بعد العلاج", en: "After" },
  { key: "galBefore", ar: "قبل العلاج", en: "Before" },
  { key: "tstTag",   ar: "آراء العملاء",      en: "Patient Reviews" },
  { key: "tstTitle", ar: "ما يقوله مراجعونا", en: "What Our Patients Say" },
  { key: "conTag",       ar: "تواصل معنا",      en: "Get In Touch" },
  { key: "conTitle",     ar: "نحن هنا لخدمتك",  en: "We Are Here For You" },
  { key: "conSub",       ar: "احجز موعدك الآن أو تواصل معنا لأي استفسار. فريقنا الطبي مستعد دائماً لتقديم الرعاية التي تستحقها.", en: "Book your appointment now or contact us for any inquiry. Our medical team is always ready to provide the care you deserve." },
  { key: "conPhone",     ar: "الهاتف",            en: "Phone" },
  { key: "conLocation",  ar: "الموقع",            en: "Location" },
  { key: "conAddress",   ar: "شارع الهاشمي 141، إربد 21110، الأردن", en: "Al-Hashmi St. 141, Irbid 21110, Jordan" },
  { key: "conHours",     ar: "ساعات العمل",       en: "Working Hours" },
  { key: "conHoursVal",  ar: "السبت – الخميس: 9:00 ص – 8:00 م", en: "Sat – Thu: 9:00 AM – 8:00 PM" },
  { key: "conClosed",    ar: "الجمعة مغلق",       en: "Friday: Closed" },
  { key: "conWA",        ar: "راسلنا على واتساب", en: "WhatsApp Us" },
  { key: "conMapTitle",  ar: "موقعنا على الخريطة", en: "Our Location" },
  { key: "conFormTitle", ar: "احجز موعدك",        en: "Book Your Appointment" },
  { key: "conName",      ar: "الاسم الكامل",      en: "Full Name" },
  { key: "conNamePh",    ar: "أدخل اسمك",         en: "Enter your name" },
  { key: "conPhoneL",    ar: "رقم الهاتف",        en: "Phone Number" },
  { key: "conPhonePh",   ar: "أدخل رقم هاتفك",   en: "Enter your phone number" },
  { key: "conService",   ar: "الخدمة المطلوبة",   en: "Requested Service" },
  { key: "conServicePh", ar: "اختر الخدمة",       en: "Select a service" },
  { key: "conMsg",       ar: "رسالتك",            en: "Your Message" },
  { key: "conMsgPh",     ar: "أخبرنا بما تحتاجه..", en: "Tell us what you need.." },
  { key: "conSend",      ar: "إرسال الطلب",       en: "Send Request" },
  { key: "conSending",   ar: "جار الإرسال...",    en: "Sending..." },
  { key: "conSuccess",   ar: "تم الإرسال بنجاح!", en: "Sent Successfully!" },
  { key: "conSuccessSub",ar: "سنتواصل معك قريباً لتأكيد الموعد.", en: "We will contact you shortly to confirm your appointment." },
  { key: "footerDesc",    ar: "عيادة متخصصة في طب وتجميل الأسنان تقدم خدمات علاجية وتجميلية بأعلى معايير الجودة والسلامة.", en: "A specialized dental and cosmetic clinic offering treatment and cosmetic services to the highest quality and safety standards." },
  { key: "footerLinks",   ar: "روابط سريعة",       en: "Quick Links" },
  { key: "footerContact", ar: "معلومات التواصل",   en: "Contact Info" },
  { key: "footerRights",  ar: "جميع الحقوق محفوظة", en: "All Rights Reserved" },
  { key: "followUs",      ar: "تابعنا على",         en: "Follow Us" },
];

async function seedTextContent() {
  try {
    for (const item of TEXT_DEFAULTS) {
      await pool.query(
        `INSERT INTO site_content (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO NOTHING`,
        [`${item.key}_ar`, item.ar]
      );
      await pool.query(
        `INSERT INTO site_content (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO NOTHING`,
        [`${item.key}_en`, item.en]
      );
    }
  } catch (_err) {
    // silent fail — seeds are optional defaults
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      // Seed text defaults on every GET (DO NOTHING if already seeded)
      await seedTextContent();
      const { rows } = await pool.query("SELECT key, value FROM site_content ORDER BY key");
      const content: Record<string, string> = {};
      for (const row of rows) content[row.key] = row.value;
      return res.json({ success: true, content });
    } catch (_err) {
      return res.status(500).json({ success: false, error: "DB error" });
    }
  }

  if (req.method === "POST") {
    const adminPassword = process.env.ADMIN_PASSWORD || "clinic2024";
    const { password, updates } = req.body as { password: string; updates: Record<string, string> };

    if (password !== adminPassword) {
      return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
    }
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ success: false, error: "Missing updates" });
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
    } catch (_err) {
      return res.status(500).json({ success: false, error: "DB error" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
