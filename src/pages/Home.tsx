import React, { useState, useEffect, createContext, useContext } from "react";
import { useSiteContent } from "@/contexts/SiteContent";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  Droplets,
  Activity,
  Smile,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  Stethoscope,
  Instagram,
  Facebook,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Language Context ────────────────────────────────────────────────────────
type Lang = "ar" | "en";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ar",
  setLang: () => {},
});
const useLang = () => useContext(LangContext);

// ─── Translations ─────────────────────────────────────────────────────────────
const t = {
  // Navbar
  navHome:        { ar: "الرئيسية",     en: "Home" },
  navServices:    { ar: "خدماتنا",      en: "Services" },
  navAbout:       { ar: "عن الطبيب",    en: "About" },
  navGallery:     { ar: "المعرض",       en: "Gallery" },
  navTestimonials:{ ar: "آراء العملاء", en: "Testimonials" },
  navContact:     { ar: "اتصل بنا",     en: "Contact" },
  bookNow:        { ar: "احجز موعد",    en: "Book Now" },

  // Hero
  heroTag:        { ar: "عيادة متخصصة بتجميل الأسنان", en: "Specialized Dental & Cosmetic Clinic" },
  heroTitle1:     { ar: "ابتسامتك صحة..", en: "Your Smile Is" },
  heroTitle2:     { ar: "وصحتك أمانة",   en: "Our Commitment" },
  heroSub:        {
    ar: "نقدم لكم أفضل خدمات طب وتجميل الأسنان بأيدٍ متخصصة وتجهيزات حديثة لضمان راحة وسلامة مرضانا والحصول على ابتسامة أحلامهم.",
    en: "We offer the finest dental and cosmetic care with expert hands and modern technology to ensure patient comfort and the smile of their dreams.",
  },
  heroBtn1:       { ar: "احجز موعد الآن",  en: "Book an Appointment" },
  heroBtn2:       { ar: "تعرف على خدماتنا", en: "Explore Our Services" },
  heroYears:      { ar: "عاماً من الخبرة", en: "Years of Experience" },

  // Services
  svcTag:         { ar: "خدماتنا",             en: "Our Services" },
  svcTitle:       { ar: "رعاية شاملة لصحة فمك", en: "Comprehensive Oral Care" },
  svcSub:         {
    ar: "نقدم طيفاً شاملاً من خدمات طب وتجميل الأسنان لتلبية كافة احتياجاتك تحت سقف واحد.",
    en: "We provide a full spectrum of dental and cosmetic services to meet all your needs under one roof.",
  },

  svc1Title: { ar: "تبييض الأسنان",         en: "Teeth Whitening" },
  svc1Desc:  { ar: "تبييض احترافي آمن يمنحك ابتسامة ناصعة البياض في جلسة واحدة.", en: "Professional safe whitening for a brilliantly white smile in a single session." },
  svc2Title: { ar: "زراعة الأسنان",         en: "Dental Implants" },
  svc2Desc:  { ar: "حلول دائمة ومتينة لتعويض الأسنان المفقودة باستخدام أفضل الزرعات العالمية.", en: "Permanent and durable solutions for missing teeth using world-class implants." },
  svc3Title: { ar: "تقويم الأسنان",         en: "Orthodontics" },
  svc3Desc:  { ar: "تقويم معدني أو شفاف (إنفزلاين) للحصول على أسنان مرتبة وإطباق سليم.", en: "Metal or clear (Invisalign) braces for perfectly aligned teeth and correct bite." },
  svc4Title: { ar: "تنظيف الأسنان",         en: "Teeth Cleaning" },
  svc4Desc:  { ar: "تنظيف عميق وإزالة الجير والتصبغات للحفاظ على صحة لثتك وأسنانك.", en: "Deep cleaning and tartar removal to preserve the health of your gums and teeth." },
  svc5Title: { ar: "التركيبات الثابتة",     en: "Dental Prosthetics" },
  svc5Desc:  { ar: "تيجان وجسور عالية الجودة (زيركون وإيماكس) تعيد وظيفة وجمال أسنانك.", en: "High-quality crowns and bridges (Zirconia & E-max) restoring function and beauty." },
  svc6Title: { ar: "علاج العصب",            en: "Root Canal Treatment" },
  svc6Desc:  { ar: "علاج دقيق وفعال بأحدث الأجهزة لإنقاذ الأسنان المتضررة وتخفيف الألم.", en: "Precise and effective treatment with the latest equipment to save damaged teeth and relieve pain." },
  svc7Title: { ar: "ابتسامة هوليود",        en: "Hollywood Smile" },
  svc7Desc:  { ar: "قشور البورسلين والزيركون لتحقيق ابتسامة ساحرة تُشبه نجوم السينما.", en: "Porcelain and zirconia veneers for a stunning celebrity-style smile transformation." },
  svc8Title: { ar: "علاج أمراض اللثة",     en: "Gum Disease Treatment" },
  svc8Desc:  { ar: "تشخيص وعلاج شامل لأمراض اللثة والحفاظ على صحة نسيجها.", en: "Comprehensive diagnosis and treatment of gum disease to preserve healthy tissue." },

  // About
  abtTag:     { ar: "عن الطبيب",                      en: "About The Doctor" },
  abtName:    { ar: "الدكتور طارق الهيجاوي",           en: "Dr. Tareq Al-Hijawi" },
  abtTitle:   { ar: "أخصائي طب وتجميل الأسنان",        en: "Specialist in Dental & Cosmetic Dentistry" },
  abtBio:     {
    ar: "يحمل الدكتور طارق شهادة البكالوريوس في طب الأسنان، مع تخصص دقيق في طب تجميل الأسنان والتركيبات. عضو الهيئة الأردنية لزراعة الأسنان. عمل مع نخبة من أفضل المراكز الطبية في الأردن والخارج، ويتميز بأسلوبه اللطيف ودقته العالية في العمل، مما يضمن تجربة مريحة وخالية من الألم لجميع مرضاه.",
    en: "Dr. Tareq holds a Bachelor's degree in Dentistry, with advanced specialization in cosmetic dentistry and prosthetics. He is a member of the Jordan Implant Board. He has worked with leading medical centers in Jordan and abroad, and is known for his gentle approach and exceptional precision — ensuring a comfortable, pain-free experience for all patients.",
  },
  abtCred1: { ar: "عضو الهيئة الأردنية لزراعة الأسنان",          en: "Member – Jordan Implant Board" },
  abtCred2: { ar: "خبرة تزيد عن 15 عاماً في طب الأسنان",      en: "15+ Years of Dental Experience" },
  abtCred3: { ar: "آلاف الحالات الناجحة والموثقة",             en: "Thousands of Successful Cases" },
  abtCred4: { ar: "استخدام أحدث تقنيات طب الأسنان الرقمي",    en: "Latest Digital Dentistry Technologies" },
  abtBtn:   { ar: "تواصل مع الطبيب",                          en: "Contact The Doctor" },

  // Clinic Tour
  clinicTag:   { ar: "عيادتنا",                    en: "Our Clinic" },
  clinicTitle: { ar: "بيئة مريحة وتجهيزات متكاملة", en: "A Comfortable Environment & Full Equipment" },
  clinicSub:   {
    ar: "عيادتنا مجهزة بأحدث الأجهزة الطبية في بيئة نظيفة ومريحة تجعل زيارتك تجربة إيجابية من البداية للنهاية.",
    en: "Our clinic is equipped with the latest medical devices in a clean and comfortable environment that makes your visit a positive experience from start to finish.",
  },
  clinicImg1Caption: { ar: "الدكتور طارق في غرفة العلاج",  en: "Dr. Tareq in the Treatment Room" },
  clinicImg2Caption: { ar: "استقبال عيادة الدكتور طارق",   en: "Dr. Tareq Al-Hijawi Clinic Reception" },
  clinicImg3Caption: { ar: "مدخل العيادة الأنيق",          en: "Elegant Clinic Entrance" },

  // Gallery
  galTag:   { ar: "معرض الحالات",          en: "Case Gallery" },
  galTitle: { ar: "نتائج تتحدث عن نفسها", en: "Results That Speak for Themselves" },
  galSub:   {
    ar: "شاهد التحول المذهل لابتسامات مرضانا قبل وبعد تلقي العلاج في عيادتنا.",
    en: "Witness the remarkable transformation of our patients' smiles before and after treatment.",
  },
  galCase1: { ar: "تبييض الأسنان بالليزر",    en: "Laser Teeth Whitening" },
  galCase2: { ar: "ابتسامة هوليود",           en: "Hollywood Smile" },
  galCase3: { ar: "تقويم الأسنان الشفاف",     en: "Clear Orthodontics" },
  galCase4: { ar: "تركيبات الزيركون",         en: "Zirconia Prosthetics" },
  galAfter: { ar: "بعد العلاج",              en: "After" },
  galBefore:{ ar: "قبل العلاج",              en: "Before" },

  // Testimonials
  tstTag:   { ar: "آراء العملاء",      en: "Patient Reviews" },
  tstTitle: { ar: "ما يقوله مراجعونا", en: "What Our Patients Say" },

  // Contact
  conTag:      { ar: "تواصل معنا",           en: "Get In Touch" },
  conTitle:    { ar: "نحن هنا لخدمتك",       en: "We Are Here For You" },
  conSub:      {
    ar: "احجز موعدك الآن أو تواصل معنا لأي استفسار. فريقنا الطبي مستعد دائماً لتقديم الرعاية التي تستحقها.",
    en: "Book your appointment now or contact us for any inquiry. Our medical team is always ready to provide the care you deserve.",
  },
  conPhone:    { ar: "الهاتف",             en: "Phone" },
  conLocation: { ar: "الموقع",             en: "Location" },
  conAddress:  { ar: "شارع الهاشمي 141، إربد 21110، الأردن", en: "Al-Hashmi St. 141, Irbid 21110, Jordan" },
  conHours:    { ar: "ساعات العمل",        en: "Working Hours" },
  conHoursVal: { ar: "السبت – الخميس: 9:00 ص – 8:00 م", en: "Sat – Thu: 9:00 AM – 8:00 PM" },
  conClosed:   { ar: "الجمعة مغلق",        en: "Friday: Closed" },
  conWA:       { ar: "راسلنا على واتساب",  en: "WhatsApp Us" },
  conMapTitle: { ar: "موقعنا على الخريطة", en: "Our Location" },
  conFormTitle:{ ar: "احجز موعدك",         en: "Book Your Appointment" },
  conName:     { ar: "الاسم الكامل",       en: "Full Name" },
  conNamePh:   { ar: "أدخل اسمك",         en: "Enter your name" },
  conPhoneL:   { ar: "رقم الهاتف",        en: "Phone Number" },
  conPhonePh:  { ar: "أدخل رقم هاتفك",   en: "Enter your phone number" },
  conService:  { ar: "الخدمة المطلوبة",   en: "Requested Service" },
  conServicePh:{ ar: "اختر الخدمة",       en: "Select a service" },
  conMsg:      { ar: "رسالتك",            en: "Your Message" },
  conMsgPh:    { ar: "أخبرنا بما تحتاجه..", en: "Tell us what you need.." },
  conSend:     { ar: "إرسال الطلب",       en: "Send Request" },
  conSending:  { ar: "جار الإرسال...",    en: "Sending..." },
  conSuccess:  { ar: "تم الإرسال بنجاح!", en: "Sent Successfully!" },
  conSuccessSub:{ ar: "سنتواصل معك قريباً لتأكيد الموعد.", en: "We will contact you shortly to confirm your appointment." },

  // Footer
  footerDesc: {
    ar: "عيادة متخصصة في طب وتجميل الأسنان تقدم خدمات علاجية وتجميلية بأعلى معايير الجودة والسلامة.",
    en: "A specialized dental and cosmetic clinic offering treatment and cosmetic services to the highest quality and safety standards.",
  },
  footerLinks:  { ar: "روابط سريعة", en: "Quick Links" },
  footerContact:{ ar: "معلومات التواصل", en: "Contact Info" },
  footerRights: { ar: "جميع الحقوق محفوظة", en: "All Rights Reserved" },
  followUs:     { ar: "تابعنا على", en: "Follow Us" },
};

const tx = (key: keyof typeof t, lang: Lang) => t[key][lang];

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { key: "navHome", href: "#hero" },
    { key: "navServices", href: "#services" },
    { key: "navAbout", href: "#about" },
    { key: "navGallery", href: "#gallery" },
    { key: "navTestimonials", href: "#testimonials" },
    { key: "navContact", href: "#contact" },
  ] as const;

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src={`${import.meta.env.BASE_URL}images/clinic-logo.jpeg`}
            alt="عيادة الدكتور طارق الهيجاوي"
            className="w-14 h-14 object-contain rounded-xl bg-white shadow p-1"
          />
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">
              {lang === "ar" ? "د. طارق الهيجاوي" : "Dr. Tareq Al-Hijawi"}
            </h1>
            <p className="text-xs text-primary font-semibold">
              {lang === "ar" ? "لطب وتجميل الأسنان" : "Dental & Cosmetic Clinic"}
            </p>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="text-sm text-slate-600 hover:text-primary font-semibold transition-colors"
            >
              {tx(key, lang)}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary text-sm font-semibold transition-all"
          >
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <a
            href="#contact"
            className="px-5 py-2.5 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
          >
            {tx("bookNow", lang)}
          </a>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <button
            className="text-slate-700 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-5 gap-4">
              {links.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="text-lg font-semibold text-slate-700 hover:text-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {tx(key, lang)}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 text-center px-6 py-3 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/30"
              >
                {tx("bookNow", lang)}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { lang } = useLang();
  const { get } = useSiteContent();
  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-white via-blue-50 to-sky-100">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className={cn("text-center", lang === "ar" ? "lg:text-right" : "lg:text-left")}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>{get(`hero_tag_${lang}`, tx("heroTag", lang))}</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.15] mb-6">
              {tx("heroTitle1", lang)}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-700">
                {tx("heroTitle2", lang)}
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {get(`hero_sub_${lang}`, tx("heroSub", lang))}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#contact" className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all text-center">
                {tx("heroBtn1", lang)}
              </a>
              <a href="#services" className="px-8 py-4 rounded-full bg-white border-2 border-slate-200 text-slate-700 font-bold text-lg hover:border-primary hover:text-primary transition-all text-center">
                {tx("heroBtn2", lang)}
              </a>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
              {[
                { num: "15+", label: lang === "ar" ? "عاماً خبرة" : "Years Exp." },
                { num: "5000+", label: lang === "ar" ? "مريض سعيد" : "Happy Patients" },
                { num: "8", label: lang === "ar" ? "خدمات متكاملة" : "Services" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-black text-primary">{s.num}</p>
                  <p className="text-sm text-slate-500 font-semibold mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/15 border-8 border-white">
              <img
                src={`${import.meta.env.BASE_URL}images/hero-dentist.png`}
                alt={lang === "ar" ? "عيادة الأسنان" : "Dental Clinic"}
                className="w-full h-full object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, x: lang === "ar" ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, type: "spring" }}
              className={cn(
                "absolute -bottom-6 bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100",
                lang === "ar" ? "-right-4 md:-right-8" : "-left-4 md:-left-8"
              )}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">15+</p>
                <p className="text-sm font-semibold text-slate-500">{tx("heroYears", lang)}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Services ─────────────────────────────────────────────────────────────────
const Services = () => {
  const { lang } = useLang();
  const services = [
    { titleKey: "svc1Title", descKey: "svc1Desc", icon: Smile,       color: "from-sky-400 to-blue-500" },
    { titleKey: "svc2Title", descKey: "svc2Desc", icon: ShieldCheck,  color: "from-blue-500 to-indigo-600" },
    { titleKey: "svc3Title", descKey: "svc3Desc", icon: Layers,       color: "from-violet-400 to-violet-600" },
    { titleKey: "svc4Title", descKey: "svc4Desc", icon: Droplets,     color: "from-cyan-400 to-cyan-600" },
    { titleKey: "svc5Title", descKey: "svc5Desc", icon: Activity,     color: "from-sky-500 to-sky-700" },
    { titleKey: "svc6Title", descKey: "svc6Desc", icon: Stethoscope,  color: "from-blue-600 to-blue-800" },
    { titleKey: "svc7Title", descKey: "svc7Desc", icon: Sparkles,     color: "from-amber-400 to-orange-500" },
    { titleKey: "svc8Title", descKey: "svc8Desc", icon: CheckCircle2, color: "from-emerald-400 to-emerald-600" },
  ] as const;

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("svcTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{tx("svcTitle", lang)}</h3>
          <p className="text-lg text-slate-600">{tx("svcSub", lang)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeInUp}
              className="group bg-slate-50 hover:bg-white rounded-3xl p-7 border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-default"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br", svc.color)}>
                <svc.icon className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">{tx(svc.titleKey, lang)}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{tx(svc.descKey, lang)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── About ────────────────────────────────────────────────────────────────────
const About = () => {
  const { lang } = useLang();
  const { get } = useSiteContent();
  const creds = ["abtCred1", "abtCred2", "abtCred3", "abtCred4"] as const;

  return (
    <section id="about" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className={cn("order-2 lg:order-1")}
          >
            <motion.p variants={fadeInUp} className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("abtTag", lang)}</motion.p>
            <motion.h3 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900 mb-3">{tx("abtName", lang)}</motion.h3>
            <motion.p variants={fadeInUp} className="text-xl text-primary font-semibold mb-6">{tx("abtTitle", lang)}</motion.p>
            <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-8 leading-relaxed">{get(`doctor_bio_${lang}`, tx("abtBio", lang))}</motion.p>

            <motion.ul variants={stagger} className="space-y-4 mb-10">
              {creds.map((k) => (
                <motion.li key={k} variants={fadeInUp} className="flex items-center gap-3 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <span>{tx(k, lang)}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.a
              variants={fadeInUp}
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-primary transition-colors duration-300"
            >
              {tx("abtBtn", lang)}
            </motion.a>
          </motion.div>

          {/* Doctor Image */}
          <motion.div
            initial={{ opacity: 0, x: lang === "ar" ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-sky-200 rounded-full blur-3xl transform scale-110" />
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl z-10 max-h-[600px]">
              <img
                src={`${import.meta.env.BASE_URL}images/doctor-main.jpeg`}
                alt={lang === "ar" ? "الدكتور طارق الهيجاوي" : "Dr. Tareq Al-Hijawi"}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Floating credential */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className={cn(
                "absolute -bottom-6 z-20 bg-white px-6 py-4 rounded-2xl shadow-xl border border-slate-100",
                lang === "ar" ? "left-0" : "right-0"
              )}
            >
              <p className="text-3xl font-black text-primary">5000+</p>
              <p className="text-sm font-semibold text-slate-500">{lang === "ar" ? "حالة ناجحة" : "Successful Cases"}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Clinic Tour ──────────────────────────────────────────────────────────────
const ClinicTour = () => {
  const { lang } = useLang();

  const photos = [
    { img: "doctor-main.jpeg",       captionKey: "clinicImg1Caption" as const },
    { img: "clinic-reception-1.jpeg", captionKey: "clinicImg2Caption" as const },
    { img: "clinic-reception-2.jpeg", captionKey: "clinicImg3Caption" as const },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("clinicTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{tx("clinicTitle", lang)}</h3>
          <p className="text-lg text-slate-600">{tx("clinicSub", lang)}</p>
        </div>

        {/* Photos grid: large left + two stacked right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Large photo — doctor in treatment room */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-xl group"
          >
            <div className="aspect-[4/5]">
              <img
                src={`${import.meta.env.BASE_URL}images/${photos[0].img}`}
                alt={tx(photos[0].captionKey, lang)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
            <div className={cn("absolute bottom-6 px-6", lang === "ar" ? "right-0 text-right" : "left-0 text-left")}>
              <p className="text-white font-bold text-lg">{tx(photos[0].captionKey, lang)}</p>
            </div>
          </motion.div>

          {/* Two stacked reception photos */}
          <div className="flex flex-col gap-6">
            {photos.slice(1).map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i + 1) * 0.15 }}
                className="relative rounded-3xl overflow-hidden shadow-xl group flex-1"
              >
                <div className="aspect-[16/9]">
                  <img
                    src={`${import.meta.env.BASE_URL}images/${p.img}`}
                    alt={tx(p.captionKey, lang)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className={cn("absolute bottom-4 px-5", lang === "ar" ? "right-0 text-right" : "left-0 text-left")}>
                  <p className="text-white font-bold text-base">{tx(p.captionKey, lang)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
const Gallery = () => {
  const { lang } = useLang();
  const cases = [
    { img: "gallery-1.png", titleKey: "galCase1" },
    { img: "gallery-2.png", titleKey: "galCase2" },
    { img: "gallery-3.png", titleKey: "galCase3" },
    { img: "gallery-4.png", titleKey: "galCase4" },
  ] as const;

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("galTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{tx("galTitle", lang)}</h3>
          <p className="text-lg text-slate-600">{tx("galSub", lang)}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="group relative rounded-3xl overflow-hidden shadow-lg"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}images/${c.img}`}
                  alt={tx(c.titleKey, lang)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className={cn(
                  "absolute top-3 px-3 py-1 rounded-full text-white text-xs font-bold bg-primary/80 backdrop-blur-sm",
                  lang === "ar" ? "right-3" : "left-3"
                )}>
                  {tx("galAfter", lang)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h4 className="text-white font-bold text-base">{tx(c.titleKey, lang)}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instagram CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/dr.tareq_alhijawi"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <Instagram className="w-5 h-5" />
            {lang === "ar" ? "تابع المزيد من الحالات على إنستغرام" : "See More Cases on Instagram"}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────
type DbReview = { id: number; name: string; rating: number; comment: string; created_at: string };

const Testimonials = () => {
  const { lang } = useLang();
  const [dbReviews, setDbReviews] = useState<DbReview[]>([]);

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => { if (d.success) setDbReviews(d.reviews); })
      .catch(() => {});
  }, []);

  const staticReviews = [
    {
      nameAr: "سارة أحمد", nameEn: "Sara Ahmed",
      treatAr: "تبييض الأسنان", treatEn: "Teeth Whitening",
      textAr: "تجربة رائعة جداً! الدكتور طارق يده خفيفة جداً والنتيجة كانت مبهرة من أول جلسة. العيادة نظيفة والتعامل راقٍ.",
      textEn: "Amazing experience! Dr. Tareq has a very gentle touch and the results were stunning from the first session.",
      initials: "س.أ", rating: 5,
    },
    {
      nameAr: "محمد محمود", nameEn: "Mohammed Mahmoud",
      treatAr: "زراعة الأسنان", treatEn: "Dental Implants",
      textAr: "كنت خائفاً جداً من فكرة الزراعة، لكن الدكتور طمأنني وشرح لي كل الخطوات. العملية تمت بدون ألم.",
      textEn: "I was very scared about implants, but Dr. Tareq reassured me and explained every step. Painless and natural.",
      initials: "م.م", rating: 5,
    },
    {
      nameAr: "ديما خالد", nameEn: "Dima Khalid",
      treatAr: "ابتسامة هوليود", treatEn: "Hollywood Smile",
      textAr: "غيّرت ابتسامتي حياتي! شكراً للدكتور طارق على الدقة المتناهية والاهتمام بأدق التفاصيل.",
      textEn: "My smile changed my life! Thank you Dr. Tareq for your incredible precision and attention to detail.",
      initials: "د.خ", rating: 5,
    },
    {
      nameAr: "عمر عبدالله", nameEn: "Omar Abdullah",
      treatAr: "علاج العصب", treatEn: "Root Canal",
      textAr: "أفضل دكتور أسنان تعاملت معه. تخلصت من الألم المزعج في جلسة واحدة فقط.",
      textEn: "The best dentist I've ever dealt with. Got rid of the painful toothache in just one session.",
      initials: "ع.ع", rating: 5,
    },
    {
      nameAr: "نور إبراهيم", nameEn: "Nour Ibrahim",
      treatAr: "تقويم الأسنان", treatEn: "Orthodontics",
      textAr: "بعد سنتين من التقويم مع الدكتور طارق، أسناني أصبحت منتظمة تماماً.",
      textEn: "After two years of braces with Dr. Tareq, my teeth are perfectly aligned.",
      initials: "ن.إ", rating: 5,
    },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}.${parts[1][0]}` : name.slice(0, 2);
  };

  return (
    <section id="testimonials" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("tstTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900">{tx("tstTitle", lang)}</h3>
        </div>

        {/* Static Reviews */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staticReviews.slice(0, 3).map((r, i) => (
            <motion.div
              key={`static-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col"
            >
              <div className="flex text-amber-400 mb-5">
                {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-slate-700 text-base mb-8 leading-relaxed flex-1">
                "{lang === "ar" ? r.textAr : r.textEn}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                  {r.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{lang === "ar" ? r.nameAr : r.nameEn}</h4>
                  <p className="text-sm text-slate-500">{lang === "ar" ? r.treatAr : r.treatEn}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Reviews from DB */}
        {dbReviews.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {dbReviews.map((r, i) => (
              <motion.div
                key={`db-${r.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col"
              >
                <div className="flex text-amber-400 mb-5">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                  {Array.from({ length: 5 - r.rating }).map((_, j) => <Star key={`e-${j}`} className="w-5 h-5 text-slate-200 fill-current" />)}
                </div>
                <p className="text-slate-700 text-base mb-8 leading-relaxed flex-1">
                  "{r.comment}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-base flex-shrink-0">
                    {getInitials(r.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{r.name}</h4>
                    <p className="text-sm text-slate-500">{lang === "ar" ? "عميل العيادة" : "Clinic Patient"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Review Form ──────────────────────────────────────────────────────────────
const ReviewForm = () => {
  const { lang } = useLang();
  const [name, setName]       = useState("");
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating || !comment) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
            {lang === "ar" ? "شاركنا تجربتك" : "Share Your Experience"}
          </p>
          <h3 className="text-4xl font-black text-slate-900">
            {lang === "ar" ? "اترك تقييمك" : "Leave a Review"}
          </h3>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-green-50 rounded-3xl border border-green-100"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-900">
              {lang === "ar" ? "شكراً لك! تم استلام تقييمك." : "Thank you! Your review has been received."}
            </p>
            <p className="text-slate-500 mt-2">
              {lang === "ar" ? "نقدّر ثقتك بعيادتنا." : "We appreciate your trust in our clinic."}
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-slate-50 rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {lang === "ar" ? "اسمك الكريم" : "Your Name"}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-900"
                placeholder={lang === "ar" ? "أدخل اسمك..." : "Enter your name..."}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                {lang === "ar" ? "تقييمك للعيادة" : "Your Rating"}
              </label>
              <div className="flex gap-2" dir="ltr">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        s <= (hovered || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {lang === "ar" ? "تعليقك" : "Your Comment"}
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-slate-900"
                placeholder={lang === "ar" ? "شاركنا تجربتك مع العيادة..." : "Tell us about your experience with the clinic..."}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !rating}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send className="w-5 h-5" />
              {submitting
                ? (lang === "ar" ? "جارٍ الإرسال..." : "Sending...")
                : (lang === "ar" ? "إرسال التقييم" : "Submit Review")}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

// ─── Contact ──────────────────────────────────────────────────────────────────
const Contact = () => {
  const { lang } = useLang();
  const { get } = useSiteContent();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [service, setService] = useState("");
  const [msg, setMsg]         = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const text = lang === "ar"
      ? `مرحباً دكتور طارق 👋\n\nطلب حجز موعد جديد:\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n🦷 الخدمة: ${service || "لم يُحدد"}\n💬 ملاحظات: ${msg || "لا توجد"}`
      : `Hello Dr. Tareq 👋\n\nNew appointment request:\n👤 Name: ${name}\n📞 Phone: ${phone}\n🦷 Service: ${service || "Not specified"}\n💬 Notes: ${msg || "None"}`;

    const clinicPhone = get("phone", "+962796317293").replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${clinicPhone}?text=${encodeURIComponent(text)}`;

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      window.open(waUrl, "_blank");
      setTimeout(() => {
        setSuccess(false);
        setName(""); setPhone(""); setService(""); setMsg("");
      }, 4000);
    }, 800);
  };

  const services = [
    lang === "ar" ? "تبييض الأسنان" : "Teeth Whitening",
    lang === "ar" ? "زراعة الأسنان" : "Dental Implants",
    lang === "ar" ? "تقويم الأسنان" : "Orthodontics",
    lang === "ar" ? "ابتسامة هوليود" : "Hollywood Smile",
    lang === "ar" ? "علاج العصب" : "Root Canal",
    lang === "ar" ? "تنظيف الأسنان" : "Teeth Cleaning",
    lang === "ar" ? "أخرى" : "Other",
  ];

  return (
    <section id="contact" className="py-24 bg-slate-900 rounded-t-[3rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("conTag", lang)}</p>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">{tx("conTitle", lang)}</h3>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">{tx("conSub", lang)}</p>

            <div className="space-y-7 mb-10">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">{tx("conPhone", lang)}</h4>
                  <a href={`tel:${get("phone", "+962796317293")}`} dir="ltr" className="text-slate-400 hover:text-primary transition-colors block">{get("phone", "+962 79 631 7293")}</a>
                  <a href="tel:027250220" dir="ltr" className="text-slate-400 hover:text-primary transition-colors block mt-1">
                    {lang === "ar" ? "هاتف أرضي: 027250220" : "Landline: 02 725 0220"}
                  </a>
                </div>
              </div>
              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">{tx("conLocation", lang)}</h4>
                  <p className="text-slate-400">{get(`address_${lang}`, tx("conAddress", lang))}</p>
                </div>
              </div>
              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">{tx("conHours", lang)}</h4>
                  <p className="text-slate-400">{get(`hours_${lang}`, tx("conHoursVal", lang))}</p>
                  <p className="text-slate-500 text-sm">{tx("conClosed", lang)}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/962796317293"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#25D366] text-white font-bold text-lg shadow-lg shadow-[#25D366]/30 hover:bg-[#1db954] hover:-translate-y-1 transition-all mb-8"
            >
              <MessageCircle className="w-6 h-6 flex-shrink-0" />
              {tx("conWA", lang)}
            </a>

            {/* Social Links */}
            <div className="flex gap-4 mt-2">
              <a href="https://www.instagram.com/dr.tareq_alhijawi" target="_blank" rel="noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/share/18gHHhErYC/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-7">{tx("conFormTitle", lang)}</h3>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 p-8 rounded-2xl text-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-green-800 mb-2">{tx("conSuccess", lang)}</h4>
                  <p className="text-green-700">{tx("conSuccessSub", lang)}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{tx("conName", lang)}</label>
                    <input
                      type="text" required
                      placeholder={tx("conNamePh", lang)}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{tx("conPhoneL", lang)}</label>
                    <input
                      type="tel" required
                      placeholder={tx("conPhonePh", lang)}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{tx("conService", lang)}</label>
                    <select
                      value={service}
                      onChange={e => setService(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800 bg-white"
                    >
                      <option value="">{tx("conServicePh", lang)}</option>
                      {services.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{tx("conMsg", lang)}</label>
                    <textarea
                      rows={4}
                      placeholder={tx("conMsgPh", lang)}
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-blue-600 transition-colors disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="animate-pulse">{tx("conSending", lang)}</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 flex-shrink-0" />
                        {tx("conSend", lang)}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map Embed */}
            <div className="mt-6 rounded-3xl overflow-hidden border-4 border-white shadow-xl h-52">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3367.5!2d35.8497!3d32.5568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c7f0fcda52d5d%3A0x0!2zMzLCsDMzJzI0LjUiTiAzNcKwNTAnNTkuMCJF!5e0!3m2!1sar!2sjo!4v1711111111111!5m2!1sar!2sjo&q=Al-Hashmi+St+141+Irbid+Jordan"
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Clinic Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const { lang } = useLang();
  const year = new Date().getFullYear();

  const links = [
    { key: "navHome", href: "#hero" },
    { key: "navServices", href: "#services" },
    { key: "navAbout", href: "#about" },
    { key: "navGallery", href: "#gallery" },
    { key: "navTestimonials", href: "#testimonials" },
    { key: "navContact", href: "#contact" },
  ] as const;

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src={`${import.meta.env.BASE_URL}images/clinic-logo.jpeg`}
                alt="logo"
                className="w-14 h-14 object-contain rounded-xl bg-white/10 p-1.5"
              />
              <div>
                <h3 className="text-white font-extrabold text-base leading-tight">
                  {lang === "ar" ? "د. طارق الهيجاوي" : "Dr. Tareq Al-Hijawi"}
                </h3>
                <p className="text-primary text-xs font-semibold">
                  {lang === "ar" ? "لطب وتجميل الأسنان" : "Dental & Cosmetic Clinic"}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{tx("footerDesc", lang)}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-5">{tx("footerLinks", lang)}</h4>
            <ul className="space-y-3">
              {links.map(({ key, href }) => (
                <li key={key}>
                  <a href={href} className="text-sm hover:text-primary transition-colors">{tx(key, lang)}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-base mb-5">{tx("footerContact", lang)}</h4>
            <div className="space-y-3 text-sm">
              <p dir="ltr" className="hover:text-primary transition-colors"><a href="tel:+962796317293">+962 79 631 7293</a></p>
              <p>{tx("conAddress", lang)}</p>
              <p>{tx("conHoursVal", lang)}</p>
            </div>
            {/* Social */}
            <div className="mt-6">
              <p className="text-white text-sm font-semibold mb-3">{tx("followUs", lang)}</p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/dr.tareq_alhijawi" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/share/18gHHhErYC/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://wa.me/962796317293" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] text-white transition-all">
                  <MessageCircle className="w-5 h-5" />
                </a>

              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>
            © {year} {lang === "ar" ? "عيادة الدكتور طارق الهيجاوي. " : "Dr. Tareq Al-Hijawi Dental Clinic. "}
            {tx("footerRights", lang)}.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");

  // Update HTML dir when language changes
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.title =
      lang === "ar"
        ? "عيادة الدكتور طارق الهيجاوي لطب وتجميل الأسنان"
        : "Dr. Tareq Al-Hijawi – Dental & Cosmetic Clinic";
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className={cn("min-h-screen", lang === "en" ? "font-[Inter]" : "")}>
        <Navbar />
        <main>
          <Hero />
          <Services />
          <About />
          <ClinicTour />
          <Gallery />
          <Testimonials />
          <ReviewForm />
          <Contact />
        </main>
        <Footer />
      </div>
    </LangContext.Provider>
  );
}
