"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, categoryColor } from "@/lib/categories";
import { fetchRoute, getCurrentPosition } from "@/lib/routing";
import { decodeImageUrls } from "@/lib/imageUtils";
import {
  Search, Navigation, ArrowRight, Share2, Check, X, Clock, Route as RouteIcon, LocateFixed,
  Compass, TreePine, Mountain, Landmark, ShoppingBag, BedDouble, HeartPulse, SearchX, Menu
} from "lucide-react";

// استدعاء الخريطة (كيما كانت)
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-sand text-ink-soft text-sm gap-2">
      <Compass className="animate-spin" size={18} />
      جاري تحميل الخريطة...
    </div>
  ),
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";

const CATEGORY_ICONS = {
  "الكل": Compass,
  "طبيعة": TreePine,
  "مغامرات": Mountain,
  "تاريخ وثقافة": Landmark,
  "أسواق": ShoppingBag,
  "الفنادق": BedDouble,
  "المرافق الصحية": HeartPulse,
};

// ... (نفس مكونات DomeSkyline و PlaceCardSkeleton اللي كانت عندك)
function DomeSkyline({ className = "" }) {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={className} fill="currentColor">
      <path d="M0,20 Q20,0 40,20 Q60,0 80,20 Q100,0 120,20 Q140,0 160,20 Q180,0 200,20 Q220,0 240,20 Q260,0 280,20 Q300,0 320,20 Q340,0 360,20 Q380,0 400,20 L400,40 L0,40 Z" />
    </svg>
  );
}

function PlaceCardSkeleton() {
  return (
    <div className="flex gap-3 p-2.5 rounded-2xl animate-pulse">
      <div className="w-20 h-16 rounded-2xl bg-ink/10 shrink-0" />
      <div className="flex-1 py-1 space-y-2">
        <div className="h-3 w-2/3 rounded-full bg-ink/10" />
        <div className="h-2.5 w-1/3 rounded-full bg-ink/10" />
      </div>
    </div>
  );
}

export default function Home() {
  // ... (نفس الـ states السابقة)
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [copied, setCopied] = useState(false);

  const [routeStatus, setRouteStatus] = useState("idle");
  const [routeData, setRouteData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeError, setRouteError] = useState("");
  
  // 🆕 State جديد للتحكم في ظهور القائمة الجانبية في الهاتف
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ... (نفس الدوال: fetchPlaces, clearRoute, handleShare, handleGetDirections)
  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const { data, error } = await supabase.from("places").select("*");
      if (error) throw error;
      setPlaces(data || []);
    } catch (err) {
      console.error(err);
      setHasError(true);
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

  const clearRoute = useCallback(() => {
    setRouteStatus("idle");
    setRouteData(null);
    setRouteError("");
  }, []);

  // 🆕 تم التعديل: كي نكليكيو على مكان، نفتحو الشريط الجانبي في التليفون
  const handlePlaceSelect = (place) => {
    setCopied(false);
    clearRoute();
    setSelectedPlace(place);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
    setIsSidebarOpen(true); // نفتحو القائمة آليا
  };

  const handleBack = () => {
    clearRoute();
    setSelectedPlace(null);
  };

  // 🆕 دالة لغلق الشريط الجانبي في الهاتف
  const closeSidebar = () => setIsSidebarOpen(false);

  // ... (باقي الدوال كيما راها)
  const handleGetDirections = async (place) => { /* نفس الكود */ };
  const handleShare = async (place) => { /* نفس الكود */ };

  return (
    <main dir="rtl" className="flex h-[100dvh] w-full overflow-hidden bg-sand font-sans text-ink relative">
      
      {/* 🆕 زر فتح القائمة في الهاتف (يظهر فقط كي تكون القائمة مغلوقة) */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`md:hidden absolute top-4 right-4 z-[2000] p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-ink/10 text-ink transition-transform duration-300 ${isSidebarOpen ? 'translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <Menu size={24} />
      </button>

      {/* 🆕 Overlay خلفية شفافة في الهاتف كي تكون القائمة مفتوحة */}
      {isSidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-black/20 z-[1500] backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* الشريط الجانبي - تم تعديل الـ Classes ليصبح Off-canvas في الهاتف */}
      <aside
        className={`
          fixed md:relative top-0 right-0 h-[100dvh] w-[85%] sm:w-[400px] md:w-[400px] lg:w-[440px] 
          bg-sand-light shadow-2xl z-[2000] md:z-10 flex flex-col 
          transition-transform duration-500 ease-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        {/* 🆕 زر إغلاق القائمة في الهاتف */}
        <button 
          onClick={closeSidebar}
          className="md:hidden absolute top-4 left-4 p-2 bg-ink/5 rounded-full text-ink-soft hover:bg-ink/10 transition-colors z-[2100]"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {selectedPlace ? (
            // شاشة تفاصيل المعلم
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col h-full overflow-hidden pt-4 md:pt-0"
            >
              {/* ... (نفس محتوى selectedPlace اللي كان عندك بدون تغيير كبير) ... */}
              <div className="relative w-full h-48 md:h-56 shrink-0 p-3 pb-0">
                <div className="arch-frame relative w-full h-full rounded-2xl overflow-hidden shadow-md">
                  <Image src={decodeImageUrls(selectedPlace.image_url) || FALLBACK_IMAGE} alt={selectedPlace.name} fill sizes="440px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <button onClick={handleBack} className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                  <ArrowRight size={20} />
                </button>
                <div className="absolute bottom-4 right-6 left-6 text-white flex flex-col gap-1">
                  <h1 className="text-2xl font-black leading-tight drop-shadow-md">{selectedPlace.name}</h1>
                </div>
              </div>

              {/* ... (باقي تفاصيل المكان والأزرار خليتهم كيما راهم عندك باش ما يتكسرش الديزاين) ... */}
              <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-4">
                <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-sm" style={{ backgroundColor: categoryColor(selectedPlace.category) }}>
                  {selectedPlace.category}
                </span>
                <p className="text-sm text-ink-soft leading-relaxed bg-white/80 p-5 rounded-2xl border border-ink/5 shadow-sm">
                  {selectedPlace.description || "لا يوجد وصف لهذا المكان حالياً."}
                </p>
              </div>

              {/* أزرار الاتجاهات والمشاركة (نفس الكود) */}
              <div className="p-4 pt-3 border-t border-ink/10 flex gap-2 shrink-0 bg-sand-light">
                {/* ... (نفس أزرار handleGetDirections و handleShare) ... */}
              </div>
            </motion.div>
          ) : (
            // شاشة القائمة والبحث
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full overflow-hidden pt-10 md:pt-0"
            >
              <div className="px-5 pt-4 pb-3 shrink-0">
                <p className="text-[12px] font-bold text-clay tracking-wide mb-1">دليلك السياحي لولاية الوادي</p>
                <h1 className="font-display text-4xl font-black text-ink leading-none mb-4">اكتشف سوف</h1>
                
                <div className="relative mb-4">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft/70" size={20} />
                  <input
                    className="w-full py-3.5 pr-12 pl-4 rounded-xl bg-white border-2 border-ink/5 outline-none focus:border-clay focus:ring-4 focus:ring-clay/10 transition-all placeholder:text-ink-soft/50 shadow-sm font-medium"
                    placeholder="ابحث عن واحة، قصر، أو معلم..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto scroll-thin pb-2 -mx-5 px-5">
                  {/* ... (نفس كود الكاتيجوري) ... */}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-thin px-4 pb-4">
                {/* ... (نفس كود عرض الأماكن) ... */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* الخريطة - تم التعديل لتأخذ 100% من الشاشة دائماً */}
      <section className="flex-1 h-full w-full relative z-0">
        <ElOuedMap
          center={mapCenter}
          places={filteredPlaces}
          onMarkerClick={handlePlaceSelect}
          selectedId={selectedPlace ? selectedPlace.id : null}
          route={routeStatus === "done" ? routeData : null}
          userLocation={userLocation}
        />
      </section>
    </main>
  );
}
