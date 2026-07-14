"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Image as ImageIcon, MapPin, BarChart3, LogOut, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [places, setPlaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // حقول النموذج الجديد
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("طبيعة");
  const [contactInfo, setContactInfo] = useState("");
  const [mapsLink, setMapsLink] = useState(""); // حقل رابط جوجل ماب
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // التحقق من صلاحية المستخدم المحمي والبيانات
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
      } else {
        setUser(user);
        fetchPlaces();
      }
    };
    checkUser();
  }, [router]);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data } = await supabase.from("places").select("*").order("created_at", { ascending: false });
    if (data) setPlaces(data);
    setLoading(false);
  };

  // دالة ذكية لاستخراج الإحداثيات من رابط خرائط جوجل إذا تم وضعه
  const handleMapsLinkChange = (val) => {
    setMapsLink(val);
    // تصفية الرابط للبحث عن الإحداثيات المكتوبة بصيغة @33.123,6.123
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = val.match(regex);
    if (match && match[1] && match[2]) {
      setLat(match[1]);
      setLng(match[2]);
    }
  };

  // دالة رفع الصورة وإضافة المعلم كاملاً
  const handleAddPlace = async (e) => {
    e.preventDefault();
    setUploading(true);
    let finalImageUrl = "";

    try {
      // 1. رفع الصورة إلى الـ Bucket إذا تم اختيار ملف
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("places-images")
          .upload(`public/${fileName}`, imageFile);

        if (uploadError) throw uploadError;

        // الحصول على رابط الصورة العام
        const { data: { publicUrl } } = supabase.storage
          .from("places-images")
          .getPublicUrl(`public/${fileName}`);
        
        finalImageUrl = publicUrl;
      }

      // 2. إدخال السجل الجديد في قاعدة البيانات
      const { error: insertError } = await supabase.from("places").insert([{
        name,
        description,
        category,
        contact_info: contactInfo,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        image_url: finalImageUrl || null,
        rating: 5.0
      }]);

      if (insertError) throw insertError;

      // إعادة تهيئة النموذج
      setName("");
      setDescription("");
      setContactInfo("");
      setMapsLink("");
      setLat("");
      setLng("");
      setImageFile(null);
      
      // تحديث القائمة
      fetchPlaces();
      alert("تم إضافة المعلم بنجاح!");

    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإضافة، يرجى التحقق من المدخلات.");
    } finally {
      setUploading(false);
    }
  };

  // دالة حذف معلم
  const handleDeletePlace = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا المعلم نهائياً؟")) {
      const { error } = await supabase.from("places").delete().eq("id", id);
      if (!error) fetchPlaces();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (!user) return <div className="text-center py-20 font-sans">جاري التحقق من الصلاحيات...</div>;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans max-w-5xl mx-auto">
      
      {/* الرأس الهيدر */}
      <header className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/60 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">لوحة التحكم التفاعلية</h1>
          <p className="text-xs text-gray-500 mt-0.5">مرحباً بك: {user.email}</p>
        </div>
        <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold">
          <LogOut size={16} /> خروج
        </button>
      </header>

      {/* شريط الإحصائيات المتميزة */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><MapPin size={20} /></div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">إجمالي المعالم</span>
            <span className="text-xl font-black text-gray-800">{places.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><CheckCircle size={20} /></div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">حالة الموقع</span>
            <span className="text-xs font-bold text-emerald-600">نشط ومتصل</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><BarChart3 size={20} /></div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">رتبة الحساب</span>
            <span className="text-xs font-bold text-purple-600">{user.email.includes('admin') ? "مسؤول نظام كامل" : "مشرف نشر محتوى"}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* نموذج إضافة معلم جديد */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm md:col-span-1 h-max">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1 border-b pb-2">
            <Plus size={16} className="text-emerald-600" /> إضافة معلم جديد بولاية الوادي
          </h2>
          <form onSubmit={handleAddPlace} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">اسم المعلم *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500" placeholder="مثال: غوط نخل سوفي" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">تصنيف المعلم</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-xl p-2.5 text-xs outline-none bg-white">
                <option value="طبيعة">طبيعة</option>
                <option value="تاريخ وثقافة">تاريخ وثقافة</option>
                <option value="مغامرات">مغامرات</option>
                <option value="أسواق">أسواق</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">نبذة ووصف المعلم *</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500" placeholder="اكتب تفاصيل المعلم للسائح..."></textarea>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">معلومات الاتصال (إن وجدت)</label>
              <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border rounded-xl p-2.5 text-xs outline-none" placeholder="هاتف، فيسبوك، أو بريد الكتروني" />
            </div>
            
            <div className="bg-slate-50 p-2.5 rounded-xl border border-dashed">
              <label className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1"><ImageIcon size={12} /> رفع صورة المعلم (مباشر)</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-[10px] text-gray-500 block w-full" />
            </div>

            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 space-y-2">
              <label className="text-[11px] font-bold text-amber-800 flex items-center gap-1"><MapPin size={12} /> تحديد الإحداثيات الذكي</label>
              <input type="text" value={mapsLink} onChange={(e) => handleMapsLinkChange(e.target.value)} className="w-full border bg-white rounded-lg p-2 text-[11px] outline-none" placeholder="ضع رابط Google Maps المباشر هنا وسيتم جلبها" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="any" required placeholder="خط العرض Lat" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full border bg-white rounded-lg p-2 text-[11px] outline-none" />
                <input type="number" step="any" required placeholder="خط الطول Lng" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full border bg-white rounded-lg p-2 text-[11px] outline-none" />
              </div>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all">
              {uploading ? "جاري الحفظ والرفع لـ Supabase..." : "حفظ ونشر المعلم"}
            </button>
          </form>
        </div>

        {/* استعراض وحذف المعالم الحالية */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm md:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">المعالم الحالية المنشورة بالموقع ({places.length})</h2>
          
          {loading ? (
            <p className="text-xs text-gray-400 py-4">جاري جلب المعالم...</p>
          ) : places.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">لا توجد معالم حالياً في قاعدة البيانات.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1">
              {places.map((place) => (
                <div key={place.id} className="border border-gray-100 rounded-xl p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex gap-3 items-center">
                    {place.image_url && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={place.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-xs text-gray-800">{place.name}</h3>
                      <span className="text-[9px] bg-slate-100 text-gray-500 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">{place.category}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePlace(place.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}