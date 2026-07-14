'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Edit, Plus, LayoutDashboard, Loader2, LogOut, Search, UserCheck, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkUser();
    fetchPlaces();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
    else router.push('/admin/login');
  };

  const fetchPlaces = async () => {
    setLoading(true);
    const { data } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    if (data) setPlaces(data);
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      await supabase.from('places').delete().eq('id', id);
      setPlaces(places.filter(p => p.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 direction-rtl" dir="rtl">
      {/* الترويسة العلوية الفخمة */}
      <div className="bg-[#009688] text-white p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard /> لوحة التحكم - اكتشف سوف
          </h1>
          <p className="text-sm opacity-90">مرحباً بك: {userEmail}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/users" className="bg-[#00796B] px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-[#00695C]">
            <Users size={18} /> إدارة المستخدمين
          </Link>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-red-600">
            <LogOut size={18} /> خروج
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* شريط الاتصال */}
        <div className="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg mb-6 flex items-center gap-2 w-max">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> متصل بقاعدة البيانات: Supabase
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center border">
            <div><p className="text-gray-500 text-sm">إجمالي المعالم</p><p className="text-3xl font-bold">{places.length}</p></div>
            <LayoutDashboard className="text-teal-600" size={32} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center border">
            <div><p className="text-gray-500 text-sm">إجمالي الزيارات</p><p className="text-3xl font-bold">1,245</p></div>
            <Eye className="text-blue-600" size={32} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center border">
            <div><p className="text-gray-500 text-sm">زوار اليوم</p><p className="text-3xl font-bold">42</p></div>
            <UserCheck className="text-orange-600" size={32} />
          </div>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-xl shadow border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg">قائمة المعالم</h2>
            <Link href="/admin/add-place" className="bg-[#009688] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#00796B]">
              + إضافة معلم جديد
            </Link>
          </div>
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">اسم المعلم</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">تاريخ الإضافة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan="4" className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr> : 
                places.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold">{p.name}</td>
                    <td className="p-4"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs">{p.category}</span></td>
                    <td className="p-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString('ar-DZ')}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
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
