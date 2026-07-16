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

// استدعاء الخريطة
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
  
  // State للتحكم في ظهور القائمة الجانبية في الهاتف
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handlePlaceSelect = (place) => {
    setCopied(false);
    clearRoute();
    setSelectedPlace(place);
    if (place.lat && place.lng) {
      setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
    }
    setIsSidebarOpen(true);
  };

  const handleBack = () => {
    clearRoute();
    setSelectedPlace(null);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleGetDirections = async (place) => {
    if (!place.lat || !place.lng) return;
    setRouteError("");
    setRouteStatus("locating");
    try {
      const origin = await getCurrentPosition();
      setUserLocation(origin);
      setRouteStatus("routing");
      const destination = [parseFloat(place.lat), parseFloat(place.lng)];
      const result = await fetchRoute(origin, destination);
      setRouteData(result);
      setRouteStatus("done");
    } catch (err) {
      console.error(err);
      setRouteStatus("error");
      if (err && err.code === 1) {
        setRouteError("رفضت صلاحية الوصول لموقعك. فعّلها من إعدادات المتصفح للحصول على المسار.");
      } else {
        setRouteError("تعذّر رسم المسار حالياً. تحقق من اتصالك بالإنترنت وحاول من جديد.");
      }
    }
  };

  const handleShare = async (place) => {
    const mapsUrl =
      place.lat && place.lng
        ? "https://www.google.com/maps?q=" + place.lat + "," + place.lng
        : typeof window !== "undefined"
        ? window.location.href
        : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: place.name, text: place.description, url: mapsUrl });
        return;
      } catch (shareErr) {}
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(mapsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const directionsUrl = selectedPlace
    ? "https://www.google.com/maps/dir/?api=1&destination=" + selectedPlace.lat + "," + selectedPlace.lng
    : "";

  return (
    <main dir="rtl" className="flex h-[100dvh] w-full overflow-hidden bg-sand font-sans text-ink relative">
      
      {/* زر فتح القائمة في الهاتف */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`md:hidden absolute top-4 right-4 z-[2000] p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-ink/10 text-ink transition-transform duration-300 ${isSidebarOpen ? 'translate-x-20 opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <Menu size={24} />
      </button>

      {/* خلفية شفافة في الهاتف */}
      {isSidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-black/20 z-[1500] backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={`
          fixed md:relative top-0 right-0 h-[100dvh] w-[85%] sm:w-[400px] md:w-[400px] lg:w-[440px] 
          bg-sand-light shadow-2xl z-[2000] md:z-10 flex flex-col 
          transition-transform duration-500 ease-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        {/* زر إغلاق القائمة في الهاتف */}
        <button 
          onClick={closeSidebar}
          className="md:hidden absolute top-4 left-4 p-2 bg-ink/5 rounded-full text-ink-soft hover:bg-ink/10 transition-colors z-[2100]"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {selectedPlace ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col h-full overflow-hidden pt-4 md:pt-0"
            >
              <div className="relative w-full h-48 md:h-56 shrink-0 p-3 pb-0">
                <div className="arch-frame relative w-full h-full rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src={decodeImageUrls(selectedPlace.image_url) || FALLBACK_IMAGE}
                    alt={selectedPlace.name}
                    fill
                    sizes="440px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <button
                  onClick={handleBack}
                  aria-label="رجوع للقائمة"
                  className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                >
                  <ArrowRight size={20} />
                </button>
                <div className="absolute bottom-4 right-6 left-6 text-white flex flex-col gap-1">
                  <h1 className="text-2xl font-black leading-tight drop-shadow-md">
                    {selectedPlace.name}
                  </h1>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-4">
                <span
                  className="inline-block text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: categoryColor(selectedPlace.category) }}
                >
                  {selectedPlace.category}
                </span>
                <p className="text-sm text-ink-soft leading-relaxed bg-white/80 p-5 rounded-2xl border border-ink/5 shadow-sm">
                  {selectedPlace.description || "لا يوجد وصف لهذا المكان حالياً."}
                </p>
              </div>

              {routeStatus === "done" && routeData && (
                <div className="mx-4 mb-2 flex items-center justify-between gap-2 bg-clay/10 border border-clay/20 rounded-xl px-3.5 py-2.5 shrink-0">
                  <div className="flex items-center gap-3 text-clay">
                    <span className="flex items-center gap-1 text-sm font-black">
                      <RouteIcon size={15} /> {routeData.distanceKm.toFixed(1)} كم
                    </span>
                    <span className="flex items-center gap-1 text-sm font-black">
                      <Clock size={15} /> {Math.round(routeData.durationMin)} د
                    </span>
                  </div>
                  <button
                    onClick={clearRoute}
                    aria-label="إلغاء المسار"
                    className="p-1.5 rounded-full text-clay hover:bg-clay/15 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {routeStatus === "error" && (
                <div className="mx-4 mb-2 text-xs text-ink-soft bg-ink/5 rounded-xl px-3.5 py-2.5 shrink-0">
                  {routeError}
                </div>
              )}

              <div className="p-4 pt-3 border-t border-ink/10 flex gap-2 shrink-0 bg-sand-light">
                {selectedPlace.lat && selectedPlace.lng ? (
                  <button
                    onClick={() => handleGetDirections(selectedPlace)}
                    disabled={routeStatus === "locating" || routeStatus === "routing"}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-clay hover:bg-clay-dark disabled:opacity-70 transition-colors shadow-sm"
                  >
                    {routeStatus === "locating" ? (
                      <>
                        <LocateFixed size={18} className="animate-pulse" /> جاري تحديد موقعك...
                      </>
                    ) : routeStatus === "routing" ? (
                      <>
                        <RouteIcon size={18} className="animate-pulse" /> جاري رسم المسار...
                      </>
                    ) : routeStatus === "done" ? (
                      <>
                        <Navigation size={18} /> إعادة رسم المسار
                      </>
                    ) : (
                      <>
                        <Navigation size={18} /> الاتجاهات
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-3 rounded-xl font-bold text-ink-soft bg-ink/5 cursor-not-allowed"
                  >
                    الإحداثيات غير متوفرة
                  </button>
                )}
                <button
                  onClick={() => handleShare(selectedPlace)}
                  aria-label="مشاركة الموقع"
                  className="w-14 flex items-center justify-center rounded-xl font-bold text-clay border-2 border-clay/25 hover:bg-clay/10 transition-colors shadow-sm"
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>

              {routeStatus === "error" && selectedPlace.lat && selectedPlace.lng ? (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-ink-soft underline underline-offset-2 pb-3 -mt-1 shrink-0"
                >
                  أو افتح الاتجاهات في خرائط قوقل
                </a>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full overflow-hidden pt-10 md:pt-0"
            >
              <div className="px-5 pt-4 pb-3 shrink-0">
                <p className="text-[12px] font-bold text-clay tracking-wide mb-1">
                  دليلك السياحي لولاية الوادي
                </p>
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
                  {CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.id] || Compass;
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={
                          "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all " +
                          (active
                            ? "text-white border-transparent shadow-md"
                            : "text-ink-soft bg-white border-ink/10 hover:border-clay/40")
                        }
                        style={active ? { backgroundColor: cat.color } : undefined}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-thin px-4 pb-4">
                {isLoading ? (
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <PlaceCardSkeleton key={i} />
                    ))}
                  </div>
                ) : hasError ? (
                  <div className="flex flex-col items-center text-center gap-2 py-12 px-4 text-ink-soft">
                    <SearchX size={28} />
                    <p className="text-sm font-bold">تعذّر تحميل الأماكن</p>
                    <button
                      onClick={fetchPlaces}
                      className="text-xs font-bold text-clay underline underline-offset-2 mt-1"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-2 py-12 px-4 text-ink-soft">
                    <SearchX size={28} />
                    <p className="text-sm font-bold">لم نعثر على نتائج</p>
                    <p className="text-xs">جرّب كلمة بحث أخرى أو صنفاً مختلفاً</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPlaces.map((place, i) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
                        onClick={() => handlePlaceSelect(place)}
                        className="flex gap-3 p-2.5 rounded-2xl cursor-pointer hover:bg-white transition-colors group"
                      >
                        <div className="arch-frame-sm relative w-20 h-16 shrink-0 bg-sand">
                          <Image
                            src={decodeImageUrls(place.image_url) || FALLBACK_IMAGE}
                            alt={place.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <h4 className="font-bold text-sm text-ink truncate group-hover:text-clay transition-colors">
                            {place.name}
                          </h4>
                          <span
                            className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: categoryColor(place.category) }}
                          >
                            {place.category}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* الخريطة */}
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
