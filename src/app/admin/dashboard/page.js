'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Trash2,
  Pencil,
  Plus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Power,
  Users,
  Search,
  Filter,
  Eye,
  UserCheck,
  X,
  ImageIcon,
  UploadCloud,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CATEGORY_OPTIONS = [
  'طبيعة',
  'فنادق ومنتجعات',
  'المرافق الصحية',
  'تاريخ وثقافة',
  'أسواق',
  'المطاعم',
  'فضاء التسلية',
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=400';

export default function Dashboard() {
  const router = useRouter();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [stats, setStats] = useState({ totalViews: 1245, todayViews: 42 });

  // حالة نافذة التعديل
  const [editingPlace, setEditingPlace] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkUser();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let result = places;
    if (searchQuery) result = result.filter((place) => place.name.includes(searchQuery));
    if (selectedCategory !== 'الكل') result = result.filter((place) => place.category === selectedCategory);
    setFilteredPlaces(result);
  }, [searchQuery, selectedCategory, places]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
    else router.push('/admin/login');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    const { data: placesData } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });
    if (placesData) {
      setPlaces(placesData);
      setFilteredPlaces(placesData);
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (settingsData) {
      setIsMaintenance(settingsData.is_maintenance);
    } else if (settingsError) {
      console.error('Settings fetch error:', settingsError.message);
    }

    setLoading(false);
  };

  const toggleMaintenance = async () => {
    setMaintenanceLoading(true);
    const newVal = !isMaintenance;
    const { error } = await supabase
      .from('site_settings')
      .update({ is_maintenance: newVal })
      .eq('id', 1);

    if (error) {
      setToast({ type: 'error', text: `فشل التحديث: ${error.message}` });
    } else {
      setIsMaintenance(newVal);
      setToast({ type: 'success', text: newVal ? 'تم تفعيل وضع الصيانة' : 'تم تعطيل وضع الصيانة' });
    }
    setMaintenanceLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف "${name}" نهائياً؟`)) {
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (!error) {
        setPlaces(places.filter((place) => place.id !== id));
        setToast({ type: 'success', text: 'تم الحذف بنجاح' });
      } else {
        setToast({ type: 'error', text: `فشل الحذف: ${error.message}` });
      }
    }
  };

  const openEdit = (place) => {
    setEditingPlace(place);
    setEditForm({
      name: place.name || '',
      description: place.description || '',
      category: place.category || CATEGORY_OPTIONS[0],
      rating: place.rating || '',
      lat: place.lat || '',
      lng: place.lng || '',
      map_link: place.map_link || '',
    });
    setEditImageFile(null);
  };

  const closeEdit = () => {
    setEditingPlace(null);
    setEditForm({});
    setEditImageFile(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPlace) return;
    setSavingEdit(true);

    let finalImageUrl = editingPlace.image_url;

    try {
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, editImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('places')
        .update({
          name: editForm.name,
          description: editForm.description,
          category: editForm.category,
          rating: parseFloat(editForm.rating) || 0,
          lat: parseFloat(editForm.lat) || null,
          lng: parseFloat(editForm.lng) || null,
          map_link: editForm.map_link || null,
          image_url: finalImageUrl,
        })
        .eq('id', editingPlace.id);

      if (updateError) throw updateError;

      setToast({ type: 'success', text: 'تم حفظ التعديلات بنجاح' });
      closeEdit();
      fetchDashboardData();
    } catch (err) {
      setToast({ type: 'error', text: `فشل الحفظ: ${err.message}` });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* الشريط العلوي */}
      <div className="bg-gradient-to-l from-emerald-700 to-emerald-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LayoutDashboard size={26} className="text-amber-400" />
            <div>
              <h1 className="text-lg md:text-xl font-black">لوحة التحكم - اكتشف سوف</h1>
              <p className="text-xs text-emerald-100 hidden sm:block">مرحباً بك: {userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-sm transition-colors font-bold"
            >
              <Users size={16} /> إدارة المساعدين
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/90 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* شريط الصيانة */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMaintenance}
              disabled={maintenanceLoading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-colors disabled:opacity-60 ${
                isMaintenance ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {maintenanceLoading ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
              {isMaintenance ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة'}
            </button>
            <div className="text-sm font-semibold text-gray-700">
              {isMaintenance ? '⚠️ الموقع مغلق للزوار حالياً' : '✅ الموقع نشط ومتاح للزوار'}
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي المعالم</p>
              <p className="text-2xl md:text-3xl font-black text-gray-800">{places.length}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><LayoutDashboard size={26} /></div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي الزيارات</p>
              <p className="text-2xl md:text-3xl font-black text-gray-800">{stats.totalViews}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Eye size={26} /></div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">زوار اليوم</p>
              <p className="text-2xl md:text-3xl font-black text-gray-800">{stats.todayViews}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><UserCheck size={26} /></div>
          </div>
        </div>

        {/* أدوات البحث والفلترة + زر الإضافة */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Link
            href="/admin/add-place"
            className="order-1 md:order-2 bg-gradient-to-l from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex gap-2 items-center justify-center shadow-sm shadow-emerald-900/10"
          >
            <Plus size={20} /> إضافة معلم
          </Link>
          <div className="order-2 md:order-1 flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="بحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none text-sm focus:border-emerald-400"
              />
            </div>
            <div className="relative w-44 shrink-0">
              <Filter className="absolute right-3 top-3.5 text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-3 pr-10 pl-4 outline-none bg-white text-sm"
              >
                <option value="الكل">كل التصنيفات</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* شبكة المعالم */}
        {loading ? (
          <div className="py-20 text-center text-emerald-600">
            <Loader2 className="animate-spin mx-auto" size={32} />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm border border-gray-100">
            لا توجد معالم مطابقة
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-full h-36 bg-gray-100">
                  <Image
                    src={place.image_url || FALLBACK_IMAGE}
                    alt={place.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-emerald-700 px-2 py-1 rounded-full">
                    {place.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-gray-900 truncate mb-3">{place.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(place)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
                    >
                      <Pencil size={14} /> تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(place.id, place.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors"
                    >
                      <Trash2 size={14} /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة التعديل المنبثقة */}
      {editingPlace && (
        <div
          className="fixed inset-0 z-[1000] bg-black/50 flex items-end md:items-center md:justify-center p-0 md:p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-white w-full md:w-[560px] rounded-t-3xl md:rounded-3xl p-6 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">تعديل المعلم</h2>
              <button onClick={closeEdit} className="p-2 bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200">
                <Image
                  src={editImageFile ? URL.createObjectURL(editImageFile) : (editingPlace.image_url || FALLBACK_IMAGE)}
                  alt="preview"
                  fill
                  className="object-cover"
                />
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 hover:bg-black/40 text-transparent hover:text-white transition-all cursor-pointer text-xs font-bold gap-1">
                  <UploadCloud size={22} />
                  تغيير الصورة
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setEditImageFile(e.target.files[0])}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">اسم المعلم</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">التصنيف</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none bg-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">التقييم</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    dir="ltr"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400 text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الوصف</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">رابط الخريطة / Plus Code</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editForm.map_link}
                  onChange={(e) => setEditForm({ ...editForm, map_link: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400 text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">خط العرض (Lat)</label>
                  <input
                    type="number"
                    step="any"
                    dir="ltr"
                    value={editForm.lat}
                    onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400 text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">خط الطول (Lng)</label>
                  <input
                    type="number"
                    step="any"
                    dir="ltr"
                    value={editForm.lng}
                    onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-400 text-left"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-l from-emerald-600 to-emerald-700 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingEdit ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {savingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إشعار Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 inset-x-4 md:inset-x-auto md:left-6 z-[1100] px-5 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
