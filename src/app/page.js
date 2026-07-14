"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  MapPin,
  BarChart3,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Search,
  X,
  Save,
  RefreshCw,
  Eye,
  Power,
  Link as LinkIcon,
  Users,
} from "lucide-react";

const CATEGORIES = [
  "طبيعة",
  "تاريخ وثقافة",
  "مغامرات",
  "أسواق",
  "الفنادق والمنتجعات",
  "المطاعم",
  "المرافق الصحية",
  "فضاء التسلية",
  "سياحة زراعية",
  "سياحة صحراوية",
  "سياحة تاريخية وثقافية",
  "معالم طبيعية",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  category: CATEGORIES[0],
  lat: "",
  lng: "",
};

// استخراج الإحداثيات من رابط خرائط قوقل (يدعم أغلب الصيغ الشائعة)
function extractLatLngFromGoogleMapsUrl(url) {
  if (!url) return null;
  let match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) return { lat: match[1], lng: match[2] };
  match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: match[1], lng: match[2] };
  match = url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: match[1], lng: match[2] };
  return null;
}

export default function AdminDashboard() {
  const [places, setPlaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [newFiles, setNewFiles] = useState([]); // صور جديدة لم تُرفع بعد
  const [existingImages, setExistingImages] = useState([]); // صور موجودة عند التعديل
  const [saving, setSaving] = useState(false);
  const [mapsLink, setMapsLink] = useState("");
  const [mapsLinkNotice, setMapsLinkNotice] = useState(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");

  // إحصائيات
  const [totalVisits, setTotalVisits] = useState(null);
  const [todayVisits, setTodayVisits] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
      } else {
        setUser(user);
        fetchPlaces();
        fetchStats();
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("places")
      .select("*")
      .order("id", { ascending: false });

    if (fetchError) {
      setError(`فشل جلب البيانات: ${fetchError.message}`);
      setPlaces([]);
    } else {
      setPlaces(data || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // إجمالي الزيارات
    const { count: total } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true });
    setTotalVisits(total ?? 0);

    // زيارات اليوم
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: today } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString());
    setTodayVisits(today ?? 0);

    // وضع الصيانة
    const { data: settings } = await supabase
      .from("site_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();
    if (settings) setMaintenanceMode(settings.maintenance_mode);
  };

  const toggleMaintenance = async () => {
    setTogglingMaintenance(true);
    const newValue = !maintenanceMode;
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ maintenance_mode: newValue, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (updateError) {
      setError(`فشل تغيير وضع الصيانة: ${updateError.message}`);
    } else {
      setMaintenanceMode(newValue);
      setNotice(newValue ? "الموقع الآن تحت الصيانة 🔧" : "الموقع نشط للزوار ✅");
    }
    setTogglingMaintenance(false);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setNewFiles([]);
    setExistingImages([]);
    setMapsLink("");
    setMapsLinkNotice(null);
  };

  const startEdit = (place) => {
    setEditingId(place.id);
    setForm({
      name: place.name || "",
      description: place.description || "",
      category: place.category || CATEGORIES[0],
      lat: place.lat ?? "",
      lng: place.lng ?? "",
    });
    setExistingImages(
      place.image_urls && place.image_urls.length > 0
        ? place.image_urls
        : place.image_url
        ? [place.image_url]
        : []
    );
    setNewFiles([]);
    setMapsLink("");
    setMapsLinkNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExtractMapsLink = () => {
    const coords = extractLatLngFromGoogleMapsUrl(mapsLink);
    if (coords) {
      setForm((f) => ({ ...f, lat: coords.lat, lng: coords.lng }));
      setMapsLinkNotice({ ok: true, msg: "تم استخراج الإحداثيات ✅" });
    } else if (mapsLink.includes("goo.gl") || mapsLink.includes("maps.app")) {
      setMapsLinkNotice({
        ok: false,
        msg: "هذا رابط مختصر ولا يحتوي إحداثيات مباشرة. افتحه في المتصفح، ثم انسخ الرابط الكامل من شريط العنوان بعد ما يتوسع، والصقه هنا.",
      });
    } else {
      setMapsLinkNotice({ ok: false, msg: "ما قدرناش نلقاو إحداثيات في هذا الرابط." });
    }
  };

  const removeExistingImage = (url) => {
    setExistingImages((imgs) => imgs.filter((i) => i !== url));
  };

  const removeNewFile = (idx) => {
    setNewFiles((files) => files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const uploadedUrls = [];
      for (const file of newFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("places-images")
          .upload(`public/${fileName}`, file);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("places-images").getPublicUrl(`public/${fileName}`);
        uploadedUrls.push(publicUrl);
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        lat: form.lat === "" ? null : parseFloat(form.lat),
        lng: form.lng === "" ? null : parseFloat(form.lng),
        image_urls: finalImages,
        image_url: finalImages[0] || null, // صورة الغلاف للتوافق مع بطاقات الموقع
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("places")
          .update(payload)
          .eq("id", editingId);
        if (updateError) throw updateError;
        setNotice("تم تعديل المعلم بنجاح ✅");
      } else {
        const { error: insertError } = await supabase.from("places").insert([payload]);
        if (insertError) throw insertError;
        setNotice("تم إضافة المعلم بنجاح ✅");
      }

      resetForm();
      fetchPlaces();
    } catch (err) {
      setError(`فشل الحفظ: ${err.message || "خطأ غير معروف"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المعلم نهائياً؟")) return;
    setError(null);
    const { error: deleteError } = await supabase.from("places").delete().eq("id", id);
    if (deleteError) {
      setError(`فشل الحذف: ${deleteError.message}`);
    } else {
      setNotice("تم الحذف ✅");
      fetchPlaces();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === "الكل" || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, filterCategory]);

  const supabaseUrlInUse = process.env.NEXT_PUBLIC_SUPABASE_URL || "غير معرف!";

  if (!user) {
    return <div className="text-center py-20 font-sans">جاري التحقق من الصلاحيات...</div>;
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans max-w-6xl mx-auto">
      {/* الرأس */}
      <header className="bg-gradient-to-l from-emerald-700 to-emerald-600 text-white rounded-2xl p-5 shadow-md flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-black">لوحة التحكم - اكتشف سوف</h1>
          <p className="text-xs text-emerald-100 mt-0.5">مرحباً بك: {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <LogOut size={16} /> خروج
        </button>
      </header>

      {/* شريط تحكم الصيانة - بارز */}
      <div
        className={`rounded-2xl p-4 mb-4 flex items-center justify-between border-2 transition-colors ${
          maintenanceMode
            ? "bg-red-50 border-red-300"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              maintenanceMode ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            <Power size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">وضع الصيانة</h3>
            <p className={`text-xs font-bold ${maintenanceMode ? "text-red-600" : "text-emerald-600"}`}>
              {maintenanceMode ? "🔴 الموقع مغلق حالياً على الزوار" : "🟢 الموقع نشط ومتاح للزوار"}
            </p>
          </div>
        </div>
        <button
          onClick={toggleMaintenance}
          disabled={togglingMaintenance}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            maintenanceMode
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {togglingMaintenance ? "..." : maintenanceMode ? "إعادة تفعيل الموقع" : "تفعيل وضع الصيانة"}
        </button>
      </div>

      {/* شريط التشخيص */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-3 mb-6 text-[10px] font-mono flex items-center justify-between gap-2 overflow-x-auto">
        <span className="whitespace-nowrap">🔗 متصل بـ: {supabaseUrlInUse}</span>
        <button
          onClick={() => {
            fetchPlaces();
            fetchStats();
          }}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 shrink-0"
        >
          <RefreshCw size={12} /> تحديث
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 font-medium flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl mb-4 font-medium flex items-center gap-2">
          <CheckCircle size={16} /> {notice}
        </div>
      )}

      {/* شريط الإحصائيات */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">إجمالي المعالم</span>
            <span className="text-xl font-black text-gray-800">{places.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">إجمالي الزيارات</span>
            <span className="text-xl font-black text-gray-800">
              {totalVisits === null ? "..." : totalVisits}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">زوار اليوم</span>
            <span className="text-xl font-black text-gray-800">
              {todayVisits === null ? "..." : todayVisits}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
            <BarChart3 size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">التصنيفات</span>
            <span className="text-xl font-black text-gray-800">
              {new Set(places.map((p) => p.category)).size}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* نموذج إضافة / تعديل */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm md:col-span-1 h-max sticky top-4">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
              {editingId ? <Pencil size={16} className="text-emerald-600" /> : <Plus size={16} className="text-emerald-600" />}
              {editingId ? "تعديل معلم" : "إضافة معلم جديد"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">اسم المعلم *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                placeholder="مثال: غوط نخل سوفي"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">تصنيف المعلم</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-xl p-2.5 text-xs outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 block mb-0.5">نبذة ووصف المعلم *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                placeholder="اكتب تفاصيل المعلم للسائح..."
              />
            </div>

            {/* الصور المتعددة */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-dashed space-y-2">
              <label className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <ImageIcon size={12} /> صور المعلم (تقدر تختار أكثر من صورة)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewFiles((prev) => [...prev, ...Array.from(e.target.files)])}
                className="text-[10px] text-gray-500 block w-full"
              />

              {(existingImages.length > 0 || newFiles.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {existingImages.map((url) => (
                    <div key={url} className="relative w-14 h-14 rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {newFiles.map((file, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden group border-2 border-emerald-300">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* رابط خرائط قوقل */}
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/50 space-y-2">
              <label className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                <LinkIcon size={12} /> الصق رابط من Google Maps (اختياري)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={mapsLink}
                  onChange={(e) => setMapsLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="flex-1 border bg-white rounded-lg p-2 text-[11px] outline-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleExtractMapsLink}
                  className="bg-blue-600 text-white text-[10px] font-bold px-3 rounded-lg shrink-0"
                >
                  استخراج
                </button>
              </div>
              {mapsLinkNotice && (
                <p className={`text-[10px] ${mapsLinkNotice.ok ? "text-emerald-600" : "text-amber-700"}`}>
                  {mapsLinkNotice.msg}
                </p>
              )}
            </div>

            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 space-y-2">
              <label className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <MapPin size={12} /> الإحداثيات
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="خط العرض"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="w-full border bg-white rounded-lg p-2 text-[11px] outline-none"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="خط الطول"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="w-full border bg-white rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save size={14} />
              {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "حفظ ونشر المعلم"}
            </button>
          </form>
        </div>

        {/* قائمة الأماكن */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm md:col-span-2">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم..."
                className="w-full border rounded-xl py-2 pr-9 pl-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-xl py-2 px-3 text-xs outline-none bg-white"
            >
              <option value="الكل">كل التصنيفات</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">
            المعالم المعروضة ({filteredPlaces.length} من {places.length})
          </h2>

          {loading ? (
            <p className="text-xs text-gray-400 py-4">جاري جلب المعالم...</p>
          ) : filteredPlaces.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">لا توجد معالم مطابقة.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1">
              {filteredPlaces.map((place) => {
                const imgCount = place.image_urls?.length || (place.image_url ? 1 : 0);
                return (
                  <div
                    key={place.id}
                    className="border border-gray-100 rounded-xl p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      {place.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img src={place.image_url} alt="" className="w-full h-full object-cover" />
                          {imgCount > 1 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center font-bold">
                              +{imgCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                          <ImageIcon size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-gray-800 truncate">{place.name}</h3>
                        <span className="text-[9px] bg-slate-100 text-gray-500 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                          {place.category}
                        </span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">
                          #{place.id} · {place.lat ?? "—"}, {place.lng ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(place)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(place.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
