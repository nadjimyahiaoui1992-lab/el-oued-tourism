"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { uploadPlaceImages, encodeImageUrls } from "@/lib/placeImages";
import { extractCoordsFromLink } from "@/lib/extractCoords";
import { MapPin, Image as ImageIcon, Info, UploadCloud, Map, PlusCircle, Loader2 } from "lucide-react";

export default function AddPlace() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [files, setFiles] = useState([]);
  const [mapLink, setMapLink] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      setCheckingAuth(false);
    };
    checkUser();
  }, [router]);

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleMapLinkChange = (val) => {
    setMapLink(val);
    const coords = extractCoordsFromLink(val);
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.target);

    try {
      const uploadedUrls = files.length > 0 ? await uploadPlaceImages(files) : [];

      const newPlace = {
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        contact_info: formData.get("contact_info") || null,
        rating: formData.get("rating") ? parseFloat(formData.get("rating")) : null,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        map_link: formData.get("map_link")?.trim() || null,
        image_url: encodeImageUrls(uploadedUrls),
      };

      const { error } = await supabase.from("places").insert([newPlace]);
      if (error) throw error;

      setMessage({ type: "success", text: "✅ تم إضافة المعلم السياحي والصور بنجاح!" });
      e.target.reset();
      setFiles([]);
      setMapLink("");
      setLat("");
      setLng("");
      setTimeout(() => router.push("/admin/dashboard"), 1200);
    } catch (err) {
      setMessage({ type: "error", text: `❌ حدث خطأ في الحفظ: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <PlusCircle size={32} /> إضافة معلم سياحي جديد
          </h1>
          <p className="text-teal-100">لوحة التحكم الاحترافية - دليلك السياحي لولاية الوادي</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          <div className="space-y-6 border-b pb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Info className="text-teal-500" /> المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المعلم *</label>
                <input
                  type="text" name="name" required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                  placeholder="مثال: مركب الغزالة الذهبية"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">التصنيف *</label>
                <select name="category" required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50">
                  <option value="">اختر التصنيف...</option>
                  <option value="طبيعة">طبيعة (غيطان، كثبان...)</option>
                  <option value="المنتجعات و الفنادق">فنادق ومنتجعات</option>
                  <option value="المرافق الصحية">المرافق الصحية (مصحات، مستشفيات)</option>
                  <option value="تاريخ وثقافة">تاريخ وثقافة (زوايا، متاحف...)</option>
                  <option value="أسواق">أسواق تجارية</option>
                  <option value="المطاعم والمقاهي">المطاعم والمقاهي</option>
                  <option value="الوكالات السياحية">الوكالات السياحية</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف المعلم</label>
              <textarea name="description" rows="3" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" placeholder="اكتب نبذة مختصرة عن المكان..." />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">التقييم (من 5)</label>
                <input type="number" step="0.1" max="5" min="0" name="rating" placeholder="4.5" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">معلومات الاتصال (إن وجدت)</label>
                <input type="text" name="contact_info" placeholder="هاتف، فيسبوك، أو بريد إلكتروني" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
              </div>
            </div>
          </div>

          <div className="space-y-6 border-b pb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-teal-500" /> الموقع الجغرافي *
            </h2>
            <p className="text-sm text-gray-500">
              الصق رابط خرائط جوجل وسيتم استخراج الإحداثيات تلقائياً، أو أدخلها يدوياً. الإحداثيات إجبارية حتى يظهر المعلم على الخريطة التفاعلية.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الخريطة أو Plus Code</label>
                <div className="relative">
                  <Map className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text" name="map_link" value={mapLink} onChange={(e) => handleMapLinkChange(e.target.value)}
                    placeholder="مثال: https://maps.google.com/@33.368,6.856,15z" dir="ltr"
                    className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">خط العرض (Lat) *</label>
                  <input type="number" step="any" required value={lat} onChange={(e) => setLat(e.target.value)} placeholder="33.3680" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">خط الطول (Lng) *</label>
                  <input type="number" step="any" required value={lng} onChange={(e) => setLng(e.target.value)} placeholder="6.8560" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="text-teal-500" /> معرض الصور
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <UploadCloud className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">اضغط هنا لرفع الصور أو قم بسحبها وإفلاتها</p>
              <p className="text-sm text-gray-400 mt-2">يمكنك اختيار صورة واحدة أو عدة صور معاً (PNG, JPG)</p>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            {files.length > 0 && (
              <p className="text-teal-600 font-bold text-sm">تم اختيار {files.length} صور جاهزة للرفع.</p>
            )}
          </div>

          <div className="pt-6">
            <button
              type="submit" disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-lg hover:scale-[1.01]"
              }`}
            >
              {loading ? <span className="animate-pulse">جاري معالجة ورفع البيانات...</span> : <>حفظ ونشر المعلم السياحي</>}
            </button>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl mt-4 text-center font-bold border ${
              message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
