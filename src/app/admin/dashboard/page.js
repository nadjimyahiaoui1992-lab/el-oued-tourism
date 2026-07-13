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
  latitude: "",
  longitude: "",
};

export default function AdminDashboard() {
  const [places, setPlaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // رسالة خطأ حقيقية تُعرض للمستخدم
  const [notice, setNotice] = useState(null); // رسالة نجاح مؤقتة
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // إذا موجود، معناها نعدل مو نضيف
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");

  // ---- التحقق من تسجيل الدخول ----
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
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ---- جلب الأماكن (بدون فرز على عمود قد لا يكون موجوداً) ----
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

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
  };

  const startEdit = (place) => {
    setEditingId(place.id);
    setForm({
      name: place.name || "",
      description: place.description || "",
      category: place.category || CATEGORIES[0],
      latitude: place.latitude ?? "",
      longitude: place.longitude ?? "",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- حفظ (إضافة أو تعديل) ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      let imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("places-images")
          .upload(`public/${fileName}`, imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("places-images").getPublicUrl(`public/${fileName}`);
        imageUrl = publicUrl;
      }

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        latitude: form.latitude === "" ? null : parseFloat(form.latitude),
        longitude: form.longitude === "" ? null : parseFloat(form.longitude),
      };
      if (imageUrl) payload.image_url = imageUrl;

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

  // ---- حذف ----
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

  // ---- فلترة وبحث محلي ----
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
      <header className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/60 flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">لوحة التحكم - اكتشف سوف</h1>
          <p className="text-xs text-gray-500 mt-0.5">مرحباً بك: {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <LogOut size={16} /> خروج
        </button>
      </header>

      {/* شريط التشخيص - يبين رابط قاعدة البيانات المتصلة فعلياً */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-3 mb-6 text-[10px] font-mono flex items-center justify-between gap-2 overflow-x-auto">
        <span className="whitespace-nowrap">🔗 متصل بـ: {supabaseUrlInUse}</span>
        <button
          onClick={fetchPlaces}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 shrink-0"
        >
          <RefreshCw size={12} /> تحديث
        </button>
      </div>

      {/* رسائل الخطأ / النجاح */}
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
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">حالة الاتصال</span>
            <span className="text-xs font-bold text-emerald-600">
              {error ? "يوجد خطأ" : "نشط ومتصل"}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
            <BarChart3 size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">التصنيفات المستخدمة</span>
            <span className="text-xs font-bold text-purple-600">
              {new Set(places.map((p) => p.category)).size} تصنيف
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

            <div className="bg-slate-50 p-2.5 rounded-xl border border-dashed">
              <label className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
                <ImageIcon size={12} /> صورة المعلم
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="text-[10px] text-gray-500 block w-full"
              />
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
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  className="w-full border bg-white rounded-lg p-2 text-[11px] outline-none"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="خط الطول"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
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
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  className="border border-gray-100 rounded-xl p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    {place.image_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <img src={place.image_url} alt="" className="w-full h-full object-cover" />
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
                        #{place.id} · {place.latitude ?? "—"}, {place.longitude ?? "—"}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}