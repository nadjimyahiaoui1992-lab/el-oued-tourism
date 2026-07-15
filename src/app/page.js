"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Star, Navigation, Filter, Compass, ArrowRight, Image as ImageIcon } from "lucide-react";

// استدعاء الخريطة التفاعلية بدون SSR لضمان أداء عالي وتجنب الأخطاء
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#f8f9fa]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
      <span className="text-gray-400 text-xs font-bold">جاري تحميل الخريطة الذكية...</span>
    </div>
  ),
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";
const CATEGORIES = ["الكل", "طبيعة", "مغامرات", "تاريخ وثقافة", "أسواق", "الفنادق", "المرافق الصحية"];

// صور ألبوم افتراضية في حال عدم توفر صور إضافية في قاعدة البيانات
const DUMMY_GALLERY = [
  "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=400",
  "https://images.unsplash.com/photo-1585155967849-91c736589c84?q=80&w=400",
  "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=400"
];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // جلب البيانات من Supabase
  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("places").select("*").limit(50);
      if (error) throw error;
      if (data) setPlaces(data);
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // فلترة المعالم ديناميكياً
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  // التحكم عند النقر على معلم (طيران الكاميرا في الخريطة وفتح التفاصيل)
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
  };

  const handleBackToList = () => {
    setSelectedPlace(null);
  };

  return (
    <main dir="rtl" className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* القائمة الجانبية الذكية */}
      <aside className="w-full md:w-[380px] h-[50dvh] md:h-full bg-white shadow-2xl md:shadow-[0_0_20px_rgba(0,0,0,0.05)] z-10 flex flex-col shrink-0 order-2 md:order-1 relative rounded-t-3xl md:rounded-none -mt-4 md:mt-0 transition-all duration-300">
        
        {/* مقبض السحب المرن للهواتف الذكية */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* 1. واجهة تفاصيل المعلم المستقلة الاحترافية */}
        {selectedPlace ? (
          <div className="flex flex-col h-full bg-white animate-in slide-in-from-left duration-300 relative z-20">
            
            {/* الصورة الرئيسية كغلاف هيدر متكامل */}
            <div className="relative w-full h-52 shrink-0 bg-gray-100 rounded-b-3xl overflow-hidden shadow-sm">
              <Image 
                src={selectedPlace.image_url || FALLBACK_IMAGE} 
                alt={selectedPlace.name} 
                fill 
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              
              {/* زر الرجوع العائم ذو التأثير الضبابي */}
              <button 
                onClick={handleBackToList}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-orange-600 rounded-full transition-all shadow-sm"
              >
                <ArrowRight size={20} />
              </button>

              {/* تقييم المعلم */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <Star size={14} className="text-orange-400 fill-orange-400" /> 
                <span className="text-gray-800">{selectedPlace.rating || "4.5"}</span>
              </div>

              {/* شارة التصنيف والعنوان المدمج */}
              <div className="absolute bottom-4 right-4 left-4 text-white">
                <div className="inline-block bg-orange-500 text-[10px] font-bold px-2 py-0.5 rounded mb-1 shadow-sm">
                  {selectedPlace.category}
                </div>
                <h1 className="text-xl font-black drop-shadow-md leading-tight">
                  {selectedPlace.name}
                </h1>
              </div>
            </div>

            {/* تفاصيل المعلم القابلة للتمرير الداخلي */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* قسم نبذة عن المكان */}
              <div>
                <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
                  <Compass size={16} className="text-orange-500" /> نبذة عن المكان
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed text-justify bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                  {selectedPlace.description || "لا يوجد وصف مفصل لهذا المعلم حالياً."}
                </p>
              </div>

              {/* قسم ألبوم الصور المصمم كشبكة عصرية */}
              <div>
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 mb-3">
                  <ImageIcon size={16} className="text-orange-500" /> ألبوم الصور
                </h3>
                <div className="grid grid-cols-2 gap-2">
                   <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-100 shadow-sm col-span-2">
                     <Image src={selectedPlace.image_url || FALLBACK_IMAGE} alt="معاينة أولى" fill className="object-cover" />
                   </div>
                   <div className="relative w-full h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                     <Image src={DUMMY_GALLERY[0]} alt="معاينة ثانية" fill className="object-cover" />
                   </div>
                   <div className="relative w-full h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                     <Image src={DUMMY_GALLERY[1]} alt="معاينة ثالثة" fill className="object-cover" />
                   </div>
                </div>
              </div>

            </div>

            {/* زر الحصول على الاتجاهات التفاعلي المباشر */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              {selectedPlace.lat && selectedPlace.lng ? (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                >
                  <Navigation size={16} /> الحصول على الاتجاهات
                </a>
              ) : (
                <div className="w-full text-center py-3 rounded-xl font-bold text-gray-400 bg-gray-50 border border-gray-100 text-xs">
                  إحداثيات الموقع غير متوفرة
                </div>
              )}
            </div>

          </div>
        ) : (
          
          /* 2. واجهة القائمة الرئيسية المدمجة (البحث والبطاقات المصغرة) */
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            
            {/* هيدر القائمة البحثية */}
            <div className="px-4 pt-2 md:pt-6 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-xl text-white shadow-md">
                  <Compass size={20} />
                </div>
                <div>
                  <h1 className="font-black text-xl leading-none">اكتشف سوف</h1>
                  <p className="text-[10px] text-orange-600 font-bold mt-1">الخريطة السياحية الذكية</p>
                </div>
              </div>

              {/* شريط بحث سلس ومستدير بحواف ناعمة */}
              <div className="bg-gray-50 rounded-xl p-1 flex items-center border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <div className="text-gray-400 p-2 shrink-0">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن وجهتك..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-1 text-sm font-bold placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* تصنيفات سريعة الفلترة مع شريط تمرير مخفي */}
            <div className="py-2 px-3 border-b border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <Filter className="text-gray-400 shrink-0 ml-1" size={16} />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeCategory === cat 
                        ? "bg-orange-50 text-orange-600 border border-orange-200" 
                        : "bg-transparent text-gray-500 border border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* منطقة البطاقات المدمجة المتناسقة بصرياً */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f9fa]">
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-xs font-black text-gray-700">الأماكن المقترحة</span>
                <span className="text-[10px] font-bold text-gray-400">{filteredPlaces.length} معلم</span>
              </div>

              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
                ))
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-10">
                  <Compass size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 font-bold text-xs">لا توجد معالم تطابق بحثك</p>
                </div>
              ) : (
                filteredPlaces.map((place) => (
                  <div 
                    key={place.id} 
                    onClick={() => handlePlaceSelect(place)}
                    className="bg-white rounded-xl p-2 flex gap-3 cursor-pointer border border-gray-100 shadow-sm hover:border-orange-300 transition-all group"
                  >
                    {/* غلاف صورة البطاقة مع تاغ التصنيف */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image src={place.image_url || FALLBACK_IMAGE} alt={place.name} fill className="object-cover" />
                      <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                        {place.category}
                      </div>
                    </div>
                    
                    {/* معلومات البطاقات المستغلة للمساحات بشكل رصين */}
                    <div className="flex flex-col flex-1 justify-between py-0.5">
                      <div>
                        <h4 className="font-black text-sm text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">{place.name}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{place.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                          <Star size={10} className="text-orange-400 fill-orange-400" />
                          <span className="text-[10px] font-bold">{place.rating || "4.5"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </aside>

      {/* 3. نافذة الخريطة التفاعلية الكبيرة كمشهد رئيسي مستمر */}
      <section className="flex-1 h-[50dvh] md:h-full relative z-0 order-1 md:order-2 bg-[#e5e5e5]">
        {/* ربط متبادل: النقر على الماركر يفتح تفاصيل الماستر ديتيل مباشرة */}
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={handlePlaceSelect} />
        
        {/* علامة توضيحية علوية ثابتة */}
        <div className="absolute top-4 left-4 z-[400]">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-100 text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
            <MapPin size={12} className="text-orange-500" />
            خريطة ولاية الوادي التفاعلية
          </div>
        </div>
      </section>

    </main>
  );
}
