'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Edit, Plus, LayoutDashboard, Loader2, LogOut, Power, Users, Search, Filter, Eye, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  // حالات الإحصائيات وإعدادات الموقع الحقيقية
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [stats, setStats] = useState({ totalViews: 1245, todayViews: 42 }); // أرقام افتراضية حتى نربطها لاحقاً بجوجل أناليتكس

  useEffect(() => {
    checkUser();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let result = places;
    if (searchQuery) result = result.filter(place => place.name.includes(searchQuery));
    if (selectedCategory !== 'الكل') result = result.filter(place => place.category === selectedCategory);
    setFilteredPlaces(result);
  }, [searchQuery, selectedCategory, places]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
    else router.push('/admin/login');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // جلب المعالم ووضع الصيانة الحقيقي من قاعدة البيانات
  const fetchDashboardData = async () => {
    setLoading(true);
    
    // جلب المعالم
    const { data: placesData } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    if (placesData) {
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    }

    // جلب وضع الصيانة
    const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (settingsData) {
      setIsMaintenance(settingsData.is_maintenance);
    }
    
    setLoading(false);
  };

  // زر تفعيل/تعطيل وضع الصيانة
  const toggleMaintenance = async () => {
    const newVal = !isMaintenance;
    setIsMaintenance(newVal); // التحديث الفوري في الواجهة
    await supabase.from('site_settings').update({ is_maintenance: newVal }).eq('id', 1);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف "${name}" نهائياً؟`)) {
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (!error) {
        setPlaces(places.filter(place => place.id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 direction-rtl" dir="rtl">
      {/* الشريط العلوي */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard size={28} className="text-teal-200" />
            <div>
              <h1 className="text-xl font-bold">لوحة التحكم - اكتشف سوف</h1>
              <p className="text-xs text-teal-100 hidden sm:block">مرحباً بك: {userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="hidden sm:flex items-center gap-2 bg-teal-800 hover:bg-teal-900 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer font-bold">
              <Users size={18} /> إدارة المساعدين
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <LogOut size={18} /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* شريط حالة الموقع ووضع الصيانة المتصل بقاعدة البيانات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMaintenance}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                isMaintenance ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Power size={18} />
              {isMaintenance ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة'}
            </button>
            <div className="text-sm font-semibold hidden sm:block text-gray-700">
              {isMaintenance ? '⚠️ الموقع مغلق للزوار حالياً' : '✅ الموقع نشط ومتاح للزوار'}
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي المعالم</p>
              <p className="text-3xl font-bold text-gray-800">{places.length}</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg text-teal-600"><LayoutDashboard size={28} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي الزيارات</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalViews}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Eye size={28} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">زوار اليوم</p>
              <p className="text-3xl font-bold text-gray-800">{stats.todayViews}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-orange-600"><UserCheck size={28} /></div>
          </div>
        </div>

        {/* أدوات البحث والفلترة */}
        <div className="bg-white rounded-t-xl shadow-sm p-4 flex gap-4">
          <div className="flex w-2/3 gap-4">
            <div className="relative w-2/3">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input type="text" placeholder="بحث بالاسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border rounded-lg py-2 pr-10 pl-4 outline-none" />
            </div>
            <div className="relative w-1/3">
              <Filter className="absolute right-3 top-3 text-gray-400" size={20} />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border rounded-lg py-2 pr-10 pl-4 outline-none bg-white">
                <option value="الكل">كل التصنيفات</option>
                <option value="طبيعة">طبيعة</option>
                <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                <option value="المرافق الصحية">المرافق الصحية</option>
                <option value="تاريخ وثقافة">تاريخ وثقافة</option>
                <option value="أسواق">أسواق</option>
              </select>
            </div>
          </div>
          <Link href="/admin/add-place" className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-bold flex gap-2 w-1/3 justify-center">
            <Plus size={20} /> إضافة معلم
          </Link>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-bold text-gray-700">اسم المعلم</th>
                <th className="p-4 font-bold text-gray-700">التصنيف</th>
                <th className="p-4 font-bold text-gray-700 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="3" className="p-10 text-center text-teal-600"><Loader2 className="animate-spin mx-auto" size={32} /></td></tr>
              ) : filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold">{place.name}</td>
                  <td className="p-4"><span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{place.category}</span></td>
                  <td className="p-4 flex justify-center gap-3">
                    <button onClick={() => handleDelete(place.id, place.name)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
