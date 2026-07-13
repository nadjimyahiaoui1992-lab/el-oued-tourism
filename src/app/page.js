"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
// استيراد جميع الأيقونات المطلوبة
import { 
  Search, MapPin, Sparkles, Navigation, X, Star, TreePalm, 
  Landmark, Tent, ShoppingBag, BedDouble, Stethoscope, Utensils, FerrisWheel 
} from "lucide-react";

// استدعاء الخريطة ديناميكياً
const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 animate-pulse">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
      <span className="text-emerald-600 font-medium text-xs">جاري تجهيز الخريطة...</span>
    </div>
  ) 
});

// مصفوفة الأصناف منظمة واحترافية
const CATEGORIES = [
  { name: "الكل", icon: Sparkles, color: "text-gray-600" },
  { name: "طبيعة", icon: TreePalm, color: "text-emerald-500" },
  { name: "تاريخ وثقافة", icon: Landmark, color: "text-amber-600" },
  { name: "مغامرات", icon: Tent, color: "text-purple-500" },
  { name: "أسواق", icon: ShoppingBag, color: "text-blue-500" },
  { name: "الفنادق والمنتجعات", icon: BedDouble, color: "text-yellow-600" },
  { name: "المرافق الصحية", icon: Stethoscope, color: "text-red-500" },
  { name: "المطاعم", icon: Utensils, color: "text-orange-500" },
  { name: "فضاء التسلية", icon: FerrisWheel, color: "text-pink-500" },
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
      {/* القائمة الجانبية (الأداء والتصميم) */}
      <section className="bg-white z-20 w-full h-[45vh] md:h-screen md:w-[420px] lg:w-[480px] shrink-0 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] rounded-t-[2rem] md:rounded-none order-2 md:order-1 relative">
        
        {/* رأس البطاقة والبحث */}
        <div className="hidden md:block p-6 pb-2 border-b border-gray-50">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 mb-5 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden">
             <h1 className="font-black text-2xl mb-2 flex items-center gap-2"> اكتشف سوف </h1>
             <p className="text-emerald-50 text-sm opacity-95">دليلك السياحي الشامل لولاية الوادي.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex items-center border border-gray-200">
            <input 
              type="text" placeholder="ابحث عن معالم..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 px-3 text-sm" 
            />
            <Search size={20} className="text-emerald-600" />
          </div>
        </div>

        {/* أزرار الفلترة الاحترافية */}
        <div className="hidden md:flex gap-2 overflow-x-auto px-6 py-4 border-b border-gray-50 shrink-0" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeCategory === cat.name ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>
              <cat.icon size={14} /> {cat.name}
            </button>
          ))}
        </div>

        {/* قائمة المعالم - متبقية من كودك الأصلي */}
        <div className="flex-1 overflow-y-auto p-5 pt-3">
          {filteredPlaces.map((p) => (
             <div key={p.id} onClick={() => handleSelectPlace(p)} className="mb-4 bg-white rounded-2xl border p-3 flex items-center cursor-pointer hover:border-emerald-400 transition-all">
                <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden relative">
                   <Image src={p.image_url || FALLBACK_IMAGE} alt={p.name} fill className="object-cover" />
                </div>
                <div className="mr-4">
                  <h3 className="font-bold text-sm text-gray-900">{p.name}</h3>
                  <p className="text-[10px] text-gray-400">{p.category}</p>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* قسم الخريطة */}
      <section className="flex-1 h-[55vh] md:h-screen order-1 md:order-2 bg-gray-200">
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={handleSelectPlace} />
      </section>
      
      {/* (بقية كود الـ AnimatePresence للتفاصيل يبقى كما هو في مشروعك) */}
    </main>
  );
}