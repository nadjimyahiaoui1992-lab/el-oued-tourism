"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Star, Navigation, Filter, Compass, ArrowRight, Image as ImageIcon } from "lucide-react";

const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#f8f9fa]"><span className="text-gray-400 text-xs font-bold">جاري تحميل الخريطة...</span></div>
  ),
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";
const CATEGORIES = ["الكل", "طبيعة", "مغامرات", "تاريخ وثقافة", "أسواق", "الفنادق", "المرافق الصحية"];

// صور تجريبية لمعرض الصور (ألبوم الصور) في حال لم يكن للمعلم صور إضافية في قاعدة البيانات
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
  
  // الحالة المسؤولة عن عرض التفاصيل الكاملة للمعلم المختار
  const [selectedPlace, setSelectedPlace] = useState(null);

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

  // دالة النقر على معلم (من القائمة أو من دبوس الخريطة)
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
  };

  // دالة العودة للقائمة
  const handleBackToList = () => {
    setSelectedPlace(null);
  };

  return (
    <main dir="rtl" className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* القائمة الجانبية الذكية */}
      <aside className="w-full md:w-[380px] h-[50dvh] md:h-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.05)] z-10 flex flex-col shrink-0 order-2 md:order-1 relative transition-all duration-300">
        
        {/* مقبض الهواتف */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* عرض تفاصيل المعلم (إذا تم اختياره) */}
        {selectedPlace ? (
          <div className="flex flex-col h-full bg-white animate-in slide-in-from-left duration-300">
            {/* زر الرجوع */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10">
              <button 
                onClick={handleBackToList}
                className="p-2 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-full transition-colors"
              >
                <ArrowRight size={20} />
              </button>
              <h2 className="font-black text-lg text-gray-900 truncate">تفاصيل المعلم</h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-6">
              {/* الصورة الرئيسية */}
              <div className="w-full h-48 relative bg-gray-100">
                <Image src={selectedPlace.image_url || FALLBACK_IMAGE} alt={selectedPlace.name} fill className="object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Star size={12} className="text-orange-500 fill-orange-500" /> {selectedPlace.rating || "4.5"}
                </div>
              </div>

              <div className="p-4 space-y-5">
                {/* العناوين والتصنيف */}
                <div>
                  <div className="inline-block bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded mb-2">
                    {selectedPlace.category}
                  </div>
                  <h1 className="text-2xl font-black text-gray-900">{selectedPlace.name}</h1>
                </div>

                {/* ألبوم الصور (Gallery) */}
                <div>
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5 mb-2">
                    <ImageIcon size={16} className="text-orange-500" /> ألبوم الصور
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {DUMMY_GALLERY.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <Image src={img} alt={`صورة ${idx}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* النبذة / الوصف الكامل */}
                <div>
                  <h3 className="font-bold text-sm text-gray-800 mb-2">نبذة عن المكان</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedPlace.description || "لا يوجد وصف مفصل لهذا المعلم حالياً."}
                  </p>
                </div>
              </div>
            </div>

            {/* زر الاتجاهات (ثابت في الأسفل) */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <a 
                href={selectedPlace.lat && selectedPlace.lng ? `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${
                  selectedPlace.lat && selectedPlace.lng ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <Navigation size={18} /> 
                {selectedPlace.lat && selectedPlace.lng ? "الحصول على الاتجاهات (Google Maps)" : "إحداثيات الموقع غير متوفرة"}
              </a>
            </div>
          </div>
        ) : (
          /* عرض القائمة الرئيسية (البحث والتصنيفات والبطاقات المصغرة) */
          <div className="flex flex-col h-full animate-in fade-in duration-300">
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

              <div className="bg-gray-50 rounded-xl p-1 flex items-center border border-gray-200 focus-within:border-orange-500 transition-all">
                <div className="text-gray-400 p-2 shrink-0"><Search size={18} /></div>
                <input
                  type="text"
                  placeholder="ابحث عن وجهتك..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-1 text-sm font-bold placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="py-2 px-3 border-b border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <Filter className="text-gray-400 shrink-0 ml-1" size={16} />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeCategory === cat ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-transparent text-gray-500 border border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f9fa]">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-8"><p className="text-gray-400 font-bold text-xs">لا توجد معالم تطابق بحثك</p></div>
              ) : (
                filteredPlaces.map((place) => (
                  <div 
                    key={place.id} 
                    onClick={() => handlePlaceSelect(place)}
                    className="bg-white rounded-xl p-2 flex gap-3 cursor-pointer border border-gray-100 shadow-sm hover:border-orange-300 transition-all"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image src={place.image_url || FALLBACK_IMAGE} alt={place.name} fill className="object-cover" />
                      <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                        {place.category}
                      </div>
                    </div>
                    
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
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      {/* الخريطة الذكية */}
      <section className="flex-1 h-[50dvh] md:h-full relative z-0 order-1 md:order-2 bg-[#e5e5e5]">
        {/* نمرر دالة handlePlaceSelect ليتم تفعيلها عند النقر على الدبوس في الخريطة */}
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={handlePlaceSelect} />
      </section>

    </main>
  );
}
