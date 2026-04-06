import React, { useState, useEffect, useCallback } from "react";
import {
  Save, Lock, LogOut, Phone, User, Star, CheckCircle2, AlertCircle,
  Loader2, Trash2, MessageSquare, RefreshCw, Globe, Plus, Edit2,
  X, ImageIcon, Layers, ChevronUp, ChevronDown, Eye, EyeOff,
  Smile, ShieldCheck, Droplets, Activity, Sparkles, Stethoscope,
  Heart, Zap, Shield, Award, Crown,
} from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContent";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "contact" | "doctor" | "hero" | "services" | "gallery" | "images" | "reviews" | "texts";

type DbReview = { id: number; name: string; rating: number; comment: string; created_at: string };

type DbService = {
  id: number; title_ar: string; title_en: string;
  desc_ar: string; desc_en: string;
  icon: string; color: string; sort_order: number; active: boolean;
};

type DbGalleryItem = {
  id: number; title_ar: string; title_en: string;
  image_url: string; sort_order: number; active: boolean;
};

type DbClinicImage = {
  id: number; image_url: string;
  caption_ar: string; caption_en: string;
  sort_order: number; active: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "contact",  label: "التواصل",   icon: <Phone         className="w-4 h-4" /> },
  { id: "doctor",   label: "الطبيب",    icon: <User          className="w-4 h-4" /> },
  { id: "hero",     label: "البانر",    icon: <Globe         className="w-4 h-4" /> },
  { id: "images",   label: "الصور",     icon: <ImageIcon     className="w-4 h-4" /> },
  { id: "texts",    label: "النصوص",    icon: <Edit2         className="w-4 h-4" /> },
  { id: "services", label: "الخدمات",   icon: <Layers        className="w-4 h-4" /> },
  { id: "gallery",  label: "المعرض",    icon: <ImageIcon     className="w-4 h-4" /> },
  { id: "reviews",  label: "التقييمات", icon: <MessageSquare className="w-4 h-4" /> },
];

const ICON_OPTIONS = [
  { name: "Smile",       comp: Smile },
  { name: "ShieldCheck", comp: ShieldCheck },
  { name: "Layers",      comp: Layers },
  { name: "Droplets",    comp: Droplets },
  { name: "Activity",    comp: Activity },
  { name: "Sparkles",    comp: Sparkles },
  { name: "Star",        comp: Star },
  { name: "CheckCircle2",comp: CheckCircle2 },
  { name: "Stethoscope", comp: Stethoscope },
  { name: "Heart",       comp: Heart },
  { name: "Zap",         comp: Zap },
  { name: "Shield",      comp: Shield },
  { name: "Award",       comp: Award },
  { name: "Crown",       comp: Crown },
];

const COLOR_OPTIONS = [
  { label: "سماوي",     value: "from-sky-400 to-blue-500",     preview: "bg-gradient-to-br from-sky-400 to-blue-500" },
  { label: "أزرق غامق", value: "from-blue-500 to-indigo-600",  preview: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { label: "بنفسجي",   value: "from-violet-400 to-violet-600", preview: "bg-gradient-to-br from-violet-400 to-violet-600" },
  { label: "فيروزي",   value: "from-cyan-400 to-cyan-600",     preview: "bg-gradient-to-br from-cyan-400 to-cyan-600" },
  { label: "أزرق",     value: "from-sky-500 to-sky-700",       preview: "bg-gradient-to-br from-sky-500 to-sky-700" },
  { label: "كحلي",     value: "from-blue-600 to-blue-800",     preview: "bg-gradient-to-br from-blue-600 to-blue-800" },
  { label: "عنبري",    value: "from-amber-400 to-orange-500",  preview: "bg-gradient-to-br from-amber-400 to-orange-500" },
  { label: "أخضر",     value: "from-emerald-400 to-emerald-600", preview: "bg-gradient-to-br from-emerald-400 to-emerald-600" },
  { label: "وردي",     value: "from-rose-400 to-rose-600",     preview: "bg-gradient-to-br from-rose-400 to-rose-600" },
  { label: "أخضر فاتح",value: "from-teal-400 to-teal-600",    preview: "bg-gradient-to-br from-teal-400 to-teal-600" },
  { label: "بنفسجي 2", value: "from-purple-400 to-purple-600", preview: "bg-gradient-to-br from-purple-400 to-purple-600" },
  { label: "زهري",     value: "from-pink-400 to-pink-600",     preview: "bg-gradient-to-br from-pink-400 to-pink-600" },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(ICON_OPTIONS.map(o => [o.name, o.comp]));

const emptyService = (): Omit<DbService, "id"> => ({
  title_ar: "", title_en: "", desc_ar: "", desc_en: "",
  icon: "Star", color: "from-sky-400 to-blue-500", sort_order: 99, active: true,
});
const emptyGallery = (): Omit<DbGalleryItem, "id"> => ({
  title_ar: "", title_en: "", image_url: "", sort_order: 99, active: true,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function Admin() {
  const { content, get, refresh } = useSiteContent();
  const [password,  setPassword]  = useState("");
  const [authed,    setAuthed]     = useState(false);
  const [tab,       setTab]        = useState<Tab>("contact");
  const [fields,    setFields]     = useState<Record<string, string>>({});
  const [saving,    setSaving]     = useState(false);
  const [msg,       setMsg]        = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reviews
  const [reviews,         setReviews]         = useState<DbReview[]>([]);
  const [reviewsLoading,  setReviewsLoading]  = useState(false);
  const [deletingReview,  setDeletingReview]  = useState<number | null>(null);

  // Services
  const [services,        setServices]        = useState<DbService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError,   setServicesError]   = useState<string | null>(null);
  const [editingSvc,      setEditingSvc]      = useState<number | "new" | null>(null);
  const [svcForm,         setSvcForm]         = useState<Omit<DbService, "id">>(emptyService());
  const [savingSvc,       setSavingSvc]       = useState(false);
  const [svcSaveError,    setSvcSaveError]    = useState<string | null>(null);
  const [deletingSvc,     setDeletingSvc]     = useState<number | null>(null);

  // Gallery
  const [gallery,         setGallery]         = useState<DbGalleryItem[]>([]);
  const [galleryLoading,  setGalleryLoading]  = useState(false);
  const [editingGal,      setEditingGal]      = useState<number | "new" | null>(null);
  const [galForm,         setGalForm]         = useState<Omit<DbGalleryItem, "id">>(emptyGallery());
  const [savingGal,       setSavingGal]       = useState(false);
  const [deletingGal,     setDeletingGal]     = useState<number | null>(null);

  // Clinic Images
  const [clinicImgs,       setClinicImgs]       = useState<DbClinicImage[]>([]);
  const [clinicImgsLoading,setClinicImgsLoading]= useState(false);
  const [editingClinic,    setEditingClinic]    = useState<number | "new" | null>(null);
  const [clinicForm,       setClinicForm]       = useState({ image_url: "", caption_ar: "", caption_en: "", sort_order: 99, active: true });
  const [savingClinic,     setSavingClinic]     = useState(false);
  const [deletingClinic,   setDeletingClinic]   = useState<number | null>(null);
  // Single image fields (hero/doctor) stored in site_content
  const [imgSaving,        setImgSaving]        = useState(false);
  // Texts tab
  const [textsSaving,      setTextsSaving]      = useState(false);
  const [openGroups,       setOpenGroups]       = useState<Set<string>>(new Set(["nav"]));

  useEffect(() => {
    if (Object.keys(content).length > 0) setFields(content);
  }, [content]);

  // ── Data loaders ──
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const d = await fetch("/api/reviews").then(r => r.json());
      if (d.success) setReviews(d.reviews);
    } finally { setReviewsLoading(false); }
  }, []);

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error(`خطأ في الخادم (${res.status})`);
      const d = await res.json();
      if (d.success) setServices(d.services);
      else throw new Error(d.error || "فشل تحميل الخدمات");
    } catch (err: any) {
      setServicesError(err?.message || "تعذر الاتصال بالخادم");
    } finally { setServicesLoading(false); }
  }, []);

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const d = await fetch("/api/gallery").then(r => r.json());
      if (d.success) setGallery(d.items);
    } finally { setGalleryLoading(false); }
  }, []);

  const fetchClinicImages = useCallback(async () => {
    setClinicImgsLoading(true);
    try {
      const d = await fetch("/api/clinic-images").then(r => r.json());
      if (d.success) setClinicImgs(d.images);
    } finally { setClinicImgsLoading(false); }
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === "reviews")  fetchReviews();
    if (tab === "services") fetchServices();
    if (tab === "gallery")  fetchGallery();
    if (tab === "images")   fetchClinicImages();
  }, [authed, tab]);

  // ── Auth ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, updates: {} }),
    });
    if (res.ok) { setAuthed(true); }
    else {
      setMsg({ type: "error", text: "كلمة المرور غير صحيحة" });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  // ── Content save ──
  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, updates: fields }),
      });
      const data = await res.json();
      if (data.success) { setMsg({ type: "success", text: "تم حفظ التغييرات بنجاح ✓" }); refresh(); }
      else setMsg({ type: "error", text: data.error || "حدث خطأ ما" });
    } catch { setMsg({ type: "error", text: "تعذر الاتصال بالخادم" }); }
    finally { setSaving(false); setTimeout(() => setMsg(null), 4000); }
  };

  // ── Reviews ──
  const deleteReview = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    setDeletingReview(id);
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setReviews(prev => prev.filter(r => r.id !== id));
    } finally { setDeletingReview(null); }
  };

  // ── Services ──
  const startEditSvc = (svc: DbService) => {
    setSvcForm({ title_ar: svc.title_ar, title_en: svc.title_en, desc_ar: svc.desc_ar, desc_en: svc.desc_en, icon: svc.icon, color: svc.color, sort_order: svc.sort_order, active: svc.active });
    setEditingSvc(svc.id);
  };
  const startNewSvc = () => { setSvcForm(emptyService()); setEditingSvc("new"); };

  const saveSvc = async () => {
    if (!svcForm.title_ar || !svcForm.title_en) {
      setSvcSaveError("الرجاء إدخال اسم الخدمة بالعربي والإنجليزي");
      setTimeout(() => setSvcSaveError(null), 4000);
      return;
    }
    setSavingSvc(true);
    setSvcSaveError(null);
    try {
      if (editingSvc === "new") {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...svcForm }),
        });
        const d = await res.json();
        if (d.success) { setServices(prev => [...prev, d.service]); setEditingSvc(null); }
        else throw new Error(d.error || "فشل الحفظ");
      } else {
        const res = await fetch(`/api/services/${editingSvc}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...svcForm }),
        });
        const d = await res.json();
        if (d.success) { setServices(prev => prev.map(s => s.id === editingSvc ? d.service : s)); setEditingSvc(null); }
        else throw new Error(d.error || "فشل التعديل");
      }
    } catch (err: any) {
      setSvcSaveError(err?.message || "تعذر الاتصال بالخادم");
      setTimeout(() => setSvcSaveError(null), 5000);
    } finally { setSavingSvc(false); }
  };

  const deleteSvc = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    setDeletingSvc(id);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await res.json();
      if (d.success) setServices(prev => prev.filter(s => s.id !== id));
      else alert("فشل حذف الخدمة: " + (d.error || "خطأ غير معروف"));
    } catch { alert("تعذر الاتصال بالخادم"); }
    finally { setDeletingSvc(null); }
  };

  const toggleSvcActive = async (svc: DbService) => {
    const d = await fetch(`/api/services/${svc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...svc, active: !svc.active }),
    }).then(r => r.json());
    if (d.success) setServices(prev => prev.map(s => s.id === svc.id ? d.service : s));
  };

  const moveSvc = async (id: number, dir: "up" | "down") => {
    const idx = services.findIndex(s => s.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === services.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const updated = [...services];
    [updated[idx].sort_order, updated[swapIdx].sort_order] = [updated[swapIdx].sort_order, updated[idx].sort_order];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setServices([...updated]);
    await Promise.all([
      fetch(`/api/services/${updated[idx].id}`,    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...updated[idx] }) }),
      fetch(`/api/services/${updated[swapIdx].id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...updated[swapIdx] }) }),
    ]);
  };

  // ── Gallery ──
  const startEditGal = (item: DbGalleryItem) => {
    setGalForm({ title_ar: item.title_ar, title_en: item.title_en, image_url: item.image_url, sort_order: item.sort_order, active: item.active });
    setEditingGal(item.id);
  };
  const startNewGal = () => { setGalForm(emptyGallery()); setEditingGal("new"); };

  const saveGal = async () => {
    if (!galForm.title_ar || !galForm.title_en || !galForm.image_url) {
      alert("الرجاء تعبئة جميع الحقول المطلوبة"); return;
    }
    setSavingGal(true);
    try {
      if (editingGal === "new") {
        const d = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...galForm }),
        }).then(r => r.json());
        if (d.success) { setGallery(prev => [...prev, d.item]); setEditingGal(null); }
      } else {
        const d = await fetch(`/api/gallery/${editingGal}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...galForm }),
        }).then(r => r.json());
        if (d.success) { setGallery(prev => prev.map(g => g.id === editingGal ? d.item : g)); setEditingGal(null); }
      }
    } finally { setSavingGal(false); }
  };

  const deleteGal = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    setDeletingGal(id);
    try {
      await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setGallery(prev => prev.filter(g => g.id !== id));
    } finally { setDeletingGal(null); }
  };

  // ── Clinic images ──
  const saveClinicImg = async () => {
    if (!clinicForm.image_url) { alert("الرجاء إدخال رابط الصورة"); return; }
    setSavingClinic(true);
    try {
      if (editingClinic === "new") {
        const d = await fetch("/api/clinic-images", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...clinicForm }),
        }).then(r => r.json());
        if (d.success) { setClinicImgs(prev => [...prev, d.image]); setEditingClinic(null); }
      } else {
        const d = await fetch(`/api/clinic-images/${editingClinic}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, ...clinicForm }),
        }).then(r => r.json());
        if (d.success) { setClinicImgs(prev => prev.map(i => i.id === editingClinic ? d.image : i)); setEditingClinic(null); }
      }
    } finally { setSavingClinic(false); }
  };

  const deleteClinicImg = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    setDeletingClinic(id);
    try {
      await fetch(`/api/clinic-images/${id}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setClinicImgs(prev => prev.filter(i => i.id !== id));
    } finally { setDeletingClinic(null); }
  };

  const moveClinicImg = async (id: number, dir: "up" | "down") => {
    const idx = clinicImgs.findIndex(i => i.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === clinicImgs.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const updated = [...clinicImgs];
    [updated[idx].sort_order, updated[swapIdx].sort_order] = [updated[swapIdx].sort_order, updated[idx].sort_order];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setClinicImgs([...updated]);
    await Promise.all([
      fetch(`/api/clinic-images/${updated[idx].id}`,    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...updated[idx] }) }),
      fetch(`/api/clinic-images/${updated[swapIdx].id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...updated[swapIdx] }) }),
    ]);
  };

  const saveHeroDoctorImages = async () => {
    setImgSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, updates: { hero_image: fields.hero_image ?? "", doctor_image: fields.doctor_image ?? "" } }),
      });
      const data = await res.json();
      if (data.success) { refresh(); setMsg({ type: "success", text: "تم حفظ الصور بنجاح ✓" }); setTimeout(() => setMsg(null), 4000); }
    } finally { setImgSaving(false); }
  };

  // ── Save all text fields ──
  const saveTexts = async () => {
    setTextsSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, updates: fields }),
      });
      const data = await res.json();
      if (data.success) { refresh(); setMsg({ type: "success", text: "تم حفظ جميع النصوص بنجاح ✓" }); setTimeout(() => setMsg(null), 4000); }
      else { setMsg({ type: "error", text: data.error || "خطأ في الحفظ" }); setTimeout(() => setMsg(null), 4000); }
    } finally { setTextsSaving(false); }
  };

  // ── Field helper ──
  const setField = (key: string, value: string) => setFields(prev => ({ ...prev, [key]: value }));

  const field = (key: string, label: string, isTextarea = false, dir: "rtl" | "ltr" = "rtl") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      {isTextarea ? (
        <textarea rows={4} dir={dir} value={fields[key] ?? get(key, "")} onChange={e => setField(key, e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none text-slate-800 text-sm" />
      ) : (
        <input type="text" dir={dir} value={fields[key] ?? get(key, "")} onChange={e => setField(key, e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
      )}
    </div>
  );

  // ── Login screen ──────────────────────────────────────────────────────────────
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
            <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-center text-lg tracking-widest" />
            <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">دخول</button>
          </form>
          {msg && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {msg.text}
            </div>
          )}
          <p className="text-center mt-6 text-xs text-slate-400">عيادة الدكتور طارق الهيجاوي — النظام الإداري</p>
        </div>
      </div>
    );
  }

  // ── Main panel ────────────────────────────────────────────────────────────────
  const iconComp = (name: string, size = "w-5 h-5") => {
    const C = ICON_MAP[name] ?? Star;
    return <C className={size} />;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">لوحة التحكم</h1>
            <p className="text-sm text-slate-500">عيادة الدكتور طارق الهيجاوي</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-blue-600 hover:underline hidden sm:block">عرض الموقع ↗</a>
            <button onClick={() => setAuthed(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition text-sm">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-1.5 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ══ CONTACT ══════════════════════════════════════════════════════════ */}
        {tab === "contact" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Phone className="w-5 h-5 text-blue-600" /> معلومات التواصل
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

        {/* ══ DOCTOR ═══════════════════════════════════════════════════════════ */}
        {tab === "doctor" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <User className="w-5 h-5 text-blue-600" /> نبذة الطبيب
            </h2>
            {field("doctor_bio_ar", "النبذة الشخصية (عربي)", true, "rtl")}
            {field("doctor_bio_en", "النبذة الشخصية (إنجليزي)", true, "ltr")}
          </div>
        )}

        {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
        {tab === "hero" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Star className="w-5 h-5 text-blue-600" /> قسم البانر الرئيسي
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {field("hero_tag_ar", "الشعار الصغير (عربي)", false, "rtl")}
              {field("hero_tag_en", "الشعار الصغير (إنجليزي)", false, "ltr")}
            </div>
            {field("hero_sub_ar", "النص التوضيحي (عربي)", true, "rtl")}
            {field("hero_sub_en", "النص التوضيحي (إنجليزي)", true, "ltr")}
          </div>
        )}

        {/* ══ IMAGES ═══════════════════════════════════════════════════════════ */}
        {tab === "images" && (
          <div className="space-y-6">

            {/* ─ Hero Image ─ */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe className="w-5 h-5 text-blue-600" /> صورة البانر الرئيسي
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">رابط الصورة</label>
                <input dir="ltr" value={fields.hero_image ?? get("hero_image", "")}
                  onChange={e => setField("hero_image", e.target.value)}
                  placeholder="https://example.com/hero-image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
              </div>
              {(fields.hero_image || get("hero_image", "")) && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-xs aspect-video">
                  <img src={(fields.hero_image || get("hero_image", "")).startsWith("gallery-local://")
                    ? `/images/${(fields.hero_image || get("hero_image", "")).replace("gallery-local://", "")}`
                    : (fields.hero_image || get("hero_image", ""))}
                    alt="معاينة" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>

            {/* ─ Doctor Image ─ */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-blue-600" /> صورة الطبيب
              </h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">رابط الصورة</label>
                <input dir="ltr" value={fields.doctor_image ?? get("doctor_image", "")}
                  onChange={e => setField("doctor_image", e.target.value)}
                  placeholder="https://example.com/doctor-photo.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
              </div>
              {(fields.doctor_image || get("doctor_image", "")) && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-[160px] aspect-[3/4]">
                  <img src={(fields.doctor_image || get("doctor_image", "")).startsWith("gallery-local://")
                    ? `/images/${(fields.doctor_image || get("doctor_image", "")).replace("gallery-local://", "")}`
                    : (fields.doctor_image || get("doctor_image", ""))}
                    alt="معاينة" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={saveHeroDoctorImages} disabled={imgSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition text-sm">
                  {imgSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {imgSaving ? "جاري الحفظ..." : "حفظ صور البانر والطبيب"}
                </button>
              </div>
              {msg && (
                <div className={`flex items-center gap-2 text-sm font-semibold ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {msg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {msg.text}
                </div>
              )}
            </div>

            {/* ─ Clinic Tour Images ─ */}
            <div className="space-y-3">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-slate-900 text-base">صور العيادة (جولة العيادة)</h3>
                  <span className="text-sm text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{clinicImgs.length} صورة</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchClinicImages}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm">
                    <RefreshCw className={`w-4 h-4 ${clinicImgsLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button onClick={() => { setClinicForm({ image_url: "", caption_ar: "", caption_en: "", sort_order: 99, active: true }); setEditingClinic("new"); }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-sm">
                    <Plus className="w-4 h-4" /> إضافة صورة
                  </button>
                </div>
              </div>

              {/* Add/Edit form */}
              {editingClinic !== null && (
                <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900">{editingClinic === "new" ? "إضافة صورة جديدة" : "تعديل الصورة"}</h4>
                    <button onClick={() => setEditingClinic(null)} className="p-2 rounded-xl hover:bg-slate-100 transition">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-600">رابط الصورة *</label>
                    <input dir="ltr" value={clinicForm.image_url} onChange={e => setClinicForm(p => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://example.com/clinic-photo.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                  </div>
                  {clinicForm.image_url && !clinicForm.image_url.startsWith("gallery-local://") && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 w-40 aspect-video">
                      <img src={clinicForm.image_url} alt="معاينة" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">التسمية التوضيحية (عربي)</label>
                      <input dir="rtl" value={clinicForm.caption_ar} onChange={e => setClinicForm(p => ({ ...p, caption_ar: e.target.value }))}
                        placeholder="مثال: غرفة العلاج"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">Caption (English)</label>
                      <input dir="ltr" value={clinicForm.caption_en} onChange={e => setClinicForm(p => ({ ...p, caption_en: e.target.value }))}
                        placeholder="e.g. Treatment Room"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setEditingClinic(null)}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-semibold text-sm">إلغاء</button>
                    <button onClick={saveClinicImg} disabled={savingClinic}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition text-sm">
                      {savingClinic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingClinic ? "جاري الحفظ..." : "حفظ"}
                    </button>
                  </div>
                </div>
              )}

              {/* Clinic images list */}
              {clinicImgsLoading ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clinicImgs.map((img, idx) => (
                    <div key={img.id} className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition ${!img.active ? "opacity-50" : ""}`}>
                      <div className="aspect-video overflow-hidden bg-slate-100 relative">
                        {img.image_url.startsWith("gallery-local://") ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs p-2 text-center">
                            <div><ImageIcon className="w-6 h-6 mx-auto mb-1" />{img.image_url.replace("gallery-local://", "")}</div>
                          </div>
                        ) : (
                          <img src={img.image_url} alt={img.caption_ar}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        )}
                        {/* Order controls overlay */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <button onClick={() => moveClinicImg(img.id, "up")} disabled={idx === 0}
                            className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white disabled:opacity-30 shadow transition">
                            <ChevronUp className="w-4 h-4 text-slate-600" />
                          </button>
                          <button onClick={() => moveClinicImg(img.id, "down")} disabled={idx === clinicImgs.length - 1}
                            className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white disabled:opacity-30 shadow transition">
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-slate-800 text-sm truncate">{img.caption_ar || "—"}</p>
                        <p className="text-slate-400 text-xs truncate mb-3">{img.caption_en || "—"}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setClinicForm({ image_url: img.image_url, caption_ar: img.caption_ar, caption_en: img.caption_en, sort_order: img.sort_order, active: img.active }); setEditingClinic(img.id); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs font-semibold">
                            <Edit2 className="w-3.5 h-3.5" /> تعديل
                          </button>
                          <button onClick={() => deleteClinicImg(img.id)} disabled={deletingClinic === img.id}
                            className="flex items-center justify-center w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                            {deletingClinic === img.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              <strong>💡 تلميح:</strong> أدخل روابط الصور من أي موقع (إنستغرام، جوجل درايف، إلخ). الصور المحلية الحالية تظهر باسمها فقط ولا يمكن معاينتها هنا.
            </div>
          </div>
        )}

        {/* ══ TEXTS ════════════════════════════════════════════════════════════ */}
        {tab === "texts" && (() => {
          const TEXT_GROUPS = [
            {
              id: "nav", title: "الشريط العلوي (القائمة)", color: "blue",
              fields: [
                { key: "navHome",         label: "الرئيسية" },
                { key: "navServices",     label: "الخدمات" },
                { key: "navAbout",        label: "عن الطبيب" },
                { key: "navGallery",      label: "المعرض" },
                { key: "navTestimonials", label: "آراء العملاء" },
                { key: "navContact",      label: "اتصل بنا" },
                { key: "bookNow",         label: "زر الحجز" },
              ],
            },
            {
              id: "hero", title: "البانر الرئيسي (العناوين والأزرار)", color: "violet",
              fields: [
                { key: "heroTag",    label: "الوسم الصغير" },
                { key: "heroTitle1", label: "السطر الأول من العنوان" },
                { key: "heroTitle2", label: "السطر الثاني من العنوان" },
                { key: "heroSub",    label: "النص التوضيحي", textarea: true },
                { key: "heroBtn1",   label: "زر الحجز" },
                { key: "heroBtn2",   label: "زر الخدمات" },
                { key: "heroYears",  label: "نص سنوات الخبرة" },
              ],
            },
            {
              id: "svc", title: "قسم الخدمات (الترويسة فقط)", color: "sky",
              fields: [
                { key: "svcTag",   label: "الوسم الصغير" },
                { key: "svcTitle", label: "العنوان الرئيسي" },
                { key: "svcSub",   label: "النص التوضيحي", textarea: true },
              ],
            },
            {
              id: "abt", title: "قسم عن الطبيب", color: "emerald",
              fields: [
                { key: "abtTag",   label: "الوسم الصغير" },
                { key: "abtName",  label: "اسم الطبيب" },
                { key: "abtTitle", label: "اللقب / التخصص" },
                { key: "abtBio",   label: "النبذة التعريفية", textarea: true },
                { key: "abtCred1", label: "الوثيقة 1" },
                { key: "abtCred2", label: "الوثيقة 2" },
                { key: "abtCred3", label: "الوثيقة 3" },
                { key: "abtCred4", label: "الوثيقة 4" },
                { key: "abtBtn",   label: "زر التواصل" },
              ],
            },
            {
              id: "clinic", title: "جولة العيادة (الترويسة)", color: "teal",
              fields: [
                { key: "clinicTag",   label: "الوسم الصغير" },
                { key: "clinicTitle", label: "العنوان الرئيسي" },
                { key: "clinicSub",   label: "النص التوضيحي", textarea: true },
              ],
            },
            {
              id: "gal", title: "معرض الحالات (الترويسة والتسميات)", color: "amber",
              fields: [
                { key: "galTag",    label: "الوسم الصغير" },
                { key: "galTitle",  label: "العنوان الرئيسي" },
                { key: "galSub",    label: "النص التوضيحي", textarea: true },
                { key: "galAfter",  label: "تسمية (بعد)" },
                { key: "galBefore", label: "تسمية (قبل)" },
              ],
            },
            {
              id: "tst", title: "آراء العملاء (الترويسة)", color: "rose",
              fields: [
                { key: "tstTag",   label: "الوسم الصغير" },
                { key: "tstTitle", label: "العنوان الرئيسي" },
              ],
            },
            {
              id: "con", title: "قسم التواصل والحجز", color: "indigo",
              fields: [
                { key: "conTag",       label: "الوسم الصغير" },
                { key: "conTitle",     label: "العنوان الرئيسي" },
                { key: "conSub",       label: "النص التوضيحي", textarea: true },
                { key: "conPhone",     label: "تسمية الهاتف" },
                { key: "conLocation",  label: "تسمية الموقع" },
                { key: "conAddress",   label: "العنوان التفصيلي" },
                { key: "conHours",     label: "تسمية ساعات العمل" },
                { key: "conHoursVal",  label: "ساعات العمل (القيمة)" },
                { key: "conClosed",    label: "يوم الإغلاق" },
                { key: "conWA",        label: "زر واتساب" },
                { key: "conMapTitle",  label: "عنوان الخريطة" },
                { key: "conFormTitle", label: "عنوان نموذج الحجز" },
                { key: "conName",      label: "حقل الاسم" },
                { key: "conNamePh",    label: "نص placeholder الاسم" },
                { key: "conPhoneL",    label: "حقل رقم الهاتف" },
                { key: "conPhonePh",   label: "نص placeholder الهاتف" },
                { key: "conService",   label: "حقل الخدمة" },
                { key: "conServicePh", label: "نص placeholder الخدمة" },
                { key: "conMsg",       label: "حقل الرسالة" },
                { key: "conMsgPh",     label: "نص placeholder الرسالة" },
                { key: "conSend",      label: "زر الإرسال" },
                { key: "conSuccess",   label: "رسالة النجاح" },
                { key: "conSuccessSub",label: "نص النجاح التوضيحي" },
              ],
            },
            {
              id: "footer", title: "الفوتر (أسفل الصفحة)", color: "slate",
              fields: [
                { key: "footerDesc",    label: "وصف العيادة", textarea: true },
                { key: "footerLinks",   label: "عنوان روابط سريعة" },
                { key: "footerContact", label: "عنوان معلومات التواصل" },
                { key: "footerRights",  label: "نص حقوق النشر" },
                { key: "followUs",      label: "نص تابعنا" },
              ],
            },
          ];

          const colorMap: Record<string, string> = {
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            violet: "bg-violet-50 border-violet-200 text-violet-700",
            sky: "bg-sky-50 border-sky-200 text-sky-700",
            emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
            teal: "bg-teal-50 border-teal-200 text-teal-700",
            amber: "bg-amber-50 border-amber-200 text-amber-700",
            rose: "bg-rose-50 border-rose-200 text-rose-700",
            indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
            slate: "bg-slate-50 border-slate-200 text-slate-700",
          };

          const toggleGroup = (id: string) => {
            setOpenGroups(prev => {
              const s = new Set(prev);
              s.has(id) ? s.delete(id) : s.add(id);
              return s;
            });
          };

          const biField = (key: string, label: string, isTextarea = false) => (
            <div key={key} className="border border-slate-100 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-slate-700">{label}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">عربي</p>
                  {isTextarea ? (
                    <textarea dir="rtl" rows={3}
                      value={fields[`${key}_ar`] ?? get(`${key}_ar`, "")}
                      onChange={e => setField(`${key}_ar`, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm resize-none" />
                  ) : (
                    <input dir="rtl"
                      value={fields[`${key}_ar`] ?? get(`${key}_ar`, "")}
                      onChange={e => setField(`${key}_ar`, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">English</p>
                  {isTextarea ? (
                    <textarea dir="ltr" rows={3}
                      value={fields[`${key}_en`] ?? get(`${key}_en`, "")}
                      onChange={e => setField(`${key}_en`, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm resize-none" />
                  ) : (
                    <input dir="ltr"
                      value={fields[`${key}_en`] ?? get(`${key}_en`, "")}
                      onChange={e => setField(`${key}_en`, e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <div className="space-y-3">
              {/* Info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-blue-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>تعديل نصوص الموقع:</strong> كل تغيير هنا يظهر فوراً على الموقع بعد الحفظ. يمكنك تعديل النص العربي والإنجليزي في نفس الوقت.
                </div>
              </div>

              {/* Groups accordion */}
              {TEXT_GROUPS.map(group => (
                <div key={group.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-right font-bold text-sm transition hover:bg-slate-50`}
                  >
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${colorMap[group.color]}`}>
                      {group.title}
                      <span className="opacity-60">({group.fields.length} حقل)</span>
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openGroups.has(group.id) ? "rotate-180" : ""}`} />
                  </button>

                  {openGroups.has(group.id) && (
                    <div className="px-6 pb-6 space-y-3 border-t border-slate-100 pt-4">
                      {group.fields.map(f => biField(f.key, f.label, (f as any).textarea))}
                    </div>
                  )}
                </div>
              ))}

              {/* Save bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm sticky bottom-0">
                <div>
                  {msg && (
                    <div className={`flex items-center gap-2 text-sm font-semibold ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {msg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {msg.text}
                    </div>
                  )}
                </div>
                <button onClick={saveTexts} disabled={textsSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
                  {textsSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {textsSaving ? "جاري الحفظ..." : "حفظ جميع النصوص"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ══ SERVICES ═════════════════════════════════════════════════════════ */}
        {tab === "services" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-slate-900">إدارة الخدمات</h2>
                <span className="text-sm text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{services.length} خدمة</span>
              </div>
              <div className="flex gap-2">
                <button onClick={fetchServices}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm">
                  <RefreshCw className={`w-4 h-4 ${servicesLoading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={startNewSvc}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-sm">
                  <Plus className="w-4 h-4" /> إضافة خدمة
                </button>
              </div>
            </div>

            {/* New / Edit form */}
            {editingSvc !== null && (
              <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 text-base">
                    {editingSvc === "new" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
                  </h3>
                  <button onClick={() => setEditingSvc(null)} className="p-2 rounded-xl hover:bg-slate-100 transition">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Titles */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">اسم الخدمة (عربي)</label>
                      <input dir="rtl" value={svcForm.title_ar} onChange={e => setSvcForm(p => ({ ...p, title_ar: e.target.value }))}
                        placeholder="مثال: تبييض الأسنان"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">Service Name (English)</label>
                      <input dir="ltr" value={svcForm.title_en} onChange={e => setSvcForm(p => ({ ...p, title_en: e.target.value }))}
                        placeholder="e.g. Teeth Whitening"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">الوصف (عربي)</label>
                      <textarea rows={3} dir="rtl" value={svcForm.desc_ar} onChange={e => setSvcForm(p => ({ ...p, desc_ar: e.target.value }))}
                        placeholder="وصف قصير للخدمة..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none text-slate-800 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">Description (English)</label>
                      <textarea rows={3} dir="ltr" value={svcForm.desc_en} onChange={e => setSvcForm(p => ({ ...p, desc_en: e.target.value }))}
                        placeholder="Short service description..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none text-slate-800 text-sm" />
                    </div>
                  </div>

                  {/* Icon picker */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600">الأيقونة</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map(opt => (
                        <button key={opt.name} onClick={() => setSvcForm(p => ({ ...p, icon: opt.name }))}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition border-2 ${
                            svcForm.icon === opt.name
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                              : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100"
                          }`} title={opt.name}>
                          <opt.comp className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color picker */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600">اللون</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => setSvcForm(p => ({ ...p, color: c.value }))}
                          title={c.label}
                          className={`w-9 h-9 rounded-xl transition ${c.preview} ${
                            svcForm.color === c.value ? "ring-4 ring-offset-2 ring-blue-600 scale-110" : "hover:scale-105"
                          }`} />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${svcForm.color}`}>
                      {iconComp(svcForm.icon, "w-7 h-7")}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{svcForm.title_ar || "اسم الخدمة"}</p>
                      <p className="text-slate-500 text-xs mt-1">{svcForm.desc_ar || "وصف الخدمة"}</p>
                    </div>
                  </div>

                  {/* Save error */}
                  {svcSaveError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {svcSaveError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => { setEditingSvc(null); setSvcSaveError(null); }}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-semibold text-sm">
                      إلغاء
                    </button>
                    <button onClick={saveSvc} disabled={savingSvc}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition text-sm">
                      {savingSvc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingSvc ? "جاري الحفظ..." : "حفظ الخدمة"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Services list */}
            {servicesLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : servicesError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-1">فشل تحميل الخدمات</strong>
                  {servicesError}
                  <button onClick={fetchServices} className="block mt-2 underline text-red-600 hover:text-red-800">إعادة المحاولة</button>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                <div className="text-4xl mb-3">🦷</div>
                <p className="font-semibold">لا توجد خدمات بعد</p>
                <p className="text-sm mt-1">اضغط "إضافة خدمة" لإضافة أول خدمة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((svc, idx) => (
                  <div key={svc.id} className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 transition ${!svc.active ? "opacity-50" : ""}`}>
                    {/* Order controls */}
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveSvc(svc.id, "up")} disabled={idx === 0} className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition">
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      </button>
                      <button onClick={() => moveSvc(svc.id, "down")} disabled={idx === services.length - 1} className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition">
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                    {/* Icon preview */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br ${svc.color}`}>
                      {iconComp(svc.icon)}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{svc.title_ar}</p>
                      <p className="text-slate-400 text-xs truncate">{svc.title_en}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSvcActive(svc)} title={svc.active ? "إخفاء" : "إظهار"}
                        className={`p-2 rounded-xl transition ${svc.active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                        {svc.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => startEditSvc(svc)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSvc(svc.id)} disabled={deletingSvc === svc.id}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                        {deletingSvc === svc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ GALLERY ══════════════════════════════════════════════════════════ */}
        {tab === "gallery" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-slate-900">إدارة المعرض</h2>
                <span className="text-sm text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{gallery.length} صورة</span>
              </div>
              <div className="flex gap-2">
                <button onClick={fetchGallery}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm">
                  <RefreshCw className={`w-4 h-4 ${galleryLoading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={startNewGal}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-sm">
                  <Plus className="w-4 h-4" /> إضافة صورة
                </button>
              </div>
            </div>

            {/* Gallery tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              <strong>💡 تلميح:</strong> أدخل رابط الصورة من الإنترنت (مثل إنستغرام أو أي موقع آخر). يمكنك نسخ رابط أي صورة وإلصاقه هنا.
            </div>

            {/* New / Edit form */}
            {editingGal !== null && (
              <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 text-base">
                    {editingGal === "new" ? "إضافة صورة جديدة" : "تعديل الصورة"}
                  </h3>
                  <button onClick={() => setEditingGal(null)} className="p-2 rounded-xl hover:bg-slate-100 transition">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Image URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-600">رابط الصورة *</label>
                    <input dir="ltr" value={galForm.image_url} onChange={e => setGalForm(p => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                  </div>

                  {/* Image preview */}
                  {galForm.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-square w-40">
                      <img src={galForm.image_url} alt="معاينة"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}

                  {/* Titles */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">عنوان الحالة (عربي) *</label>
                      <input dir="rtl" value={galForm.title_ar} onChange={e => setGalForm(p => ({ ...p, title_ar: e.target.value }))}
                        placeholder="مثال: تبييض الأسنان"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-600">Case Title (English) *</label>
                      <input dir="ltr" value={galForm.title_en} onChange={e => setGalForm(p => ({ ...p, title_en: e.target.value }))}
                        placeholder="e.g. Teeth Whitening"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 text-sm" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => setEditingGal(null)}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-semibold text-sm">
                      إلغاء
                    </button>
                    <button onClick={saveGal} disabled={savingGal}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition text-sm">
                      {savingGal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingGal ? "جاري الحفظ..." : "حفظ الصورة"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery grid */}
            {galleryLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : gallery.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">لا توجد صور في المعرض</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gallery.map(item => (
                  <div key={item.id} className={`bg-white rounded-2xl border border-slate-200 overflow-hidden group transition ${!item.active ? "opacity-50" : ""}`}>
                    <div className="aspect-square overflow-hidden bg-slate-100 relative">
                      {item.image_url.startsWith("gallery-local://") ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                          <span className="sr-only">{item.title_ar}</span>
                        </div>
                      ) : (
                        <img src={item.image_url} alt={item.title_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { (e.target as HTMLImageElement).src = ""; }} />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-slate-800 text-sm truncate">{item.title_ar}</p>
                      <p className="text-slate-400 text-xs truncate mb-3">{item.title_en}</p>
                      <div className="flex gap-2">
                        <button onClick={() => startEditGal(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs font-semibold">
                          <Edit2 className="w-3.5 h-3.5" /> تعديل
                        </button>
                        <button onClick={() => deleteGal(item.id)} disabled={deletingGal === item.id}
                          className="flex items-center justify-center w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                          {deletingGal === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ REVIEWS ══════════════════════════════════════════════════════════ */}
        {tab === "reviews" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                تقييمات العملاء
                <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{reviews.length} تقييم</span>
              </h2>
              <button onClick={fetchReviews}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm">
                <RefreshCw className={`w-4 h-4 ${reviewsLoading ? "animate-spin" : ""}`} /> تحديث
              </button>
            </div>
            {reviewsLoading ? (
              <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">لا توجد تقييمات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white transition">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {r.name.trim().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{new Date(r.created_at).toLocaleDateString("ar-JO")}</span>
                      </div>
                      <div className="flex text-amber-400 mb-2">
                        {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                        {Array.from({ length: 5 - r.rating }).map((_, j) => <Star key={`e${j}`} className="w-3.5 h-3.5 text-slate-200 fill-current" />)}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                    </div>
                    <button onClick={() => deleteReview(r.id)} disabled={deletingReview === r.id}
                      className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition disabled:opacity-50">
                      {deletingReview === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save bar — only for content tabs */}
        {(tab === "contact" || tab === "doctor" || tab === "hero") && (

          <div className="mt-6 flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div>
              {msg && (
                <div className={`flex items-center gap-2 text-sm font-semibold ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {msg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {msg.text}
                </div>
              )}
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
