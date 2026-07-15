import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// التحقق من وجود المتغيرات لتجنب الأخطاء الصامتة أثناء التطوير
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "تنبيه: مفاتيح الاتصال بـ Supabase غير موجودة. يرجى التأكد من إضافتها في إعدادات البيئة (Environment Variables)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
