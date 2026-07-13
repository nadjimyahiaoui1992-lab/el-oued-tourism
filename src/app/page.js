"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Sparkles, Navigation, X, Star, TreePalm, Landmark, Tent, ShoppingBag } from "lucide-react";

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
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans md:max-w-md md:mx-auto md:shadow-2xl relative overflow-hidden flex flex-col h-screen">
      
      <section className="relative w-full flex-1 bg-gray-200 z-10">
        <ElOuedMap 
          center={mapCenter} 
          places={filteredPlaces} 
          onMarkerClick={handleSelectPlace} 
        />

        <div className="absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-full p-1.5 flex items-center shadow-lg border border-gray-100">
          <input 
            type="text" 
            placeholder="ابحث عن معالم، مساجد، غيطان..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 px-4 text-xs font-medium text-gray-700 placeholder-gray-400"
          />
          <Search size={18} className="text-gray-400 ml-2" />
        </div>

        <div className="absolute top-16 left-0 right-0 z-20 flex gap-2 overflow-x-auto px-4 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button 
            onClick={() => setActiveCategory("الكل")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${
              activeCategory === "الكل" ? "bg-emerald-600 text-white" : "bg-white text-gray-600"
            }`}
          >
            الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1 transition-all ${
                activeCategory === cat.name ? "bg-emerald-600 text-white" : "bg-white text-gray-600"
              }`}
            >
              <cat.icon size={12} />
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] p-5 z-20 min-h-[38vh] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Sparkles size={16} className="text-amber-500" /> معالم ولاية الوادي القريبة
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {filteredPlaces.length} معلم
            </span>
          </div>

          {isLoading ? (
            <div className="flex gap-4">
              <div className="w-36 h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
              <div className="w-36 h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">لا توجد معالم مطابقة لخياراتك حالياً.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredPlaces.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => handleSelectPlace(p)}
                  className="min-w-[140px] max-w-[140px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:border-emerald-300 transition-all shadow-sm"
                >
                  <div className="relative h-24 w-full bg-gray-200">
                    <Image src={p.image_url || FALLBACK_IMAGE} alt={p.name} fill className="object-cover" sizes="140px" />
                  </div>
                  <div className="p-2">
                    <h3 className="font-bold text-[11px] text-gray-800 truncate">{p.name}</h3>
                    <p className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-1">
                      <MapPin size={9} className="text-emerald-500" /> {p.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-[9px] text-gray-400 text-center mt-2">اضغط على المعلم لعرض تفاصيل الطريق</p>
      </section>

      <AnimatePresence>
        {selectedPlace && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] p-5 z-50 md:max-w-md md:mx-auto border-t border-gray-100"
          >
            <button 
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex gap-4 mt-3">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                <Image 
                  src={selectedPlace.image_url || FALLBACK_IMAGE} 
                  alt={selectedPlace.name} 
                  fill 
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-max block mb-1">
                    {selectedPlace.category}
                  </span>
                  <h3 className="font-bold text-base text-gray-900 leading-tight">{selectedPlace.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                    <Star size={12} fill="currentColor" /> {selectedPlace.rating || 4.7}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-0.5">حول المعلم:</h4>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                {selectedPlace.description}
              </p>
            </div>

            {selectedPlace.lat && selectedPlace.lng && (
              <div className="mt-4 pt-2 border-t border-gray-50">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=$${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Navigation size={14} />
                  فتح خط السير في خرائط Google (GPS)
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}