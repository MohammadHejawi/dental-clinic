import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
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
  Heart,
  Zap,
  Shield,
  Award,
  Crown,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Icon Map (for dynamic services) ─────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Smile, ShieldCheck, Layers, Droplets, Activity, Sparkles, Star,
  CheckCircle2, Stethoscope, Heart, Zap, Shield, Award, Crown,
  Phone, Globe,
};

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

  // Stats
  stat1Label: { ar: "عاماً خبرة",        en: "Years Exp." },
  stat2Label: { ar: "مريض سعيد",         en: "Happy Patients" },
  stat3Label: { ar: "خدمات متكاملة",     en: "Services" },

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

  // Announcement Bar
  announceBadge:   { ar: "عرض خاص", en: "Special Offer" },
  announceText:    { ar: "احجز موعد اليوم واستفد من استشارة مجانية مع الدكتور طارق!", en: "Book today and enjoy a FREE consultation with Dr. Tareq!" },
  announceBtn:     { ar: "احجز الآن", en: "Book Now" },

  // FAQ
  faqTag:   { ar: "الأسئلة الشائعة", en: "FAQ" },
  faqTitle: { ar: "أسئلة يسألها مرضانا", en: "Questions Our Patients Ask" },
  faqSub:   { ar: "نجيب على أكثر الأسئلة شيوعاً حول خدماتنا وعلاجاتنا", en: "We answer the most common questions about our services and treatments" },

  // Back to top
  backToTop: { ar: "للأعلى", en: "Top" },
};

const tx = (key: keyof typeof t, lang: Lang) => t[key][lang];

// ─── Clinic SVG Logo (3-D metallic — mirrors the clinic's original logo) ──────
const ClinicLogo = ({ size = 52, white = false }: { size?: number; white?: boolean }) => {
  const uid = React.useId().replace(/:/g, "x");

  /* The full molar crown + single-root path ---------------------------------- */
  const TOOTH = "M30,78 C27,55 33,22 54,13 C63,8 71,12 78,17 C85,12 93,8 102,13 C123,22 129,55 126,78 C123,92 118,104 114,116 C110,128 107,140 105,153 C103,161 100,165 78,164 C56,165 53,161 51,153 C49,140 46,128 42,116 C38,104 33,92 30,78 Z";

  if (white) {
    return (
      <svg width={size} height={size} viewBox="0 0 160 200" fill="none">
        <path d={TOOTH} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
        <path d="M88,14 C104,22 116,36 120,58" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M85,55 C100,62 112,76 114,96" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round"/>
        {[130,139,148,156,163,169].map((y,i)=>{const w=22-i*2.5; return(
          <path key={i} d={`M${78+2-w},${y-2} Q${78+2},${y+3} ${78+2+w},${y-2}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2.2-i*0.2} strokeLinecap="round"/>
        );})}
        <line x1="10" y1="195" x2="155" y2="12" stroke="rgba(255,255,255,0.8)" strokeWidth="4.5" strokeLinecap="round"/>
        <circle cx="155" cy="12" r="6.5" fill="rgba(255,255,255,0.85)"/>
        <ellipse cx="12" cy="192" rx="8" ry="4.5" fill="rgba(255,255,255,0.75)" transform="rotate(-47 12 192)"/>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* ── Brushed steel / radial metallic blue ── */}
        <radialGradient id={`met-${uid}`} cx="36%" cy="30%" r="68%" fx="30%" fy="25%">
          <stop offset="0%"   stopColor="#e2f3fb"/>
          <stop offset="12%"  stopColor="#a8d8f0"/>
          <stop offset="28%"  stopColor="#5aaee0"/>
          <stop offset="48%"  stopColor="#2979be"/>
          <stop offset="65%"  stopColor="#1a5c92"/>
          <stop offset="80%"  stopColor="#0e3d6a"/>
          <stop offset="100%" stopColor="#082848"/>
        </radialGradient>

        {/* ── Subtle inner shine overlay ── */}
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.28"/>
          <stop offset="55%"  stopColor="white" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>

        {/* ── Gray gradient for outline & threads ── */}
        <linearGradient id={`gry-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#cccccc"/>
          <stop offset="100%" stopColor="#929292"/>
        </linearGradient>

        {/* ── Probe gradient (metallic rod) ── */}
        <linearGradient id={`rod-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#707070"/>
          <stop offset="35%"  stopColor="#d8d8d8"/>
          <stop offset="60%"  stopColor="#ececec"/>
          <stop offset="100%" stopColor="#a0a0a0"/>
        </linearGradient>

        {/* ── Clip: left 62% = metallic filled portion ── */}
        <clipPath id={`lft-${uid}`}>
          <rect x="0" y="0" width="96" height="200"/>
        </clipPath>

        {/* ── Drop shadow for depth ── */}
        <filter id={`shd-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="3.5" floodColor="#1a4a7a" floodOpacity="0.35"/>
        </filter>
      </defs>

      {/* ══════════════════════════════════════════════
          1. GRAY OUTLINE — full tooth silhouette
      ══════════════════════════════════════════════ */}
      <path d={TOOTH} fill="none" stroke={`url(#gry-${uid})`} strokeWidth="3.2" strokeLinejoin="round"/>

      {/* ══════════════════════════════════════════════
          2. METALLIC BLUE FILL — left clipped portion
      ══════════════════════════════════════════════ */}
      <g clipPath={`url(#lft-${uid})`} filter={`url(#shd-${uid})`}>
        <path d={TOOTH} fill={`url(#met-${uid})`}/>
        {/* Shine overlay */}
        <path d={TOOTH} fill={`url(#shine-${uid})`}/>
      </g>

      {/* ══════════════════════════════════════════════
          3. DEPTH CURVES — inside right outline area
             (natural tooth cusp highlights)
      ══════════════════════════════════════════════ */}
      <path d="M87,14 C103,22 117,38 121,60"
        fill="none" stroke={`url(#gry-${uid})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.9"/>
      <path d="M84,58 C100,65 112,80 115,100"
        fill="none" stroke={`url(#gry-${uid})`} strokeWidth="2.0" strokeLinecap="round" opacity="0.65"/>

      {/* ══════════════════════════════════════════════
          4. IMPLANT SCREW THREADS (right root)
             Each thread = a concave arc, tapering down
      ══════════════════════════════════════════════ */}
      {[
        {y:132, w:24}, {y:141, w:21}, {y:150, w:18},
        {y:158, w:15}, {y:165, w:12}, {y:171, w:9}, {y:176, w:6},
      ].map(({y, w}, i) => (
        <path
          key={i}
          d={`M ${80-w},${y-2} Q 80,${y+4} ${80+w},${y-2}`}
          fill="none"
          stroke={`url(#gry-${uid})`}
          strokeWidth={2.6 - i * 0.18}
          strokeLinecap="round"
        />
      ))}

      {/* ══════════════════════════════════════════════
          5. DENTAL PROBE TOOL
             — diagonal shaft (lower-left → upper-right)
             — metallic ball tip
             — handle cap
      ══════════════════════════════════════════════ */}
      {/* Shaft */}
      <line
        x1="10" y1="192"
        x2="152" y2="14"
        stroke={`url(#rod-${uid})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Ball tip */}
      <circle cx="152" cy="14" r="7.5"
        fill="#d8d8d8" stroke="#aaaaaa" strokeWidth="1.5"/>
      <circle cx="150" cy="12" r="3"
        fill="white" opacity="0.55"/>
      {/* Handle end cap */}
      <ellipse cx="11" cy="190" rx="8.5" ry="5"
        fill={`url(#rod-${uid})`}
        transform="rotate(-52 11 190)"/>
    </svg>
  );
};

// ─── Dynamic Text Hook (DB overrides static text) ────────────────────────────
const useTx = () => {
  const { lang } = useLang();
  const { content } = useSiteContent();
  return (key: keyof typeof t, overrideLang?: Lang) => {
    const l = overrideLang ?? lang;
    return (content[`${String(key)}_${l}`] as string | undefined) ?? t[key]?.[l] ?? "";
  };
};

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
  const tx = useTx();
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
        <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img
            src={`${import.meta.env.BASE_URL}images/clinic-logo-transparent.png`}
            alt="عيادة الدكتور طارق الهيجاوي"
            className="w-14 h-14 object-contain"
          />
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight tracking-tight">
              {lang === "ar" ? "الدكتور طارق الهيجاوي" : "Dr. Tareq Al-Hijawi"}
            </h1>
            <p className="text-xs text-primary font-bold tracking-wide">
              {lang === "ar" ? "طب وزراعة وتجميل الأسنان" : "Dental, Implant & Cosmetic"}
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
  const tx = useTx();
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

            {/* SEO H2 – keywords for search engines */}
            {lang === "ar" && (
              <h2 className="sr-only">
                طبيب زراعة أسنان في اربد – أفضل دكتور تجميل أسنان اربد – زراعة الأسنان في الأردن – ابتسامة هوليود اربد
              </h2>
            )}

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
                { num: get("stat1_num", "21+"),  label: tx("stat1Label") },
                { num: get("stat3_num", "8"),     label: tx("stat3Label") },
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
                src={resolveImg(get("hero_image", "gallery-local://hero-dentist.png"))}
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
                <p className="text-2xl font-black text-slate-900">{get("stat1_num", "21+")}</p>
                <p className="text-sm font-semibold text-slate-500">{tx("heroYears")}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Services ─────────────────────────────────────────────────────────────────
type DbService = { id: number; title_ar: string; title_en: string; desc_ar: string; desc_en: string; icon: string; color: string };

const STATIC_SERVICES: DbService[] = [
  { id:1,  title_ar:"تبييض الأسنان",     title_en:"Teeth Whitening",       desc_ar:"تبييض احترافي آمن يمنحك ابتسامة ناصعة البياض في جلسة واحدة.",                                desc_en:"Professional safe whitening for a brilliantly white smile in a single session.",            icon:"Smile",        color:"from-sky-400 to-blue-500",    sort_order:1, active:true },
  { id:2,  title_ar:"زراعة الأسنان",     title_en:"Dental Implants",       desc_ar:"حلول دائمة ومتينة لتعويض الأسنان المفقودة باستخدام أفضل الزرعات العالمية.",              desc_en:"Permanent and durable solutions for missing teeth using world-class implants.",             icon:"ShieldCheck",  color:"from-blue-500 to-indigo-600", sort_order:2, active:true },
  { id:3,  title_ar:"تقويم الأسنان",     title_en:"Orthodontics",          desc_ar:"تقويم معدني أو شفاف (إنفزلاين) للحصول على أسنان مرتبة وإطباق سليم.",                    desc_en:"Metal or clear (Invisalign) braces for perfectly aligned teeth and correct bite.",         icon:"Layers",       color:"from-violet-400 to-violet-600",sort_order:3, active:true },
  { id:4,  title_ar:"تنظيف الأسنان",     title_en:"Teeth Cleaning",        desc_ar:"تنظيف عميق وإزالة الجير والتصبغات للحفاظ على صحة لثتك وأسنانك.",                       desc_en:"Deep cleaning and tartar removal to preserve the health of your gums and teeth.",           icon:"Droplets",     color:"from-cyan-400 to-cyan-600",   sort_order:4, active:true },
  { id:5,  title_ar:"التركيبات الثابتة", title_en:"Dental Prosthetics",    desc_ar:"تيجان وجسور عالية الجودة (زيركون وإيماكس) تعيد وظيفة وجمال أسنانك.",                   desc_en:"High-quality crowns and bridges (Zirconia & E-max) restoring function and beauty.",        icon:"Activity",     color:"from-sky-500 to-sky-700",     sort_order:5, active:true },
  { id:6,  title_ar:"علاج العصب",        title_en:"Root Canal Treatment",  desc_ar:"علاج دقيق وفعال بأحدث الأجهزة لإنقاذ الأسنان المتضررة وتخفيف الألم.",                  desc_en:"Precise treatment with the latest equipment to save damaged teeth and relieve pain.",       icon:"Stethoscope",  color:"from-blue-600 to-blue-800",   sort_order:6, active:true },
  { id:7,  title_ar:"ابتسامة هوليود",   title_en:"Hollywood Smile",       desc_ar:"قشور البورسلين والزيركون لتحقيق ابتسامة ساحرة تُشبه نجوم السينما.",                     desc_en:"Porcelain and zirconia veneers for a stunning celebrity-style smile transformation.",       icon:"Sparkles",     color:"from-amber-400 to-orange-500",sort_order:7, active:true },
  { id:8,  title_ar:"علاج أمراض اللثة", title_en:"Gum Disease Treatment", desc_ar:"تشخيص وعلاج شامل لأمراض اللثة والحفاظ على صحة نسيجها.",                                desc_en:"Comprehensive diagnosis and treatment of gum disease to preserve healthy tissue.",           icon:"CheckCircle2", color:"from-emerald-400 to-emerald-600",sort_order:8,active:true },
];

const Services = () => {
  const { lang } = useLang();
  const tx = useTx();
  const [services, setServices] = useState<DbService[]>(STATIC_SERVICES);

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(d => { if (d.success && d.services?.length > 0) setServices(d.services); })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("svcTag", lang)}</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{tx("svcTitle", lang)}</h2>
          {lang === "ar" && <p className="sr-only">زراعة الأسنان في الأردن – ابتسامة هوليود اربد – تقويم أسنان – تبييض أسنان اربد</p>}
          <p className="text-lg text-slate-600">{tx("svcSub", lang)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => {
            const IconComp = ICON_MAP[svc.icon] ?? Star;
            return (
              <motion.div
                key={svc.id ?? i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeInUp}
                className="group bg-slate-50 hover:bg-white rounded-3xl p-7 border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-default"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br", svc.color)}>
                  <IconComp className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-3">
                  {lang === "ar" ? svc.title_ar : svc.title_en}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {lang === "ar" ? svc.desc_ar : svc.desc_en}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── About ────────────────────────────────────────────────────────────────────
const About = () => {
  const { lang } = useLang();
  const { get } = useSiteContent();
  const tx = useTx();
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
                src={resolveImg(get("doctor_image", "gallery-local://doctor-main.jpeg"))}
                alt={lang === "ar" ? "الدكتور طارق الهيجاوي" : "Dr. Tareq Al-Hijawi"}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Clinic Tour ──────────────────────────────────────────────────────────────
type DbClinicImage = { id: number; image_url: string; caption_ar: string; caption_en: string; sort_order: number };

const ClinicTour = () => {
  const { lang } = useLang();
  const tx = useTx();
  const [photos, setPhotos] = useState<DbClinicImage[]>([]);

  useEffect(() => {
    fetch("/api/clinic-images")
      .then(r => r.json())
      .then(d => { if (d.success && d.images?.length > 0) setPhotos(d.images); })
      .catch(() => {});
  }, []);

  if (photos.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("clinicTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{tx("clinicTitle", lang)}</h3>
          <p className="text-lg text-slate-600">{tx("clinicSub", lang)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* First photo — large */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden shadow-xl group"
          >
            <div className="aspect-[4/5]">
              <img src={resolveImg(photos[0].image_url)}
                alt={lang === "ar" ? photos[0].caption_ar : photos[0].caption_en}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
            {(photos[0].caption_ar || photos[0].caption_en) && (
              <div className={cn("absolute bottom-6 px-6", lang === "ar" ? "right-0 text-right" : "left-0 text-left")}>
                <p className="text-white font-bold text-lg">
                  {lang === "ar" ? photos[0].caption_ar : photos[0].caption_en}
                </p>
              </div>
            )}
          </motion.div>

          {/* Rest of photos stacked */}
          <div className="flex flex-col gap-6">
            {photos.slice(1).map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: (i + 1) * 0.15 }}
                className="relative rounded-3xl overflow-hidden shadow-xl group flex-1"
              >
                <div className="aspect-[16/9]">
                  <img src={resolveImg(p.image_url)}
                    alt={lang === "ar" ? p.caption_ar : p.caption_en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                {(p.caption_ar || p.caption_en) && (
                  <div className={cn("absolute bottom-4 px-5", lang === "ar" ? "right-0 text-right" : "left-0 text-left")}>
                    <p className="text-white font-bold text-base">
                      {lang === "ar" ? p.caption_ar : p.caption_en}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
type DbGalleryItem = { id: number; title_ar: string; title_en: string; image_url: string };

const BASE = import.meta.env.BASE_URL;
const resolveImg = (url: string) =>
  url.startsWith("gallery-local://")
    ? `${BASE}images/${url.replace("gallery-local://", "")}`
    : url;

const Gallery = () => {
  const { lang } = useLang();
  const tx = useTx();
  const [items, setItems] = useState<DbGalleryItem[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.json())
      .then(d => { if (d.success && d.items?.length > 0) setItems(d.items); })
      .catch(() => {});
  }, []);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("galTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{tx("galTitle", lang)}</h3>
          <p className="text-lg text-slate-600">{tx("galSub", lang)}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((c, i) => (
            <motion.div
              key={c.id ?? i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="group relative rounded-3xl overflow-hidden shadow-lg"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={resolveImg(c.image_url)}
                  alt={lang === "ar" ? c.title_ar : c.title_en}
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
                  <h4 className="text-white font-bold text-base">
                    {lang === "ar" ? c.title_ar : c.title_en}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social CTAs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
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
          <a
            href="https://www.facebook.com/share/18gHHhErYC/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <Facebook className="w-5 h-5" />
            {lang === "ar" ? "تابعنا على فيسبوك" : "Follow Us on Facebook"}
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
  const tx = useTx();
  const [dbReviews, setDbReviews] = useState<DbReview[]>([]);
  const [expanded, setExpanded] = useState(false);

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
      initials: "س.أ", rating: 5, color: "bg-blue-100 text-primary",
    },
    {
      nameAr: "محمد محمود", nameEn: "Mohammed Mahmoud",
      treatAr: "زراعة الأسنان", treatEn: "Dental Implants",
      textAr: "كنت خائفاً جداً من فكرة الزراعة، لكن الدكتور طمأنني وشرح لي كل الخطوات. العملية تمت بدون ألم.",
      textEn: "I was very scared about implants, but Dr. Tareq reassured me and explained every step. Painless and natural.",
      initials: "م.م", rating: 5, color: "bg-blue-100 text-primary",
    },
    {
      nameAr: "ديما خالد", nameEn: "Dima Khalid",
      treatAr: "ابتسامة هوليود", treatEn: "Hollywood Smile",
      textAr: "غيّرت ابتسامتي حياتي! شكراً للدكتور طارق على الدقة المتناهية والاهتمام بأدق التفاصيل.",
      textEn: "My smile changed my life! Thank you Dr. Tareq for your incredible precision and attention to detail.",
      initials: "د.خ", rating: 5, color: "bg-blue-100 text-primary",
    },
    {
      nameAr: "عمر عبدالله", nameEn: "Omar Abdullah",
      treatAr: "علاج العصب", treatEn: "Root Canal",
      textAr: "أفضل دكتور أسنان تعاملت معه. تخلصت من الألم المزعج في جلسة واحدة فقط.",
      textEn: "The best dentist I've ever dealt with. Got rid of the painful toothache in just one session.",
      initials: "ع.ع", rating: 5, color: "bg-blue-100 text-primary",
    },
    {
      nameAr: "نور إبراهيم", nameEn: "Nour Ibrahim",
      treatAr: "تقويم الأسنان", treatEn: "Orthodontics",
      textAr: "بعد سنتين من التقويم مع الدكتور طارق، أسناني أصبحت منتظمة تماماً.",
      textEn: "After two years of braces with Dr. Tareq, my teeth are perfectly aligned.",
      initials: "ن.إ", rating: 5, color: "bg-blue-100 text-primary",
    },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}.${parts[1][0]}` : name.slice(0, 2);
  };

  // Combine DB reviews (most recent first) + static reviews
  const dbCards = dbReviews.map(r => ({
    nameAr: r.name, nameEn: r.name,
    treatAr: "عميل العيادة", treatEn: "Clinic Patient",
    textAr: r.comment, textEn: r.comment,
    initials: getInitials(r.name),
    rating: r.rating,
    color: "bg-green-100 text-green-600",
  }));

  const allReviews = [...dbCards, ...staticReviews];
  const visibleReviews = expanded ? allReviews : allReviews.slice(0, 3);
  const hasMore = allReviews.length > 3;

  return (
    <section id="testimonials" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">{tx("tstTag", lang)}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900">{tx("tstTitle", lang)}</h3>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col"
            >
              <div className="flex text-amber-400 mb-5">
                {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                {Array.from({ length: 5 - r.rating }).map((_, j) => <Star key={`e-${j}`} className="w-5 h-5 text-slate-200 fill-current" />)}
              </div>
              <p className="text-slate-700 text-base mb-8 leading-relaxed flex-1">
                "{lang === "ar" ? r.textAr : r.textEn}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${r.color}`}>
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

        {/* Expand / Collapse button */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setExpanded(prev => !prev)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300"
            >
              {expanded
                ? (lang === "ar" ? "عرض أقل ↑" : "Show Less ↑")
                : (lang === "ar" ? `عرض جميع التقييمات (${allReviews.length}) ↓` : `Show All Reviews (${allReviews.length}) ↓`)
              }
            </button>
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
  const tx = useTx();
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d848.5032480389897!2d35.86147066960697!3d32.55449887322526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c7a6aeac5e58b%3A0xd6ffb24e574c09d4!2z2YjZitmK2K_YqSDYp9mE2K_Zg9iq2YjYsiDYt9in2LHZgiDYp9mE2Nfau9in2YjZig!5e0!3m2!1sar!2sjo!4v1744107600000!5m2!1sar!2sjo"
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Clinic Location"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/qRD7dUhPygaNcPdt9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {lang === "ar" ? "افتح في خرائط Google" : "Open in Google Maps"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const { lang } = useLang();
  const tx = useTx();
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
                src={`${import.meta.env.BASE_URL}images/clinic-logo-transparent.png`}
                alt="logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <h3 className="text-white font-extrabold text-base leading-tight">
                  {lang === "ar" ? "الدكتور طارق الهيجاوي" : "Dr. Tareq Al-Hijawi"}
                </h3>
                <p className="text-sky-400 text-xs font-semibold">
                  {lang === "ar" ? "طب وزراعة وتجميل الأسنان" : "Dental, Implant & Cosmetic"}
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

// ─── Announcement Bar ─────────────────────────────────────────────────────────
const AnnouncementBar = ({ onDismiss }: { onDismiss: () => void }) => {
  const { lang } = useLang();
  const { get } = useSiteContent();

  const badge = get(`announce_badge_${lang}`, tx("announceBadge", lang));
  const text  = get(`announce_text_${lang}`,  tx("announceText",  lang));
  const btn   = get(`announce_btn_${lang}`,   tx("announceBtn",   lang));

  return (
    <div className="bg-gradient-to-r from-[#1a3a5c] via-[#1e5799] to-[#1a3a5c] text-white text-sm py-2 px-4 flex items-center justify-between gap-2 relative z-50">
      <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
        <span className="bg-[#3b82f6] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
        <span className="text-white/90">{text}</span>
        <a
          href="#contact"
          className="bg-white text-[#1e5799] text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-50 transition-colors shrink-0"
        >
          {btn}
        </a>
      </div>
      <button
        onClick={onDismiss}
        className="text-white/60 hover:text-white transition-colors shrink-0 ms-2"
        aria-label="close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: { ar: "هل عمليات زراعة الأسنان مؤلمة؟", en: "Are dental implants painful?" },
    a: { ar: "تُجرى الزراعة تحت تخدير موضعي كامل ولا تشعر بأي ألم أثناء العملية. بعد انتهاء المخدّر قد تشعر بإزعاج بسيط يُعالج بمسكنات عادية.", en: "Implants are placed under full local anesthesia so you feel no pain during the procedure. Afterward, mild discomfort is easily managed with common pain relievers." },
  },
  {
    q: { ar: "كم تستغرق جلسة ابتسامة هوليود؟", en: "How long does a Hollywood Smile session take?" },
    a: { ar: "عادةً تتطلب جلستين إلى ثلاث جلسات خلال أسبوعين. في الجلسة الأولى يتم التحضير والقياس، وفي الجلسة الثانية يتم تركيب القشور النهائية.", en: "Typically 2–3 sessions over two weeks. The first session involves preparation and measurements; the second involves placing the final veneers." },
  },
  {
    q: { ar: "ما الفرق بين التقويم المعدني والشفاف (إنفزلاين)؟", en: "What is the difference between metal braces and Invisalign?" },
    a: { ar: "التقويم المعدني ثابت وفعّال لجميع الحالات. الإنفزلاين شفاف وقابل للخلع مما يسهّل التنظيف، لكنه يناسب الحالات المتوسطة وغير المعقدة. سيرشدك الدكتور طارق للخيار الأنسب.", en: "Metal braces are fixed and effective for all cases. Invisalign is clear and removable making cleaning easier, but best for mild to moderate cases. Dr. Tareq will guide you to the right option." },
  },
  {
    q: { ar: "كم عدد الجلسات المطلوبة لتبييض الأسنان؟", en: "How many sessions are needed for teeth whitening?" },
    a: { ar: "في الغالب جلسة واحدة مدتها 45–60 دقيقة كافية لنتائج ملحوظة. قد نوصي بجلسة ثانية للحالات التي تتطلب تبييضاً إضافياً.", en: "Usually a single 45–60 minute session delivers noticeable results. A second session may be recommended for cases requiring extra whitening." },
  },
  {
    q: { ar: "كيف أحجز موعداً؟", en: "How do I book an appointment?" },
    a: { ar: "يمكنك التواصل معنا عبر واتساب على الرقم 0796317293، أو ملء نموذج الحجز أسفل الصفحة، وسيتواصل معك فريقنا خلال ساعات.", en: "You can contact us via WhatsApp at 0796317293, or fill in the booking form below, and our team will get back to you within hours." },
  },
  {
    q: { ar: "ما هي أوقات عمل العيادة؟", en: "What are the clinic's working hours?" },
    a: { ar: "تعمل العيادة من السبت حتى الخميس من 9 صباحاً حتى 8 مساءً. يوم الجمعة إجازة أسبوعية.", en: "The clinic is open Saturday through Thursday from 9:00 AM to 8:00 PM. Friday is our weekly day off." },
  },
];

type FaqItem = { id?: number; question_ar: string; question_en: string; answer_ar: string; answer_en: string };

const FAQ = () => {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const [items, setItems] = useState<FaqItem[]>(
    FAQ_DATA.map((d, i) => ({ id: i, question_ar: d.q.ar, question_en: d.q.en, answer_ar: d.a.ar, answer_en: d.a.en }))
  );

  useEffect(() => {
    fetch("/api/faq")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success && d.items?.length > 0) setItems(d.items); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-gray-50" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-blue-100 text-[#1e5799] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <MessageCircle className="w-4 h-4" />
            {tx("faqTag", lang)}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {tx("faqTitle", lang)}
          </h2>
          <p className="text-gray-500 text-lg">{tx("faqSub", lang)}</p>
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start"
              >
                <span className="font-semibold text-gray-800 text-base">
                  {lang === "ar" ? item.question_ar : item.question_en}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#1e5799] shrink-0"
                >
                  <ChevronLeft className={cn("w-5 h-5", lang === "ar" ? "rotate-[-90deg]" : "rotate-90")} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {lang === "ar" ? item.answer_ar : item.answer_en}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Floating Buttons (WhatsApp + Back to Top) ────────────────────────────────
const FloatingButtons = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 end-5 z-50 flex flex-col gap-3 items-end">
      {/* Back to Top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-[#1e5799] hover:bg-blue-50 transition-colors"
            title="Back to top"
          >
            <ChevronLeft className="w-5 h-5 -rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WhatsApp */}
      <motion.a
        href="https://wa.me/962796317293"
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
        title="WhatsApp"
        style={{ backgroundColor: "#25D366" }}
      >
        {/* pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white relative z-10">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.468 2.025 7.77L0 32l8.44-2.207A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.07 22.29c-.34.957-1.99 1.83-2.72 1.948-.694.11-1.57.156-2.532-.16a22.86 22.86 0 0 1-2.295-.847C12.6 21.63 10.1 18.5 9.9 18.24c-.198-.262-1.62-2.155-1.62-4.113s1.026-2.92 1.39-3.32c.363-.4.794-.5 1.06-.5.264 0 .528.002.76.014.243.013.57-.092.89.68.34.8 1.16 2.76 1.26 2.96.1.2.166.433.033.7-.133.265-.2.43-.397.662-.197.232-.415.52-.594.698-.197.198-.403.412-.173.808.23.397 1.022 1.686 2.194 2.73 1.507 1.344 2.778 1.76 3.174 1.958.397.198.63.165.863-.1.232-.264.993-1.16 1.258-1.557.264-.397.53-.33.893-.198.364.132 2.316 1.092 2.713 1.29.397.198.663.297.76.463.1.165.1.957-.24 1.914z" />
        </svg>
      </motion.a>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");
  const { get } = useSiteContent();
  const announceEnabled = get("announce_enabled", "true") !== "false";
  const [showAnnounce, setShowAnnounce] = useState(true);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.title =
      lang === "ar"
        ? "أفضل عيادة لزراعة وتجميل الأسنان في إربد – الدكتور طارق الهيجاوي"
        : "Best Dental Implant & Cosmetic Clinic in Irbid – Dr. Tareq Al-Hijawi";
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className={cn("min-h-screen", lang === "en" ? "font-[Inter]" : "")}>
        <AnimatePresence>
          {showAnnounce && announceEnabled && (
            <motion.div
              key="announce"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnnouncementBar onDismiss={() => setShowAnnounce(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        <Navbar />
        <main>
          <Hero />
          <Services />
          <About />
          <ClinicTour />
          <Gallery />
          <Testimonials />
          <ReviewForm />
          <FAQ />
          <Contact />
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </LangContext.Provider>
  );
}
