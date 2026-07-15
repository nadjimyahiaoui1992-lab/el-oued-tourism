"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { 
  LogOut, Users, Power, LayoutGrid, Eye, UserSquare2, 
  Plus, Filter, Search, CheckCircle2, AlertCircle, 
  Database, Edit, Trash2, TrendingUp, BarChart3
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // 1. حالات (States) ربط البيانات الحقيقية
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [dbUrl, setDbUrl] = useState("");
  const [stats, setStats] = useState({ totalLandmarks: 0, totalVisits: 0, todayVisits: 0 });
  const [landmarks, setLandmarks] = useState([]); // قائمة المعالم الحقيقية

  useEffect(() => {
    const initializeDashboard = async () => {
      // التحقق من المستخدم
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      setUser(user);

      // جلب رابط قاعدة البيانات من إعدادات البيئة (env)
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "غير متصل";
      setDbUrl(url);

      // --- هنا مستقبلا تحط كود جلب الإحصائيات والمعالم من Supabase ---
      // أمثلة وهمية مؤقتة حتى تربطها بجداولك:
      setStats({
        totalLandmarks: 12, // جيبها من count نتاع جدول المعالم
        totalVisits: 1245,  // جيبها من جدول الزيارات
        todayVisits: 42
      });

      setLandmarks([
        { id: 1, name: "مصحة ابن سينا", category: "المرافق الصحية", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=500&auto=format&fit=crop" }
      ]);
      // -------------------------------------------------------------

      setLoading(false);
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المعلم؟")) {
      // كود الحذف من Supabase يضاف هنا
      setLandmarks(landmarks.filter(item => item.id !== id));
    }
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
      
      {/* شريط حالة قاعدة البيانات العُلوي */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-emerald-400" />
          <span>متصل بقاعدة البيانات:</span>
          <span className="font-mono text-emerald-400 truncate max-w-[200px] sm:max-w-xs">
            {dbUrl}
          </span>
        </div>
      </div>

      {/* الشريط العلوي (Header) */}
      <header className="bg-[#0f7654] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid size={28} className="text-emerald-300" />
            <div>
              <h1 className="text-xl font-bold tracking-wide">لوحة التحكم - اكتشف سوف</h1>
              <p className="text-xs text-emerald-100 mt-1">
                مرحباً بك: <span className="font-semibold">{user?.email}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/admin/dashboard/assistants')}
              className="flex items-center gap-2 bg-emerald-800/50 hover:bg-emerald-800 transition-colors px-4 py-2 rounded-lg border border-emerald-600 text-sm font-medium"
            >
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* المحتوى الرئيسي (يمين) */}
        <div className="flex-1 space-y-6">
          
          {/* شريط وضع الصيانة */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4">
            <div className={`flex items-center gap-2 font-medium text-sm ${isMaintenance ? 'text-red-500' : 'text-slate-600'}`}>
              {isMaintenance ? <AlertCircle size={18} /> : <CheckCircle2 size={18} className="text-emerald-500" />}
              {isMaintenance ? "الموقع في وضع الصيانة (مغلق للزوار)" : "الموقع نشط ومتاح للزوار"}
            </div>
            <button 
              onClick={() => setIsMaintenance(!isMaintenance)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm font-bold text-white ${
                isMaintenance ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              <Power size={18} />
              {isMaintenance ? "إلغاء وضع الصيانة" : "تفعيل وضع الصيانة"}
            </button>
          </div>

          {/* بطاقات الإحصائيات (أرقام حقيقية من State) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-2">إجمالي المعالم</h3>
                <p className="text-4xl font-extrabold text-slate-800">{stats.totalLandmarks}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <LayoutGrid size={28} className="text-emerald-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-2">إجمالي الزيارات</h3>
                <p className="text-4xl font-extrabold text-slate-800">{stats.totalVisits}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Eye size={28} className="text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-2">زوار اليوم</h3>
                <p className="text-4xl font-extrabold text-slate-800">{stats.todayVisits}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <UserSquare2 size={28} className="text-amber-600" />
              </div>
            </div>
          </div>

          {/* شريط البحث والفلترة والإضافة */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="بحث بالاسم..." className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 outline-none focus:border-emerald-500 text-sm" />
            </div>
            
            <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 outline-none focus:border-emerald-500 text-sm appearance-none cursor-pointer">
                <option>كل التصنيفات</option>
                <option>المرافق الصحية</option>
                <option>الأماكن السياحية</option>
                <option>الفنادق والإقامات</option>
                <option>المطاعم والمقاهي</option>
                <option>الأسواق الشعبية</option>
                <option>الوكالات السياحية</option>
                <option>المساجد والزوايا</option>
              </select>
            </div>

            <button 
              onClick={() => router.push('/admin/dashboard/add-landmark')}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0f7654] hover:bg-[#0c6145] text-white px-6 py-3 rounded-xl transition-all shadow-md text-sm font-bold"
            >
              <Plus size={18} />
              إضافة معلم
            </button>
          </div>

          {/* شبكة المعالم */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {landmarks.map((landmark) => (
              <div key={landmark.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img src={landmark.image} alt={landmark.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {landmark.category}
                  </span>
                </div>
                <div className="p-4 border-b border-slate-100 text-center">
                  <h3 className="font-bold text-slate-800 text-lg">{landmark.name}</h3>
                </div>
                {/* أزرار التعديل والحذف */}
                <div className="flex divide-x divide-x-reverse border-t border-slate-100">
                  <button 
                    onClick={() => router.push(`/admin/dashboard/edit-landmark/${landmark.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Edit size={16} /> تعديل
                  </button>
                  <button 
                    onClick={() => handleDelete(landmark.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* الشريط الجانبي لتحليل الموقع (يسار) */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <BarChart3 size={20} className="text-emerald-600" />
              تحليل أداء الموقع
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">معدل البقاء (Bounce Rate)</span>
                <span className="text-sm font-bold text-slate-800">42%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">مستخدمين نشطين الآن</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  3
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-2">
                <button className="w-full flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg font-medium transition-colors">
                  <TrendingUp size={16} />
                  عرض التقرير المفصل
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}
