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

  // جلب البيانات من قاعدة البيانات (بما في ذلك وضع الصيانة)
  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. جلب المعالم
    const { data: placesData } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    if (placesData) {
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    }

    // 2. جلب حالة وضع الصيانة
    const { data: settingsData } = await supabase.from('site_settings').select('is_maintenance').eq('id', 1).single();
    if (settingsData) {
      setIsMaintenance(settingsData.is_maintenance);
    }
    setLoading(false);
  };

  // الدالة الصحيحة والمربوطة بقاعدة البيانات
  const toggleMaintenance = async () => {
    const newVal = !isMaintenance;
    const { error } = await supabase
      .from('site_settings')
      .update({ is_maintenance: newVal })
      .eq('id', 1);

    if (error) {
      alert("خطأ في التحديث: " + error.message);
    } else {
      setIsMaintenance(newVal);
    }
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
      {/* 1. الشريط العلوي */}
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
            <Link href="/admin/users" className="hidden sm:flex items-center gap-2 bg-teal-800 hover:bg-teal-900 px-4 py-2 rounded-lg text-sm transition-colors font-bold">
              <Users size={18} /> إدارة المستخدمين
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <LogOut size={18} /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 2. شريط وضع الصيانة */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex justify-between items-center">
          <button 
            onClick={toggleMaintenance}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-colors ${
              isMaintenance ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            <Power size={18} /> {isMaintenance ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة'}
          </button>
          <div className="text-sm font-bold text-gray-700">
            {isMaintenance ? '⚠️ الموقع مغلق للزوار' : '✅ الموقع نشط'}
          </div>
        </div>

        {/* 3. الإحصائيات والبحث والجدول (نفس الكود السابق...) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
            <div><p className="text-gray-500 text-sm">إجمالي المعالم</p><p className="text-3xl font-bold">{places.length}</p></div>
            <LayoutDashboard className="text-teal-600" size={28} />
          </div>
          {/* ... بقية البطاقات */}
        </div>

        {/* ... الجدول وأدوات البحث (تم دمجها في نسختك السابقة وهي تعمل بشكل جيد) */}
      </div>
    </div>
  );
}
