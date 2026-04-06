import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
        <AlertCircle className="w-20 h-20 text-rose-500 mx-auto mb-6 opacity-80" />
        <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">الصفحة غير موجودة</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
