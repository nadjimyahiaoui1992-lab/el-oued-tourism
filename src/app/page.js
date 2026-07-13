"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Sparkles, Navigation, X, Star, TreePalm, 
  Landmark, Tent, ShoppingBag, BedDouble, Stethoscope, Utensils, FerrisWheel 
} from "lucide-react";

const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { 
  ssr: false, 
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 animate-pulse">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
      <span className="text-emerald-600 font-medium text-xs">جاري تجهيز الخريطة...</span>
    </div>
  ) 
});

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
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    return places.filter(p => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  return (
    <main dir="rtl" className="flex flex-col md:flex-row h-screen w-full bg-[#f8fafc] text-gray-800 font-sans overflow-hidden">
      
      {/* القائمة الجانبية */}
      <section className="bg-white z-20 w-full h-[50vh] md:h-screen md:w-[420px] shrink-0 flex flex-col shadow-xl rounded-t-[2rem] md:rounded-none order-2 md:order-1 relative">
        
        {/* هيدر ترحيبي */}
        <div className="p-6 border-b border-gray-100">
          <div className="bg-emerald-800 rounded-2xl p-4 text-white mb-4">
            <h1 className="font-black text-xl">اكتشف سوف</h1>
            <p className="text-xs opacity-80 mt-1">دليلك السياحي الشامل لولاية الوادي</p>
          </div>
          <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center">
            <input 
              placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full outline-none text-sm mr-2"
            />
            <Search size={16} className="text-gray-400" />
          </div>
        </div>

        {/* شبكة التصنيفات الجديدة */}
        <div className="px-6 py-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.name} 
                onClick={() => setActiveCategory(cat.name)}
                className={`p-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  activeCategory === cat.name ? "bg-emerald-600 text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <cat.icon size={18} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* قائمة المعالم */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filteredPlaces.map((p) => (
            <div key={p.id} onClick={() => setSelectedPlace(p)} className="flex items-center gap-3 p-2 mb-2 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-emerald-300">
               <Image src={p.image_url || FALLBACK_IMAGE} alt={p.name} width={50} height={50} className="rounded-lg object-cover" />
               <div className="text-xs font-bold text-gray-800">{p.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة */}
      <section className="flex-1 h-[50vh] md:h-screen bg-gray-200">
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={setSelectedPlace} />
      </section>
    </main>
  );
}