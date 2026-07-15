"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  LogOut, 
  Users, 
  Power, 
  LayoutGrid, 
  Eye, 
  UserSquare2, 
  Plus, 
  Filter, 
  Search,
  CheckCircle2
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // التحقق من الجلسة (الحماية)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] font-sans pb-10">
      {/* 1. الشريط العلوي (Header) */}
      <header className="bg-[#0f7654] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid size={28} className="text-emerald-300" />
            <div>
              <h1 className="text-xl font-bold tracking-wide">لوحة التحكم - اكتشف سوف</h1>
              <p className="text-xs text-emerald-100 mt-1">
                مرحباً بك: <span className="font-semibold">{user?.email || "nadjimyahiaoui1992@gmail.com"}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-emerald-800/50 hover:bg-emerald-800 transition-colors px-4 py-2 rounded-lg border border-emerald-600 text-sm font-medium">
              <Users size={18} />
              إدارة المساعدين
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
            >
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* 2. شريط وضع الصيانة */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <CheckCircle2 size={18} className="text-emerald-500" />
            الموقع نشط ومتاح للزوار
          </div>
          <button className="flex items-center gap-2 bg-[#0f7654] hover:bg-[#0c6145] text-white px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm font-bold">
            <Power size={18} />
            تفعيل وضع الصيانة
          </button>
        </div>

        {/* 3. بطاقات الإحصائيات (Stats Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* إجمالي المعالم */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-2">إجمالي المعالم</h3>
              <p className="text-4xl font-extrabold text-slate-800">1</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <LayoutGrid size={28} className="text-emerald-600" />
            </div>
          </div>

          {/* إجمالي الزيارات */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-2">إجمالي الزيارات</h3>
              <p className="text-4xl font-extrabold text-slate-800">1245</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Eye size={28} className="text-blue-600" />
            </div>
          </div>

          {/* زوار اليوم */}
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-2">زوار اليوم</h3>
              <p className="text-4xl font-extrabold text-slate-800">42</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <UserSquare2 size={28} className="text-amber-600" />
            </div>
          </div>
        </div>

        {/* 4. شريط البحث والفلترة والإضافة */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="بحث بالاسم..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm transition-all"
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm transition-all appearance-none cursor-pointer text-slate-700">
              <option>كل التصنيفات</option>
              <option>المرافق الصحية</option>
              <option>الأماكن السياحية</option>
              <option>الفنادق</option>
            </select>
          </div>

          <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0f7654] hover:bg-[#0c6145] text-white px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm font-bold">
            <Plus size={18} />
            إضافة معلم
          </button>
        </div>

        {/* 5. شبكة المعالم (Cards Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {/* بطاقة مثال (Card Example) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="h-48 bg-slate-200 relative overflow-hidden">
              {/* ملاحظة: ضف مسار الصورة الحقيقي هنا في الـ src */}
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=500&auto=format&fit=crop" 
                alt="مصحة ابن سينا"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                المرافق الصحية
              </span>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-slate-800 text-lg mb-1">مصحة ابن سينا</h3>
              <p className="text-xs text-slate-500">تم الإضافة مؤخراً</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
