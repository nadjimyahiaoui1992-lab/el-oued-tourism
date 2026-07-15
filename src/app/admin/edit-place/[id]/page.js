"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Save, Loader2, MapPin, Link as LinkIcon, Image as ImageIcon, FileText } from "lucide-react";

export default function EditPlace({ params }) {
  const router = useRouter();
  const { id } = params;

  // كل الخانات اللي يحتاجها المعلم السياحي
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // جلب بيانات المعلم لملء الخانات
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const { data, error } = await supabase
          .from("landmarks")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || "");
          setCategory(data.category || "الأماكن السياحية");
          setDescription(data.description || "");
          setImageUrl(data.image || ""); // تأكد من اسم عمود الصورة في قاعدتك (image أو imageUrl)
          setAddress(data.address || "");
          setMapsLink(data.maps_link || "");
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  // حفظ التغييرات في قاعدة البيانات
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("landmarks")
        .update({ 
          name, 
          category, 
          description, 
          image: imageUrl, // تأكد من اسم العمود
          address, 
          maps_link: mapsLink 
        })
        .eq("id", id);

      if (error) throw error;

      alert("تم حفظ التعديلات بنجاح!");
      router.push("/admin/dashboard");
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
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] p-6 font-sans pb-12">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 mb-6 transition-colors font-bold text-sm"
        >
          <ArrowRight size={18} /> رجوع للوحة التحكم
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">تعديل بيانات المعلم السياحي</h1>
          
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* اسم المعلم */}
              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">اسم المعلم</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all" 
                  placeholder="مثال: مصحة ابن سينا"
                />
              </div>

              {/* التصنيف */}
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
            </div>

            {/* الوصف */}
            <div>
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2">
                <FileText size={16} className="text-slate-400"/> وصف المعلم
              </label>
              <textarea 
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all resize-none"
                placeholder="اكتب نبذة أو وصف عن هذا المعلم..."
              />
            </div>

            {/* رابط الصورة */}
            <div>
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2">
                <ImageIcon size={16} className="text-slate-400"/> رابط الصورة (URL)
              </label>
              <input 
                type="url" 
                dir="ltr"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all text-left" 
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* العنوان */}
              <div>
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-slate-400"/> العنوان
                </label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all" 
                  placeholder="مثال: وسط المدينة، الوادي"
                />
              </div>

              {/* رابط خرائط جوجل */}
              <div>
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2 mb-2">
                  <LinkIcon size={16} className="text-slate-400"/> رابط خرائط جوجل (Google Maps)
                </label>
                <input 
                  type="url" 
                  dir="ltr"
                  value={mapsLink}
                  onChange={(e) => setMapsLink(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm transition-all text-left" 
                  placeholder="https://goo.gl/maps/..."
                />
              </div>
            </div>
            
            <hr className="border-slate-100 my-6" />

            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-[#0f7654] hover:bg-[#0c6145] text-white px-6 py-4 rounded-xl transition-all w-full font-bold shadow-md disabled:opacity-70 text-lg mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> جاري حفظ التغييرات...
                </>
              ) : (
                <>
                  <Save size={20} /> حفظ التغييرات
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
