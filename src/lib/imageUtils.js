// src/lib/imageUtils.js

// يفك ويصلح رابط الصورة القادم من Supabase مهما كان تنسيقه
// (رابط عادي، مصفوفة، نص JSON، روابط مفصولة بفاصلة، أو رابط مرمّز مرتين)
export function decodeImageUrls(raw) {
  if (!raw) return null;

  let value = raw;

  // إذا كانت القيمة مصفوفة مباشرة (Supabase أحياناً يرجعها هكذا)
  if (Array.isArray(value)) {
    value = value.find((v) => v && String(v).trim()) || null;
  }

  if (!value) return null;
  value = String(value).trim();
  if (!value) return null;

  // إذا كانت القيمة نص JSON لمصفوفة، مثال: ["url1","url2"]
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        value = parsed.find((v) => v && String(v).trim()) || "";
      }
    } catch {
      // ليست JSON صالحة، نكمل بالقيمة الأصلية
    }
  }

  // إذا كانت عدة روابط مفصولة بفاصلة، ناخذ أول واحد صالح
  if (value.includes(",")) {
    value = value.split(",")[0];
  }

  // نزيل علامات اقتباس زائدة ومسافات
  value = value.trim().replace(/^["']|["']$/g, "");

  if (!value) return null;

  // فك ترميز مزدوج إذا كان موجود (مثال: %2520 بدل %20)
  try {
    if (value.includes("%25")) {
      value = decodeURIComponent(value);
    }
  } catch {
    // إذا فشل الفك، نستعمل القيمة كيفما هي
  }

  return value || null;
}
