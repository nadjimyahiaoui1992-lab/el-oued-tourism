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
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    checkUser();
    fetchDashboardData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
    else router.push('/admin/login');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    // جلب المعالم
    const { data: placesData } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    if (placesData) {
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    }
    // جلب حالة الصيانة
    const { data: settingsData } = await supabase.from('site_settings').select('is_maintenance').eq('id', 1).single();
    if (settingsData) setIsMaintenance(settingsData.is_maintenance);
    setLoading(false);
  };

  // الدالة الكاملة لتفعيل الصيانة (مع معالجة الأخطاء)
  const toggleMaintenance = async () => {
    const newVal = !isMaintenance;
    
    // محاولة التحديث في قاعدة البيانات
    const { error } = await supabase
      .from('site_settings')
      .update({ is_maintenance: newVal })
      .eq('id', 1);

    if (error) {
      console.error("خطأ تحديث الصيانة:", error);
      alert("فشل تحديث الحالة: تأكد من الاتصال بـ Supabase.");
    } else {
      setIsMaintenance(newVal); // تحديث الحالة برمجياً إذا نجح الاتصال
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      await supabase.from('places').delete().eq('id', id);
      setPlaces(places.filter(p => p.id !== id));
      setFilteredPlaces(filteredPlaces.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 direction-rtl" dir="rtl">
      {/* الشريط العلوي */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold">خروج</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* زر وضع الصيانة */}
        <div className="bg-white p-4 rounded-xl shadow border mb-6 flex justify-between items-center">
          <button 
            onClick={toggleMaintenance}
            className={`px-6 py-2 rounded-lg font-bold text-white ${isMaintenance ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            {isMaintenance ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة'}
          </button>
          <span className="font-bold text-gray-700">{isMaintenance ? '⚠️ الموقع مغلق' : '✅ الموقع نشط'}</span>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="2" className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr> : 
                filteredPlaces.map(place => (
                  <tr key={place.id} className="border-t">
                    <td className="p-4 font-bold">{place.name}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(place.id, place.name)} className="text-red-600">حذف</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
