"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // التحقق من أن المستخدم قام بتسجيل الدخول فعلياً
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // إذا لم يكن مسجل الدخول، نعيده لصفحة تسجيل الدخول فوراً
        router.push("/admin");
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f2b28] flex items-center justify-center text-white gap-2 font-sans">
        <Loader2 className="animate-spin" /> جاري تحميل لوحة التحكم...
      </div>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* الهيدر أو شريط التحكم العلوي */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مرحباً بك في لوحة تحكم عين الوادي</h1>
          <p className="text-xs text-slate-500 mt-1">المستخدم الحالي: {user?.email}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>

      {/* محتوى لوحة التحكم الخاص بك (البيانات، الجداول، الإحصائيات) يوضع هنا */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-400">إجمالي الأماكن السياحية</h3>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-400">عدد الزيارات هذا الشهر</h3>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">+1,420</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-400">الآراء والتعليقات</h3>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">48</p>
        </div>
      </div>
    </main>
  );
}
