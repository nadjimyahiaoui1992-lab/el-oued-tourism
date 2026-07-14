'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Edit, Plus, MapPin, LayoutDashboard, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false }); // ترتيب من الأحدث للأقدم

    if (!error) {
      setPlaces(data);
    }
    setLoading(false);
  };

  // دالة حذف المعلم
  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف "${name}" نهائياً؟`)) {
      const { error } = await supabase.from('places').delete().eq('id', id);
      
      if (!error) {
        // تحديث الجدول فوراً بعد الحذف
        setPlaces(places.filter(place => place.id !== id));
        alert('تم الحذف بنجاح!');
      } else {
        alert('حدث خطأ أثناء الحذف: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 direction-rtl" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* الترويسة والإحصائيات */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="text-teal-600" size={32} />
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-gray-500 mt-1">إدارة المعالم السياحية لولاية الوادي</p>
          </div>
          
          <Link href="/admin/add-place" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
            <Plus size={20} />
            إضافة معلم جديد
          </Link>
        </div>

        {/* بطاقة الإحصائيات السريعة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-6">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
            <p className="text-teal-800 text-sm font-semibold mb-1">إجمالي المعالم المضافة</p>
            <p className="text-3xl font-bold text-teal-600">{places.length}</p>
          </div>
        </div>

        {/* جدول المعالم */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-700">اسم المعلم</th>
                  <th className="p-4 font-bold text-gray-700">التصنيف</th>
                  <th className="p-4 font-bold text-gray-700">التقييم</th>
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
                ) : places.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500 font-medium">
                      لا توجد معالم مضافة بعد. ابدأ بإضافة معلمك الأول!
                    </td>
                  </tr>
                ) : (
                  places.map((place) => (
                    <tr key={place.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-800">{place.name}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {place.category}
                        </span>
                      </td>
                      <td className="p-4 text-yellow-500 font-bold">{place.rating} ⭐</td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(place.created_at).toLocaleDateString('ar-DZ')}
                      </td>
                      <td className="p-4 flex justify-center gap-3">
                        <button 
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          title="تعديل (سنبرمجها لاحقاً)"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(place.id, place.name)}
                          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                          title="حذف"
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
        </div>

      </div>
    </div>
  );
}
