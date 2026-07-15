"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Info, MapPin, Image as ImageIcon, UploadCloud } from "lucide-react";

export default function EditPlace({ params }) {
  const router = useRouter();
  const { id } = params;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  
  const [mapLink, setMapLink] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  
  const [imageUrl, setImageUrl] = useState(""); 

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const { data, error } = await supabase
          .from("places") 
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || "");
          setCategory(data.category || "");
          setDescription(data.description || "");
          setRating(data.rating || "");
          setMapLink(data.map_link || ""); 
          setLat(data.lat || "");           
          setLng(data.lng || "");           
          setImageUrl(data.image_url || ""); // تم التعديل إلى image_url ليتوافق مع قاعدة بياناتك
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("places") 
        .update({ 
          name, 
          category, 
          description, 
          rating: rating ? parseFloat(rating) : null,
          map_link: mapLink,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          image_url: imageUrl // تم التعديل إلى image_url ليتوافق مع قاعدة بياناتك
        })
        .eq("id", id);

      if (error) throw error;

      alert("تم حفظ وتحديث المعلم السياحي بنجاح!");
      router.push("/admin/dashboard");
    } catch (err) {
      alert("حدث خطأ أثناء التعديل: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#0aa679]" />
      </div>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f7f6] py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        
        <div className="bg-[#00a877] text-white p-8 text-center relative">
          <button 
            onClick={() => router.push("/admin/dashboard")}
            className="absolute right-6 top-6 text-emerald-100 hover:text-white text-sm font-medium transition-colors"
          >
            &rarr; رجوع للوحة التحكم
          </button>
          <div className="flex justify-center items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">تعديل بيانات المعلم السياحي</h1>
          </div>
          <p className="text-emerald-100 text-sm">لوحة التحكم الاحترافية - دليلك السياحي لولاية الوادي</p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-10">
          
          <section>
            <div className="flex items-center gap-2 text-[#00a877] mb-6 border-b pb-3">
              <Info size={20} />
              <h2 className="text-lg font-bold text-slate-800">المعلومات الأساسية</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">اسم المعلم *</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">التصنيف *</label>
                <select 
                  required value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>اختر التصنيف...</option>
                  <option value="طبيعة">طبيعة (غيطان، كثبان...)</option>
                  <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                  <option value="المرافق الصحية">المرافق الصحية (مصحات، مستشفيات)</option>
                  <option value="تاريخ وثقافة">تاريخ وثقافة (زوايا، متاحف...)</option>
                  <option value="أسواق">أسواق تجارية</option>
                  <option value="الأماكن السياحية">الأماكن السياحية</option>
                  <option value="المطاعم والمقاهي">المطاعم والمقاهي</option>
                  <option value="الوكالات السياحية">الوكالات السياحية</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-600 block mb-2">وصف المعلم</label>
              <textarea 
                rows="4" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm resize-none"
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="text-xs font-bold text-slate-600 block mb-2">التقييم (من 5)</label>
              <input 
                type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm" 
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-[#00a877] mb-2 border-b pb-3">
              <MapPin size={20} />
              <h2 className="text-lg font-bold text-slate-800">الموقع الجغرافي (اختياري)</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">يمكنك إدخال الإحداثيات الدقيقة، أو ببساطة وضع رابط خريطة جوجل أو الرمز القصير (Plus Code).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">رابط الخريطة أو Plus Code</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" dir="ltr" value={mapLink} onChange={(e) => setMapLink(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-[#00a877] transition-all text-sm text-left" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">خط العرض (Lat)</label>
                  <input 
                    type="number" step="any" dir="ltr" value={lat} onChange={(e) => setLat(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm text-center" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">خط الطول (Lng)</label>
                  <input 
                    type="number" step="any" dir="ltr" value={lng} onChange={(e) => setLng(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm text-center" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-[#00a877] mb-6 border-b pb-3">
              <ImageIcon size={20} />
              <h2 className="text-lg font-bold text-slate-800">معرض الصور</h2>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <input type="file" className="hidden" id="imageUpload" accept="image/*" />
              <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center justify-center">
                <UploadCloud size={40} className="text-slate-400 mb-3 group-hover:text-[#00a877] transition-colors" />
                <span className="text-sm font-bold text-slate-600 mb-1">اضغط هنا لرفع الصور أو قم بسحبها وإفلاتها</span>
                <span className="text-xs text-slate-400">يمكنك اختيار صورة واحدة أو عدة صور معاً (PNG, JPG)</span>
              </label>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-[#00a877] hover:bg-[#009166] text-white font-bold py-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-8"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" /> جاري الحفظ والتحديث...
              </>
            ) : (
              "حفظ ونشر المعلم السياحي"
            )}
          </button>
          
        </form>
      </div>
    </main>
  );
}
