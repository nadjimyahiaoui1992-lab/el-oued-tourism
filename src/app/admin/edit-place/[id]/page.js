"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Save, Loader2 } from "lucide-react";

export default function EditPlace({ params }) {
  const router = useRouter();
  const { id } = params; // هنا نجيبو الـ ID نتاع المعلم من الرابط

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // جلب البيانات الحالية للمعلم
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const { data, error } = await supabase
          .from("landmarks") // تأكد بلي هذا هو اسم الجدول نتاعك
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name);
          setCategory(data.category);
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  // دالة حفظ التعديلات في Supabase
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("landmarks")
        .update({ name, category })
        .eq("id", id);

      if (error) throw error;

      alert("تم حفظ التعديلات بنجاح!");
      router.push("/admin/dashboard"); // نرجعو للوحة التحكم بعد الحفظ
    } catch (err) {
      alert("حدث خطأ أثناء التعديل: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 mb-6 transition-colors font-bold text-sm"
        >
          <ArrowRight size={18} /> رجوع للوحة التحكم
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">تعديل بيانات المعلم</h1>
          
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">اسم المعلم</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all" 
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">التصنيف</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all cursor-pointer"
              >
                <option value="المرافق الصحية">المرافق الصحية</option>
                <option value="الأماكن السياحية">الأماكن السياحية</option>
                <option value="الفنادق والإقامات">الفنادق والإقامات</option>
                <option value="المطاعم والمقاهي">المطاعم والمقاهي</option>
                <option value="الأسواق الشعبية">الأسواق الشعبية</option>
                <option value="الوكالات السياحية">الوكالات السياحية</option>
                <option value="المساجد والزوايا">المساجد والزوايا</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-[#0f7654] hover:bg-[#0c6145] text-white px-6 py-3 rounded-xl transition-all w-full font-bold shadow-md disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={18} /> حفظ التغييرات
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}