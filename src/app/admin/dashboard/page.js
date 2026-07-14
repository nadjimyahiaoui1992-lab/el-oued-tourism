'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Edit, Plus, LayoutDashboard, Loader2, LogOut, Power, Users, Search, Filter, Eye, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  // حالات البيانات (States)
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  // حالات البحث والتصفية
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  // حالات إعدادات الموقع
  const [isMaintenance, setIsMaintenance] = useState(false);

  // جلب البيانات عند فتح الصفحة
  useEffect(() => {
    checkUser();
    fetchPlaces();
  }, []);

  // تفعيل البحث والتصفية فور تغيير المدخلات
  useEffect(() => {
    let result = places;
    if (searchQuery) {
      result = result.filter(place => place.name.includes(searchQuery));
    }
    if (selectedCategory !== 'الكل') {
      result = result.filter(place => place.category === selectedCategory);
    }
    setFilteredPlaces(result);
  }, [searchQuery, selectedCategory, places]);

  // التحقق من المستخدم الحالي
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email);
    } else {
      router.push('/admin/login');
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // جلب المعالم
  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setPlaces(data);
      setFilteredPlaces(data);
    }
    setLoading(false);
  };

  // حذف معلم
  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف "${name}" نهائياً؟`)) {
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (!error) {
        setPlaces(places.filter(place => place.id !== id));
        alert('تم الحذف بنجاح!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 direction-rtl" dir="rtl">
      
      {/* 1. الشريط العلوي الاحترافي */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard size={28} className="text-teal-200" />
            <div>
              <h1 className="text-xl font-bold">لوحة التحكم - اكتشف سوف</h1>
              <p className="text-xs text-teal-100 hidden sm:block">مرحباً بك: {userEmail || 'جاري التحميل...'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="hidden sm:flex items-center gap-2 bg-teal-800 hover:bg-teal-900 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer">
              <Users size={18} />
              إدارة المستخدمين
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <LogOut size={18} />
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 2. شريط حالة الموقع (وضع الصيانة والاتصال) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsMaintenance(!isMaintenance)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-colors w-full sm:w-auto justify-center ${
                isMaintenance ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Power size={18} />
              {isMaintenance ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة'}
            </button>
            <div className="text-sm text-gray-600 hidden sm:block">
              {isMaintenance ? 'الموقع مغلق للزوار حالياً' : 'الموقع نشط ومتاح للزوار'}
            </div>
          </div>
          <div className="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            متصل بقاعدة البيانات: Supabase
          </div>
        </div>

        {/* 3. بطاقات الإحصائيات (مثل اللوحة القديمة تماماً) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي المعالم</p>
              <p className="text-3xl font-bold text-gray-800">{places.length}</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg text-teal-600">
              <LayoutDashboard size={28} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي الزيارات</p>
              <p className="text-3xl font-bold text-gray-800">1,245</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Eye size={28} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">زوار اليوم</p>
              <p className="text-3xl font-bold text-gray-800">42</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-orange-600">
              <UserCheck size={28} />
            </div>
          </div>
        </div>

        {/* 4. شريط البحث والتصفية وزر الإضافة */}
        <div className="bg-white rounded-t-xl shadow-sm border-x border-t border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex w-full sm:w-2/3 gap-4">
            <div className="relative w-full sm:w-2/3">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="بحث بالاسم..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pr-10 pl-4 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="relative w-full sm:w-1/3">
              <Filter className="absolute right-3 top-3 text-gray-400" size={20} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pr-10 pl-4 focus:ring-2 focus:ring-teal-500 outline-none appearance-none bg-white"
              >
                <option value="الكل">كل التصنيفات</option>
                <option value="طبيعة">طبيعة</option>
                <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                <option value="المرافق الصحية">المرافق الصحية</option>
                <option value="تاريخ وثقافة">تاريخ وثقافة</option>
                <option value="أسواق">أسواق</option>
              </select>
            </div>
          </div>
          <Link href="/admin/add-place" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Plus size={20} />
            إضافة معلم جديد
          </Link>
        </div>

        {/* 5. جدول المعالم */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-700">اسم المعلم</th>
                  <th className="p-4 font-bold text-gray-700">التصنيف</th>
                  <th className="p-4 font-bold text-gray-700 text-center">التقييم</th>
                  <th className="p-4 font-bold text-gray-700">تاريخ الإضافة</th>
                  <th className="p-4 font-bold text-gray-700 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500">
                      <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={32} />
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : filteredPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500 font-medium">
                      لا توجد معالم مطابقة للبحث أو الفلتر.
                    </td>
                  </tr>
                ) : (
                  filteredPlaces.map((place) => (
                    <tr key={place.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-800">{place.name}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200">
                          {place.category}
                        </span>
                      </td>
                      <td className="p-4 text-yellow-500 font-bold text-center">{place.rating} ⭐</td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(place.created_at).toLocaleDateString('ar-DZ')}
                      </td>
                      <td className="p-4 flex justify-center gap-3">
                        <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(place.id, place.name)}
                          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm text-gray-500 text-left" dir="ltr">
            Showing {filteredPlaces.length} entries
          </div>
        </div>

      </div>
    </div>
  );
}
