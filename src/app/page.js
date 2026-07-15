"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Star, Navigation, Filter, Compass } from "lucide-react";

// استدعاء الخريطة بدون SSR
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3" />
      <span className="text-gray-500 font-bold">جاري تحميل الخريطة الذكية...</span>
    </div>
  ),
});

// إحداثيات ولاية الوادي الافتراضية
const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";

const CATEGORIES = ["الكل", "طبيعة", "مغامرات", "تاريخ وثقافة", "أسواق", "الفنادق", "المطاعم"];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [activePlaceId, setActivePlaceId] = useState(null);

  // جلب البيانات من قاعدة البيانات
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

  // فلترة المعالم
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  // دالة النقر على البطاقة للطيران في الخريطة
  const handlePlaceClick = (place) => {
    setActivePlaceId(place.id);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
  };

  return (
    // استخدام h-screen لمنع التمرير العام وجعل التطبيق يبدو كبرنامج (Native App)
    <main dir="rtl" className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-gray-50 font-sans">
      
      {/* القسم الأول: اللوحة الجانبية (البحث والبطاقات) */}
      {/* الترتيب في الهاتف: أسفل (order-2) / الترتيب في الحاسوب: يمين (order-1) */}
      <aside className="w-full md:w-[400px] lg:w-[450px] h-[55vh] md:h-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.08)] z-10 flex flex-col shrink-0 order-2 md:order-1">
        
        {/* الترويسة وشريط البحث */}
        <div className="p-4 md:p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-500/20">
              <Compass size={24} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-gray-900 leading-none">اكتشف سوف</h1>
              <p className="text-xs text-orange-600 font-bold mt-1">الخريطة السياحية الذكية</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-1.5 flex items-center border border-gray-100 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
            <div className="text-gray-400 p-2 shrink-0">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن معلم، واحة، سوق..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-2 text-gray-800 font-bold placeholder:text-gray-400 text-sm"
            />
          </div>
        </div>

        {/* شريط التصنيفات (يمرر أفقياً) */}
        <div className="py-3 px-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <Filter className="text-orange-500 shrink-0 ml-1" size={18} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* قائمة المعالم السياحية (الجزء القابل للتمرير) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-sm font-black text-gray-800">الأماكن المقترحة</span>
            <span className="text-xs font-bold text-gray-400">{filteredPlaces.length} معلم</span>
          </div>

          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl" />
            ))
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-10">
              <Compass size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-bold text-sm">لم نجد معالم تطابق بحثك</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div 
                key={place.id} 
                onClick={() => handlePlaceClick(place)}
                className={`bg-white rounded-2xl p-3 flex gap-4 cursor-pointer border-2 transition-all ${
                  activePlaceId === place.id 
                    ? "border-orange-500 shadow-md shadow-orange-500/10" 
                    : "border-transparent shadow-sm hover:border-gray-200"
                }`}
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                  <Image src={place.image_url || FALLBACK_IMAGE} alt={place.name} fill className="object-cover" />
                  <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm text-[9px] font-bold px-1.5 py-0.5 rounded text-orange-600">
                    {place.category}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 py-1">
                  <h4 className="font-black text-sm text-gray-900 line-clamp-1 mb-1">{place.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-auto leading-relaxed">{place.description}</p>
                  
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-orange-500 fill-orange-500" />
                      <span className="text-xs font-bold text-gray-800">{place.rating || "4.5"}</span>
                    </div>
                    
                    <a 
                      href={place.lat && place.lng ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-600 p-1.5 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()} // لمنع تفعيل النقر على البطاقة عند النقر على الزر
                      title="الاتجاهات"
                    >
                      <Navigation size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* القسم الثاني: الخريطة الذكية (الواجهة الأساسية) */}
      {/* الترتيب في الهاتف: أعلى (order-1) / الترتيب في الحاسوب: يسار (order-2) */}
      <section className="flex-1 h-[45vh] md:h-full relative z-0 order-1 md:order-2 bg-gray-200">
        <ElOuedMap center={mapCenter} places={filteredPlaces} />
        
        {/* زر التوجيه العائم أعلى الخريطة في الهواتف */}
        <div className="absolute top-4 right-4 z-[400] md:hidden">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg text-xs font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={14} className="text-orange-500" />
            خريطة الوادي التفاعلية
          </div>
        </div>
      </section>

    </main>
  );
}
