"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { uploadPlaceImages, encodeImageUrls, decodeImageUrls } from "@/lib/placeImages";
import { extractCoordsFromLink } from "@/lib/extractCoords";
import { Loader2, Info, MapPin, Image as ImageIcon, UploadCloud, X } from "lucide-react";

export default function EditPlace({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      setCheckingAuth(false);

      try {
        const { data, error } = await supabase.from("places").select("*").eq("id", id).single();
        if (error) throw error;
        if (data) {
          setName(data.name || "");
          setCategory(data.category || "");
          setDescription(data.description || "");
          setRating(data.rating ?? "");
          setContactInfo(data.contact_info || "");
          setMapLink(data.map_link || "");
          setLat(data.lat ?? "");
          setLng(data.lng ?? "");
          setExistingImages(decodeImageUrls(data.image_url));
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setError("تعذّر تحميل بيانات المعلم.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, router]);

  const handleMapLinkChange = (val) => {
    setMapLink(val);
    const coords = extractCoordsFromLink(val);
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
    }
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const uploadedUrls = newFiles.length > 0 ? await uploadPlaceImages(newFiles) : [];
      const allImages = [...existingImages, ...uploadedUrls];

      const { error } = await supabase
        .from("places")
        .update({
          name,
          category,
          description,
          rating: rating ? parseFloat(rating) : null,
          contact_info: contactInfo || null,
          map_link: mapLink || null,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          image_url: encodeImageUrls(allImages),
        })
        .eq("id", id);

      if (error) throw error;
      router.push("/admin/dashboard");
    } catch (err) {
      setError("حدث خطأ أثناء التعديل: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (checkingAuth || loading) {
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
          <h1 className="text-2xl font-bold">تعديل بيانات المعلم السياحي</h1>
          <p className="text-emerald-100 text-sm">لوحة التحكم الاحترافية - دليلك السياحي لولاية الوادي</p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-10">
          <section>
            <div className="flex items-center gap-2 text-[#00a877] mb-6 border-b pb-3">
              <Info size={20} /><h2 className="text-lg font-bold text-slate-800">المعلومات الأساسية</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">اسم المعلم *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">التصنيف *</label>
                <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm bg-white cursor-pointer">
                  <option value="" disabled>اختر التصنيف...</option>
                  <option value="طبيعة">طبيعة (غيطان، كثبان...)</option>
                  <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                  <option value="المرافق الصحية">المرافق الصحية (مصحات، مستشفيات)</option>
                  <option value="تاريخ وثقافة">تاريخ وثقافة (زوايا، متاحف...)</option>
                  <option value="أسواق">أسواق تجارية</option>
                  <option value="المطاعم والمقاهي">المطاعم والمقاهي</option>
                  <option value="الوكالات السياحية">الوكالات السياحية</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-600 block mb-2">وصف المعلم</label>
              <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">التقييم (من 5)</label>
                <input type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">معلومات الاتصال</label>
                <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm" />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-[#00a877] mb-2 border-b pb-3">
              <MapPin size={20} /><h2 className="text-lg font-bold text-slate-800">الموقع الجغرافي</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">الصق رابط خرائط جوجل لاستخراج الإحداثيات تلقائياً، أو عدّلها يدوياً.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">رابط الخريطة أو Plus Code</label>
                <input type="text" dir="ltr" value={mapLink} onChange={(e) => handleMapLinkChange(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm text-left" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">خط العرض (Lat)</label>
                  <input type="number" step="any" dir="ltr" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm text-center" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">خط الطول (Lng)</label>
                  <input type="number" step="any" dir="ltr" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full border border-slate-200 rounded-lg py-3 px-4 outline-none focus:border-[#00a877] transition-all text-sm text-center" />
                </div>
              </div>
            </div>
            {(!lat || !lng) && (
              <p className="text-amber-600 text-xs font-bold mt-3">⚠️ بدون إحداثيات لن يظهر هذا المعلم على الخريطة التفاعلية.</p>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 text-[#00a877] mb-6 border-b pb-3">
              <ImageIcon size={20} /><h2 className="text-lg font-bold text-slate-800">معرض الصور</h2>
            </div>

            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {existingImages.map((url) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="حذف الصورة"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer group relative">
              <input
                type="file" multiple accept="image/*"
                onChange={(e) => setNewFiles(Array.from(e.target.files))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={40} className="text-slate-400 mb-3 group-hover:text-[#00a877] transition-colors mx-auto" />
              <span className="text-sm font-bold text-slate-600 mb-1 block">اضغط هنا لإضافة صور جديدة أو قم بسحبها وإفلاتها</span>
              <span className="text-xs text-slate-400">يمكنك اختيار صورة واحدة أو عدة صور معاً (PNG, JPG)</span>
            </div>
            {newFiles.length > 0 && (
              <p className="text-emerald-600 font-bold text-xs mt-2">تم اختيار {newFiles.length} صور جديدة جاهزة للرفع عند الحفظ.</p>
            )}
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={isSaving}
            className="w-full bg-[#00a877] hover:bg-[#009166] text-white font-bold py-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-8"
          >
            {isSaving ? (<><Loader2 size={20} className="animate-spin" /> جاري الحفظ والتحديث...</>) : "حفظ ونشر المعلم السياحي"}
          </button>
        </form>
      </div>
    </main>
  );
}