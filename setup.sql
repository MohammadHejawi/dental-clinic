-- شغّل هذا الكود مرة واحدة فقط في قاعدة البيانات
-- Run this ONCE in your database to create the table and seed initial data

CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_content (key, value) VALUES
  ('phone',         '+962796317293'),
  ('address_ar',    'شارع الهاشمي 141، إربد 21110، الأردن'),
  ('address_en',    'Al-Hashmi St. 141, Irbid 21110, Jordan'),
  ('hours_ar',      'السبت – الخميس: 9ص – 9م'),
  ('hours_en',      'Sat – Thu: 9AM – 9PM'),
  ('instagram',     'https://instagram.com/dr.tareq_alhijawi'),
  ('doctor_bio_ar', 'طبيب أسنان متخصص في زراعة الأسنان وتجميلها، يمتلك خبرة واسعة في تقديم أفضل الحلول لصحة الفم والأسنان بأحدث التقنيات.'),
  ('doctor_bio_en', 'Specialist in dental implants and cosmetic dentistry with extensive experience delivering the best oral health solutions using the latest techniques.'),
  ('hero_tag_ar',   'عيادة متخصصة في إربد'),
  ('hero_tag_en',   'Specialized Dental Clinic in Irbid'),
  ('hero_sub_ar',   'نقدم لك ابتسامة تليق بك – بأحدث تقنيات طب الأسنان وزراعته'),
  ('hero_sub_en',   'We give you the smile you deserve – with the latest in dental care and implants')
ON CONFLICT (key) DO NOTHING;
