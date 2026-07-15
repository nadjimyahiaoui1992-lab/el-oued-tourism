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
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#f8f9fa]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
      <span className="text-gray-400 text-xs font-bold">جاري تحميل الخريطة...</span>
    </div>
  ),
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=400";
const CATEGORIES = ["الكل", "طبيعة", "مغامرات", "تاريخ وثقافة", "أسواق", "الفنادق", "المرافق الصحية"];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [activePlaceId, setActivePlaceId] = useState(null);

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

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  const handlePlaceClick = (place) => {
    setActivePlaceId(place.id);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
  };

  return (
    // استخدام h-[100dvh] لضمان التوافق مع متصفحات الهواتف
    <main dir="rtl" className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* القائمة الجانبية (البحث والبطاقات) */}
      {/* في الهاتف: الارتفاع 50% وتكون بالأسفل / في الحاسوب: العرض 380px وتكون باليمين */}
      <aside className="w-full md:w-[380px] h-[50dvh] md:h-full bg-white shadow-2xl md:shadow-[0_0_20px_rgba(0,0,0,0.05)] z-10 flex flex-col shrink-0 order-2 md:order-1 relative rounded-t-3xl md:rounded-none -mt-4 md:mt-0 transition-transform">
        
        {/* مقبض السحب للهواتف (تصميم جمالي فقط) */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* الترويسة المدمجة وشريط البحث */}
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

          <div className="bg-gray-50 rounded-xl p-1 flex items-center border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <div className="text-gray-400 p-2 shrink-0">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن وجهتك..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-1 text-sm font-bold placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>
        </div>

        {/* شريط التصنيفات (مدمج وأصغر) */}
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

        {/* قائمة المعالم */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f9fa]">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            ))
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-8">
              <Compass size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 font-bold text-xs">لا توجد معالم تطابق بحثك</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div 
                key={place.id} 
                onClick={() => handlePlaceClick(place)}
                className={`bg-white rounded-xl p-2 flex gap-3 cursor-pointer border transition-all ${
                  activePlaceId === place.id 
                    ? "border-orange-500 shadow-md ring-1 ring-orange-500" 
                    : "border-gray-100 shadow-sm hover:border-orange-300"
                }`}
              >
                {/* صورة المعلم (على اليمين) */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image src={place.image_url || FALLBACK_IMAGE} alt={place.name} fill className="object-cover" />
                  <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                    {place.category}
                  </div>
                </div>
                
                {/* التفاصيل (على اليسار) */}
                <div className="flex flex-col flex-1 justify-between py-0.5">
                  <div>
                    <h4 className="font-black text-sm text-gray-900 line-clamp-1">{place.name}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{place.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-orange-400 fill-orange-400" />
                      <span className="text-[10px] font-bold">{place.rating || "4.5"}</span>
                    </div>
                    
                    {/* زر التوجيه الأنيق */}
                    <a 
                      href={place.lat && place.lng ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white p-1.5 rounded-lg transition-colors flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={12} />
                      <span className="text-[9px] font-bold px-1">مسار</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* الخريطة الذكية (الواجهة الأساسية) */}
      {/* في الهاتف: الارتفاع 50% وتكون بالأعلى / في الحاسوب: تأخذ باقي الشاشة وتكون باليسار */}
      <section className="flex-1 h-[50dvh] md:h-full relative z-0 order-1 md:order-2 bg-[#e5e5e5]">
        <ElOuedMap center={mapCenter} places={filteredPlaces} />
        
        {/* شارة عائمة فوق الخريطة */}
        <div className="absolute top-4 left-4 z-[400]">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-100 text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
            <MapPin size={12} className="text-orange-500" />
            خريطة الوادي
          </div>
        </div>
      </section>

    </main>
  );
}
