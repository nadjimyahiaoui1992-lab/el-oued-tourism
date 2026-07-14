'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, Image as ImageIcon, Info, UploadCloud, Map, PlusCircle } from 'lucide-react';

export default function AddPlace() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [files, setFiles] = useState([]);

  // دالة التعامل مع اختيار الصور
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.target);
    let uploadedUrls = [];

    // 1. رفع الصور إلى Supabase Storage إذا تم اختيارها
    if (files.length > 0) {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('places_images')
          .upload(filePath, file);

        if (uploadError) {
          setMessage({ type: 'error', text: `❌ فشل رفع الصور: ${uploadError.message}` });
          setLoading(false);
          return;
        }

        // جلب الرابط العام للصورة بعد رفعها
        const { data: publicUrlData } = supabase.storage
          .from('places_images')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    // 2. تجهيز البيانات (صورة واحدة أو مصفوفة صور حسب اختيارك)
    // ملاحظة: قمنا بتحويل المصفوفة إلى نص حتى لا ينهار الموقع كما حدث سابقاً
    const finalImageUrl = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null;

    const newPlace = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      rating: parseFloat(formData.get('rating')) || 0,
      lat: parseFloat(formData.get('lat')) || null,
      lng: parseFloat(formData.get('lng')) || null,
      map_link: formData.get('map_link').trim() || null, // الرابط القصير أو رابط جوجل
      image_url: finalImageUrl, 
    };

    // 3. الحفظ في قاعدة البيانات
    const { error } = await supabase.from('places').insert([newPlace]);

    if (error) {
      setMessage({ type: 'error', text: `❌ حدث خطأ في الحفظ: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: '✅ تم إضافة المعلم السياحي والصور بنجاح!' });
      e.target.reset();
      setFiles([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 direction-rtl" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* ترويسة الصفحة */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <PlusCircle size={32} />
            إضافة معلم سياحي جديد
          </h1>
          <p className="text-teal-100">لوحة التحكم الاحترافية - دليلك السياحي لولاية الوادي</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* القسم الأول: المعلومات الأساسية */}
          <div className="space-y-6 border-b pb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Info className="text-teal-500" /> المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المعلم *</label>
                <input type="text" name="name" required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" placeholder="مثال: مركب الغزالة الذهبية" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">التصنيف *</label>
                <select name="category" required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50">
                  <option value="">اختر التصنيف...</option>
                  <option value="طبيعة">طبيعة (غيطان، كثبان...)</option>
                  <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                  <option value="المرافق الصحية">المرافق الصحية (مصحات، مستشفيات)</option>
                  <option value="تاريخ وثقافة">تاريخ وثقافة (زوايا، متاحف...)</option>
                  <option value="أسواق">أسواق تجارية</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف المعلم</label>
              <textarea name="description" rows="3" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" placeholder="اكتب نبذة مختصرة عن المكان..."></textarea>
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">التقييم (من 5)</label>
              <input type="number" step="0.1" max="5" min="0" name="rating" placeholder="4.5" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
            </div>
          </div>

          {/* القسم الثاني: الموقع الجغرافي */}
          <div className="space-y-6 border-b pb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-teal-500" /> الموقع الجغرافي (اختياري)
            </h2>
            <p className="text-sm text-gray-500">يمكنك إدخال الإحداثيات الدقيقة، أو ببساطة وضع رابط خريطة جوجل أو الرمز القصير (Plus Code).</p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الخريطة أو Plus Code</label>
                <div className="relative">
                  <Map className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input type="text" name="map_link" placeholder="مثال: 9VRC+CGX, El Oued" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">خط العرض (Lat)</label>
                  <input type="number" step="any" name="lat" placeholder="33.3680" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">خط الطول (Lng)</label>
                  <input type="number" step="any" name="lng" placeholder="6.8560" dir="ltr" className="w-full border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" />
                </div>
              </div>
            </div>
          </div>

          {/* القسم الثالث: الوسائط والصور */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="text-teal-500" /> معرض الصور
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <UploadCloud className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">اضغط هنا لرفع الصور أو قم بسحبها وإفلاتها</p>
              <p className="text-sm text-gray-400 mt-2">يمكنك اختيار صورة واحدة أو عدة صور معاً (PNG, JPG)</p>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {files.length > 0 && (
              <p className="text-teal-600 font-bold text-sm">تم اختيار {files.length} صور جاهزة للرفع.</p>
            )}
          </div>

          {/* زر الإرسال */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <span className="animate-pulse">جاري معالجة ورفع البيانات...</span>
              ) : (
                <>حفظ ونشر المعلم السياحي</>
              )}
            </button>
          </div>

          {/* رسائل التنبيه */}
          {message.text && (
            <div className={`p-4 rounded-xl mt-4 text-center font-bold border ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
