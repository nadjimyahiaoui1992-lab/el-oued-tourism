'use client';
import { useState } from 'react';
// تأكد من أن مسار ملف الاتصال صحيح حسب هيكل مشروعك
import { supabase } from '@/lib/supabaseClient'; 

export default function AddPlace() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    
    // تجهيز البيانات وتنظيفها لتجنب أخطاء قاعدة البيانات
    const newPlace = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      rating: parseFloat(formData.get('rating')) || 0, // تجنب إرسال NULL
      lat: parseFloat(formData.get('lat')) || null,
      lng: parseFloat(formData.get('lng')) || null,
      image_url: formData.get('image_url').trim(), // رابط نصي صافي بدون أقواس
    };

    const { error } = await supabase.from('places').insert([newPlace]);

    if (error) {
      setMessage({ type: 'error', text: `❌ حدث خطأ: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: '✅ تم إضافة المعلم السياحي بنجاح!' });
      e.target.reset(); // تفريغ الخانات لعملية إضافة جديدة
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 direction-rtl" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          إضافة معلم سياحي جديد
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اسم المعلم والتصنيف */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المعلم *</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                placeholder="مثال: مركب الغزالة الذهبية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف *</label>
              <select 
                name="category" 
                required 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="">اختر التصنيف...</option>
                <option value="طبيعة">طبيعة (غيطان، كثبان...)</option>
                <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                <option value="تاريخ وثقافة">تاريخ وثقافة (زوايا، متاحف...)</option>
                <option value="أسواق">أسواق تجارية</option>
              </select>
            </div>
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وصف المعلم</label>
            <textarea 
              name="description" 
              rows="4" 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition-colors"
              placeholder="اكتب نبذة مختصرة عن المكان وما يميزه..."
            ></textarea>
          </div>

          {/* الإحداثيات والتقييم */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">خط العرض (Latitude)</label>
              <input type="number" step="any" name="lat" placeholder="33.3680" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">خط الطول (Longitude)</label>
              <input type="number" step="any" name="lng" placeholder="6.8560" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التقييم (من 5)</label>
              <input type="number" step="0.1" max="5" min="0" name="rating" placeholder="4.5" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>

          {/* رابط الصورة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة (URL)</label>
            <input 
              type="url" 
              name="image_url" 
              placeholder="https://..." 
              dir="ltr"
              className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-green-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">تأكد من وضع الرابط المباشر للصورة بدون أي أقواس.</p>
          </div>

          {/* زر الحفظ ورسائل التنبيه */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ المعلم السياحي'}
            </button>
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mt-4 text-center font-bold ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}