# دليل رفع الموقع على Vercel

## الخطوات بالترتيب

---

### 1. جهّز قاعدة البيانات (مجانية)

1. اذهب إلى **[neon.tech](https://neon.tech)** وسجّل حساب مجاني
2. أنشئ مشروعاً جديداً
3. من لوحة التحكم افتح **SQL Editor**
4. انسخ محتوى ملف `setup.sql` والصقه ثم اضغط **Run**
5. من القائمة الجانبية اضغط **Connection Details** وانسخ **Connection string** (يبدأ بـ `postgresql://`)

---

### 2. ارفع الملفات على GitHub

1. افتح [github.com](https://github.com) وسجّل دخول
2. اضغط **New repository** وسمّه مثلاً `dental-clinic`
3. اضغط **uploading an existing file**
4. ارفع جميع الملفات والمجلدات من هذا الأرشيف
5. اضغط **Commit changes**

---

### 3. ربط Vercel بـ GitHub

1. اذهب إلى [vercel.com](https://vercel.com) وسجّل دخول
2. اضغط **Add New → Project**
3. اختر مستودع `dental-clinic` من GitHub
4. في إعدادات المشروع تأكد من:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. قبل الضغط على Deploy، اضغط على **Environment Variables** وأضف:
   - `DATABASE_URL` → الرابط الذي نسخته من Neon
   - `ADMIN_PASSWORD` → كلمة مرور تختارها أنت للوحة الإدارة
6. اضغط **Deploy** وانتظر دقيقتين

---

### 4. ربط الدومين

1. في Vercel → مشروعك → **Settings → Domains**
2. اضغط **Add** وادخل دومينك
3. Vercel سيعطيك سجلات DNS أضفها في إعدادات دومينك

---

### 5. بعد النشر

- الموقع: `https://دومينك.com`
- لوحة الإدارة: `https://دومينك.com/admin`
- كلمة المرور: ما أدخلته في `ADMIN_PASSWORD`

---

### ملاحظة

عند أي تعديل في الكود — ارفع الملفات على GitHub وسيقوم Vercel بإعادة النشر تلقائياً.
