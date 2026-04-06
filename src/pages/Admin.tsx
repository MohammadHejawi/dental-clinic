import React, { useState, useEffect } from "react";
import { Save, Lock, LogOut, Phone, MapPin, Clock, User, Star, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContent";

type Tab = "contact" | "doctor" | "hero";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "contact", label: "معلومات التواصل", icon: <Phone className="w-4 h-4" /> },
  { id: "doctor",  label: "نبذة الطبيب",     icon: <User  className="w-4 h-4" /> },
  { id: "hero",    label: "الصفحة الرئيسية", icon: <Star  className="w-4 h-4" /> },
];

export default function Admin() {
  const { content, get, refresh } = useSiteContent();
  const [password,  setPassword]  = useState("");
  const [authed,    setAuthed]     = useState(false);
  const [tab,       setTab]        = useState<Tab>("contact");
  const [fields,    setFields]     = useState<Record<string, string>>({});
  const [saving,    setSaving]     = useState(false);
  const [msg,       setMsg]        = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load current content into local state once it arrives
  useEffect(() => {
    if (Object.keys(content).length > 0) {
      setFields(content);
    }
  }, [content]);

  const set = (key: string, value: string) =>
    setFields(prev => ({ ...prev, [key]: value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate password against API
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, updates: {} }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setMsg({ type: "error", text: "كلمة المرور غير صحيحة" });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, updates: fields }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "تم حفظ التغييرات بنجاح ✓" });
        refresh();
      } else {
        setMsg({ type: "error", text: data.error || "حدث خطأ ما" });
      }
    } catch {
      setMsg({ type: "error", text: "تعذر الاتصال بالخادم" });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const field = (key: string, label: string, isTextarea = false, dir: "rtl" | "ltr" = "rtl") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      {isTextarea ? (
        <textarea
          rows={4}
          dir={dir}
          value={fields[key] ?? get(key, "")}
          onChange={e => set(key, e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none text-slate-800 text-sm"
        />
      ) : (
        <input
          type="text"
          dir={dir}
          value={fields[key] ?? get(key, "")}
          onChange={e => set(key, e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm"
        />
      )}
    </div>
  );

  // ── Login screen ──
  if (!authed) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">لوحة تحكم العيادة</h1>
            <p className="text-slate-500 mt-1 text-sm">أدخل كلمة المرور للمتابعة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-center text-lg tracking-widest"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              دخول
            </button>
          </form>

          {msg && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {msg.text}
            </div>
          )}

          <p className="text-center mt-6 text-xs text-slate-400">
            عيادة الدكتور طارق الهيجاوي — النظام الإداري
          </p>
        </div>
      </div>
    );
  }

  // ── Main admin panel ──
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">لوحة التحكم</h1>
            <p className="text-sm text-slate-500">عيادة الدكتور طارق الهيجاوي</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-blue-600 hover:underline">عرض الموقع ↗</a>
            <button
              onClick={() => setAuthed(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content panels */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">

          {/* Contact */}
          {tab === "contact" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                <Phone className="w-5 h-5 text-blue-600" />
                معلومات التواصل
              </h2>
              {field("phone", "رقم الهاتف / واتساب", false, "ltr")}
              <div className="grid sm:grid-cols-2 gap-4">
                {field("address_ar", "العنوان (عربي)", false, "rtl")}
                {field("address_en", "العنوان (إنجليزي)", false, "ltr")}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {field("hours_ar", "ساعات العمل (عربي)", false, "rtl")}
                {field("hours_en", "ساعات العمل (إنجليزي)", false, "ltr")}
              </div>
              {field("instagram", "رابط إنستغرام", false, "ltr")}
            </div>
          )}

          {/* Doctor */}
          {tab === "doctor" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                <User className="w-5 h-5 text-blue-600" />
                نبذة الطبيب
              </h2>
              {field("doctor_bio_ar", "النبذة الشخصية (عربي)", true, "rtl")}
              {field("doctor_bio_en", "النبذة الشخصية (إنجليزي)", true, "ltr")}
            </div>
          )}

          {/* Hero */}
          {tab === "hero" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                <Star className="w-5 h-5 text-blue-600" />
                قسم البانر الرئيسي
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {field("hero_tag_ar", "الشعار الصغير (عربي)", false, "rtl")}
                {field("hero_tag_en", "الشعار الصغير (إنجليزي)", false, "ltr")}
              </div>
              {field("hero_sub_ar", "النص التوضيحي (عربي)", true, "rtl")}
              {field("hero_sub_en", "النص التوضيحي (إنجليزي)", true, "ltr")}
            </div>
          )}
        </div>

        {/* Save bar */}
        <div className="mt-6 flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div>
            {msg && (
              <div className={`flex items-center gap-2 text-sm font-semibold ${
                msg.type === "success" ? "text-green-600" : "text-red-600"
              }`}>
                {msg.type === "success"
                  ? <CheckCircle2 className="w-5 h-5" />
                  : <AlertCircle className="w-5 h-5" />}
                {msg.text}
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
