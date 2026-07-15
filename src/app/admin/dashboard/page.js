"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { decodeImageUrls } from "@/lib/placeImages";
import {
  Plus,
  Trash2,
  Pencil,
  MapPin,
  BarChart3,
  LogOut,
  CheckCircle,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const [places, setPlaces] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("assistants")
        .select("role")
        .eq("user_id", user.id)
        .single();
      setRole(profile?.role || null);

      fetchPlaces();
    };
    checkUser();
  }, [router]);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPlaces(data);
    setLoading(false);
  };

  const handleDeletePlace = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المعلم نهائياً؟")) return;
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (!error) fetchPlaces();
    else alert("تعذّر الحذف: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (!user) {
    return <div className="text-center py-20 font-sans">جاري التحقق من الصلاحيات...</div>;
  }

  const missingCoords = places.filter((p) => p.lat == null || p.lng == null).length;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans max-w-5xl mx-auto">
      <header className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/60 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">لوحة التحكم التفاعلية</h1>
          <p className="text-xs text-gray-500 mt-0.5">مرحباً بك: {user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <Link
              href="/admin/users"
              className="text-slate-600 hover:bg-slate-100 p-2.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Users size={16} /> المساعدون
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <LogOut size={16} /> خروج
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><MapPin size={20} /></div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">إجمالي المعالم</span>
            <span className="text-xl font-black text-gray-800">{places.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3">
          <div className={`p-3 rounded-xl ${missingCoords > 0 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">بدون إحداثيات</span>
            <span className={`text-xl font-black ${missingCoords > 0 ? "text-amber-600" : "text-gray-800"}`}>
              {missingCoords}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl"><BarChart3 size={20} /></div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">رتبة الحساب</span>
            <span className="text-xs font-bold text-purple-600">
              {role === "admin" ? "مسؤول نظام كامل" : role === "assistant" ? "مشرف نشر محتوى" : "—"}
            </span>
          </div>
        </div>
      </section>

      {missingCoords > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold p-4 rounded-2xl mb-6">
          ⚠️ يوجد {missingCoords} معلم بدون إحداثيات (lat/lng) — لن يظهر على الخريطة التفاعلية. افتح "تعديل" لكل معلم وأضف الإحداثيات.
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-sm font-bold text-gray-900">المعالم المنشورة ({places.length})</h2>
          <Link
            href="/admin/add-place"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> إضافة معلم جديد
          </Link>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 py-4">جاري جلب المعالم...</p>
        ) : places.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">لا توجد معالم حالياً في قاعدة البيانات.</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1">
            {places.map((place) => {
              const [firstImage] = decodeImageUrls(place.image_url);
              const hasCoords = place.lat != null && place.lng != null;
              return (
                <div
                  key={place.id}
                  className="border border-gray-100 rounded-xl p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {firstImage && <img src={firstImage} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-gray-800 truncate">{place.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[9px] bg-slate-100 text-gray-500 px-2 py-0.5 rounded-full font-bold inline-block">
                          {place.category}
                        </span>
                        {!hasCoords && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold inline-block">
                            بدون إحداثيات
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/edit-place/${place.id}`}
                      className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDeletePlace(place.id)}
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
    </main>
  );
}