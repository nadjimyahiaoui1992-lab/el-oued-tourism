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
      <section className="bg-white z-20 w-full h-[45vh] md:h-screen md:w-[420px] lg:w-[480px] shrink-0 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] rounded-t-[2rem] md:rounded-none order-2 md:order-1 relative">
        
        {/* === بطاقة الترحيب والبحث (للحاسوب فقط) === */}
        <div className="hidden md:block p-6 pb-2 border-b border-gray-50">
          
          {/* البطاقة الترحيبية الاحترافية */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 mb-5 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden">
            {/* أيقونة خلفية شفافة لجمالية التصميم */}
            <div className="absolute -top-8 -left-8 opacity-10 rotate-12 pointer-events-none">
              <TreePalm size={140} />
            </div>
            
            <div className="relative z-10">
              <h1 className="font-black text-2xl mb-2 flex items-center gap-2">
                <Sparkles size={24} className="text-amber-400" /> اكتشف سوف
              </h1>
              <p className="text-emerald-50 text-sm leading-relaxed opacity-95">
                مرحباً بك في مدينة الألف قبة! دليلك السياحي الذكي لاكتشاف أجمل الواحات الذهبية، المعالم التاريخية العريقة، والأسواق المحلية النابضة بالحياة.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex items-center w-full border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white transition-all shadow-sm">
            <input 
              type="text" 
              placeholder="ابحث عن معالم، غيطان، أسواق..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 px-3 text-sm font-medium text-gray-700 placeholder-gray-400" 
            />
            <Search size={20} className="text-emerald-600 ml-1" />
          </div>
        </div>

        {/* أزرار الفلترة (للحاسوب فقط) */}
        <div className="hidden md:flex gap-2 overflow-x-auto px-6 py-4 border-b border-gray-50 shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button onClick={() => setActiveCategory("الكل")} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === "الكل" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeCategory === cat.name ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <cat.icon size={14} /> {cat.name}
            </button>
          ))}
        </div>

        {/* عنوان وتفاصيل الهاتف */}
        <div className="md:hidden flex flex-col p-5 pb-3 shrink-0 border-b border-gray-50">
          <div className="flex justify-between items-center mb-1">
            <h1 className="font-black text-lg text-emerald-600 flex items-center gap-1">
              <Sparkles size={16} className="text-amber-500" /> اكتشف سوف
            </h1>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold">
              {filteredPlaces.length} معلم سياحي
            </span>
          </div>
          <p className="text-[10px] text-gray-500">اكتشف جمال مدينة الألف قبة بذكاء.</p>
        </div>

        {/* قائمة بطاقات المعالم */}
        <div className="flex-1 overflow-y-auto overflow-x-auto md:overflow-x-hidden p-5 pt-3 md:pt-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isLoading ? (
            <div className="flex md:flex-col gap-4">
              <div className="min-w-[140px] md:min-w-full h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
              <div className="hidden md:block min-w-full h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
              <Search size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-500">لا توجد معالم مطابقة لخياراتك.</p>
            </div>
          ) : (
            <div className="flex flex-row md:flex-col gap-3 md:gap-4 pb-4">
              {filteredPlaces.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => handleSelectPlace(p)}
                  className="min-w-[140px] max-w-[140px] md:min-w-full md:max-w-full bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:border-emerald-400 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:h-32 group"
                >
                  <div className="relative h-24 w-full md:h-full md:w-36 bg-gray-200 shrink-0 overflow-hidden">
                    <Image src={p.image_url || FALLBACK_IMAGE} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 140px, 144px" />
                  </div>
                  <div className="p-2.5 md:p-4 flex flex-col justify-center flex-1">
                    <h3 className="font-bold text-[11px] md:text-sm text-gray-900 line-clamp-2 md:line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">{p.name}</h3>
                    <p className="text-[9px] md:text-[11px] text-gray-500 line-clamp-2 hidden md:block mb-2">
                      {p.description}
                    </p>
                    <p className="text-[9px] md:text-xs text-gray-400 flex items-center gap-1 mt-auto">
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
      <section className="flex-1 relative z-10 h-[55vh] md:h-screen order-1 md:order-2 bg-gray-200">
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={handleSelectPlace} />

        {/* شريط البحث (يظهر في الهاتف فقط فوق الخريطة) */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-full p-2 flex items-center shadow-lg border border-gray-100">
          <input 
            type="text" 
            placeholder="أين تريد الذهاب اليوم؟" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 px-3 text-xs font-medium text-gray-700" 
          />
          <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <Search size={14} />
          </div>
        </div>

        {/* أزرار الفلترة (تظهر في الهاتف فقط فوق الخريطة) */}
        <div className="md:hidden absolute top-16 left-0 right-0 z-20 flex gap-2 overflow-x-auto px-4 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button onClick={() => setActiveCategory("الكل")} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-all ${activeCategory === "الكل" ? "bg-emerald-600 text-white" : "bg-white text-gray-700"}`}>الكل</button>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md flex items-center gap-1 transition-all ${activeCategory === cat.name ? "bg-emerald-600 text-white" : "bg-white text-gray-700"}`}>
              <cat.icon size={12} className={activeCategory === cat.name ? "text-white" : cat.color} /> {cat.name}
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
            className="absolute bottom-0 left-0 right-0 md:right-0 md:left-auto md:w-[420px] lg:w-[480px] md:h-screen md:rounded-none z-50 bg-white rounded-t-[2.5rem] p-5 md:p-8 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] md:shadow-2xl border-t md:border-l border-gray-100 flex flex-col"
          >
            <button 
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border border-gray-100 hover:bg-gray-100 text-gray-700 p-2.5 rounded-full transition-colors z-10 shadow-sm"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col md:flex-col gap-4 mt-2">
              <div className="relative w-full h-36 md:h-56 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-inner">
                <Image src={selectedPlace.image_url || FALLBACK_IMAGE} alt={selectedPlace.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 480px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4 flex justify-between items-end">
                   <span className="text-xs font-bold text-white bg-emerald-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      {selectedPlace.category}
                   </span>
                   <div className="flex items-center gap-1 text-sm bg-black/40 backdrop-blur-md text-amber-400 font-bold px-3 py-1.5 rounded-full">
                      <Star size={14} fill="currentColor" /> {selectedPlace.rating || 4.7}
                   </div>
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1 mt-1">
                <div>
                  <h3 className="font-black text-xl md:text-2xl text-gray-900 leading-tight mb-2">{selectedPlace.name}</h3>
                </div>
              </div>
            </div>

            <div className="mt-2 md:mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" /> نبذة عن المعلم
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto pr-1">
                {selectedPlace.description}
              </p>
              
              {/* معلومات الاتصال إن وجدت */}
              {selectedPlace.contact_info && (
                <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 block mb-1">معلومات إضافية:</span>
                  <p className="text-xs text-gray-700 font-medium">{selectedPlace.contact_info}</p>
                </div>
              )}
            </div>

            {selectedPlace.lat && selectedPlace.lng && (
              <div className="mt-auto pt-4 md:pt-6 border-t border-gray-50">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.98]"
                >
                  <Navigation size={18} />
                  بدء التوجيه في Google Maps
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}