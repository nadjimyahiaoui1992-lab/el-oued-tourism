"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  Sparkles,
  TreePalm,
  Landmark,
  Tent,
  ShoppingBag,
  BedDouble,
  Stethoscope,
  Utensils,
  FerrisWheel,
  Navigation,
  X,
  MapPin,
} from "lucide-react";

const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 animate-pulse">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2" />
      <span className="text-emerald-700 font-medium text-xs">
        جاري تجهيز الخريطة...
      </span>
    </div>
  ),
});

const CATEGORIES = [
  { name: "الكل", icon: Sparkles },
  { name: "مغامرات", icon: Tent },
  { name: "تاريخ وثقافة", icon: Landmark },
  { name: "طبيعة", icon: TreePalm },
  { name: "أسواق", icon: ShoppingBag },
  { name: "الفنادق والمنتجعات", icon: BedDouble },
  { name: "المطاعم", icon: Utensils },
  { name: "المرافق الصحية", icon: Stethoscope },
  { name: "فضاء التسلية", icon: FerrisWheel },
];

// التصنيفات المعروضة كشبكة أيقونات أسفل البانر الأخضر
const GRID_CATEGORIES = CATEGORIES.filter(
  (c) => !["الكل", "مغامرات", "تاريخ وثقافة", "طبيعة"].includes(c.name)
);

const DEFAULT_CENTER = [33.3615, 6.8525];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";

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
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .limit(100);

      if (error) throw error;

      if (data) {
        // تحويل latitude/longitude (أسماء الأعمدة في قاعدة البيانات)
        // إلى lat/lng (الأسماء اللي يستعملها الكومبونيت والخريطة)
        const mapped = data.map((p) => ({
          ...p,
          lat: p.lat ?? p.latitude,
          lng: p.lng ?? p.longitude,
        }));
        setPlaces(mapped);
      }
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
      const matchSearch = (p.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "الكل" || p.category === activeCategory;
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
    <main dir="rtl" className="flex flex-col min-h-screen w-full bg-gray-100 font-sans">
      {/* قسم الخريطة العلوي مع البحث وأزرار التصنيف العائمة */}
      <section className="relative h-[46vh] w-full shrink-0">
        <ElOuedMap
          center={mapCenter}
          places={filteredPlaces}
          onMarkerClick={handleSelectPlace}
        />

        <div className="absolute top-4 inset-x-4 z-[400] flex flex-col gap-3 pointer-events-none">
          <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-3 gap-3 pointer-events-auto">
            <button className="bg-emerald-600 text-white rounded-full p-2 shrink-0" aria-label="بحث">
              <Search size={18} />
            </button>
            <input
              type="text"
              placeholder="أين تريد الذهاب اليوم؟"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-gray-400"
            />
          </div>

          <div
            className="flex gap-2 overflow-x-auto pointer-events-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-md transition-all shrink-0 ${
                  activeCategory === cat.name
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                <cat.icon size={14} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* البانر الأخضر + شبكة التصنيفات */}
      <section className="bg-white rounded-t-3xl -mt-6 relative z-10 px-5 pt-6 pb-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white mb-5 shadow-lg shadow-emerald-900/20">
          <h1 className="font-black text-xl mb-1">اكتشف سوف</h1>
          <p className="text-emerald-50 text-sm opacity-90">
            دليلك السياحي الشامل لولاية الوادي
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {GRID_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-4 border transition-all ${
                activeCategory === cat.name
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : "bg-gray-50 border-gray-100 text-gray-600"
              }`}
            >
              <cat.icon size={22} />
              <span className="text-xs font-bold">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* بطاقات الاكتشاف الأفقية */}
      <section className="px-5 py-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
            {filteredPlaces.length} معلم سياحي
          </span>
          <h2 className="font-black text-emerald-700 flex items-center gap-1.5 text-base">
            اكتشف سوف <Sparkles size={16} />
          </h2>
        </div>
        <p className="text-gray-400 text-xs mb-4">
          اكتشف جمال مدينة الألف قبة بذكاء
        </p>

        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-40 h-32 rounded-2xl bg-gray-200 animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            ما لقيناش معالم تطابق البحث
          </div>
        ) : (
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredPlaces.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectPlace(p)}
                className="w-40 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer"
              >
                <div className="relative w-full h-24 bg-gray-200">
                  <Image
                    src={p.image_url || FALLBACK_IMAGE}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="p-2.5">
                  <h3 className="font-bold text-xs text-gray-900 truncate">
                    {p.name}
                  </h3>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {p.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* نافذة تفاصيل المعلم */}
      {selectedPlace && (
        <div
          className="fixed inset-0 z-[1000] bg-black/40 flex items-end md:items-center md:justify-center"
          onClick={() => setSelectedPlace(null)}
        >
          <div
            className="bg-white w-full md:w-[420px] rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPlace(null)}
              className="mb-4 p-2 bg-gray-100 rounded-full w-fit"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>

            <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-gray-200 mb-4">
              <Image
                src={selectedPlace.image_url || FALLBACK_IMAGE}
                alt={selectedPlace.name}
                fill
                className="object-cover"
              />
            </div>

            <h1 className="text-xl font-black mb-1 text-gray-900">
              {selectedPlace.name}
            </h1>
            <span className="text-xs text-emerald-600 font-bold">
              {selectedPlace.category}
            </span>
            <p className="text-gray-600 text-sm mt-3 mb-6 leading-relaxed">
              {selectedPlace.description}
            </p>

            {selectedPlace.lat && selectedPlace.lng && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                target="_blank"
                rel="noreferrer"
                className="p-4 bg-emerald-600 text-white rounded-xl font-bold text-center flex justify-center gap-2"
              >
                <Navigation size={18} /> بدء الاتجاهات
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
