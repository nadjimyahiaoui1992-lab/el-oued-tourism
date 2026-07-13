"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Sparkles, Navigation, X, Star, TreePalm, Landmark, Tent, ShoppingBag } from "lucide-react";

// استدعاء الخريطة ديناميكياً
const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 animate-pulse">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
      <span className="text-emerald-600 font-medium text-xs">جاري تجهيز الخريطة التفاعلية...</span>
    </div>
  ) 
});

const CATEGORIES = [
  { name: "طبيعة", icon: TreePalm, color: "text-emerald-500" },
  { name: "تاريخ وثقافة", icon: Landmark, color: "text-amber-600" },
  { name: "مغامرات", icon: Tent, color: "text-purple-500" },
  { name: "أسواق", icon: ShoppingBag, color: "text-blue-500" },
];

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('places').select('*').limit(50);
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
    return places.filter(p => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
  };

  return (
    <main dir="rtl" className="flex flex-col md:flex-row h-screen w-full bg-[#f8fafc] text-gray-800 font-sans overflow-hidden">
      
      {/* =======================
          1. القائمة الجانبية (يمين في الحاسوب، أسفل في الهاتف)
          ======================= */}
      <section className="bg-white z-20 w-full h-[40vh] md:h-screen md:w-[400px] lg:w-[450px] shrink-0 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] rounded-t-[2rem] md:rounded-none order-2 md:order-1 relative">
        
        {/* رأس القائمة والبحث (للحاسوب فقط) */}
        <div className="hidden md:block p-6 pb-2">
          <h1 className="font-black text-2xl text-emerald-600 mb-5 flex items-center gap-2">
            <Sparkles size={22} /> عين الوادي
          </h1>
          <div className="bg-gray-100 rounded-xl p-2.5 flex items-center w-full border border-gray-200 focus-within:border-emerald-400 transition-colors">
            <input 
              type="text" 
              placeholder="ابحث عن معالم، غيطان..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 px-3 text-sm font-medium text-gray-700 placeholder-gray-400" 
            />
            <Search size={18} className="text-gray-400 ml-2" />
          </div>
        </div>

        {/* أزرار الفلترة (للحاسوب فقط) */}
        <div className="hidden md:flex gap-2 overflow-x-auto px-6 py-4 border-b border-gray-50 shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button onClick={() => setActiveCategory("الكل")} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === "الكل" ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${activeCategory === cat.name ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <cat.icon size={12} /> {cat.name}
            </button>
          ))}
        </div>

        {/* عنوان الهاتف */}
        <div className="md:hidden flex justify-between items-center p-5 pb-2 shrink-0">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <Sparkles size={16} className="text-amber-500" /> معالم ولاية الوادي القريبة
          </h2>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
            {filteredPlaces.length} معلم
          </span>
        </div>

        {/* قائمة بطاقات المعالم */}
        <div className="flex-1 overflow-y-auto overflow-x-auto md:overflow-x-hidden p-5 pt-0 md:pt-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isLoading ? (
            <div className="flex md:flex-col gap-4">
              <div className="min-w-[140px] md:min-w-full h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">لا توجد معالم مطابقة لخياراتك.</p>
          ) : (
            <div className="flex flex-row md:flex-col gap-3 md:gap-4 pb-4">
              {filteredPlaces.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => handleSelectPlace(p)}
                  className="min-w-[140px] max-w-[140px] md:min-w-full md:max-w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:border-emerald-300 transition-all shadow-sm flex flex-col md:flex-row md:h-28 group"
                >
                  <div className="relative h-24 w-full md:h-full md:w-32 bg-gray-200 shrink-0">
                    <Image src={p.image_url || FALLBACK_IMAGE} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 140px, 128px" />
                  </div>
                  <div className="p-2 md:p-4 flex flex-col justify-center flex-1">
                    <h3 className="font-bold text-[11px] md:text-sm text-gray-800 line-clamp-1">{p.name}</h3>
                    <p className="text-[9px] md:text-xs text-gray-400 flex items-center gap-1 mt-1 md:mt-2">
                      <MapPin size={10} className="text-emerald-500" /> {p.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =======================
          2. قسم الخريطة التفاعلية
          ======================= */}
      <section className="flex-1 relative z-10 h-[60vh] md:h-screen order-1 md:order-2 bg-gray-200">
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={handleSelectPlace} />

        {/* شريط البحث (يظهر في الهاتف فقط فوق الخريطة) */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-full p-1.5 flex items-center shadow-lg border border-gray-100">
          <input 
            type="text" 
            placeholder="ابحث عن معالم..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 px-4 text-xs font-medium text-gray-700" 
          />
          <Search size={18} className="text-gray-400 ml-2" />
        </div>

        {/* أزرار الفلترة (تظهر في الهاتف فقط فوق الخريطة) */}
        <div className="md:hidden absolute top-16 left-0 right-0 z-20 flex gap-2 overflow-x-auto px-4 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button onClick={() => setActiveCategory("الكل")} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${activeCategory === "الكل" ? "bg-emerald-600 text-white" : "bg-white text-gray-600"}`}>الكل</button>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 transition-all ${activeCategory === cat.name ? "bg-emerald-600 text-white" : "bg-white text-gray-600"}`}>
              <cat.icon size={12} /> {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* =======================
          3. بطاقة تفاصيل المعلم (تظهر عند الضغط)
          ======================= */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 md:right-0 md:left-auto md:w-[400px] lg:w-[450px] md:h-screen md:rounded-none z-50 bg-white rounded-t-[2.5rem] p-5 md:p-8 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] md:shadow-2xl border-t md:border-l border-gray-100 flex flex-col"
          >
            <button 
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col md:flex-col gap-4 mt-2">
              <div className="relative w-full h-32 md:h-48 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                <Image src={selectedPlace.image_url || FALLBACK_IMAGE} alt={selectedPlace.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-max block mb-2">
                    {selectedPlace.category}
                  </span>
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 leading-tight">{selectedPlace.name}</h3>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-amber-500 font-bold mt-1.5">
                    <Star size={14} fill="currentColor" /> {selectedPlace.rating || 4.7}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              <h4 className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">معلومات وتفاصيل:</h4>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
                {selectedPlace.description}
              </p>
            </div>

            {selectedPlace.lat && selectedPlace.lng && (
              <div className="mt-auto pt-4 md:pt-6 border-t border-gray-50">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Navigation size={18} />
                  عرض خط السير في Google Maps
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}