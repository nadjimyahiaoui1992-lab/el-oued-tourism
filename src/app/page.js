"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Star, Navigation, Filter, Compass, ArrowRight, Image as ImageIcon } from "lucide-react";

// استدعاء الخريطة
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-50">جاري تحميل الخريطة...</div>,
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";
const CATEGORIES = ["الكل", "طبيعة", "مغامرات", "تاريخ وثقافة", "أسواق", "الفنادق", "المرافق الصحية"];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("places").select("*");
      if (data) setPlaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    if (place.lat && place.lng) setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
  };

  return (
    <main dir="rtl" className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-white font-sans">
      
      {/* اللوحة الجانبية مع التمدد الذكي */}
      <aside className={`w-full md:w-[380px] ${selectedPlace ? 'h-[65dvh]' : 'h-[45dvh]'} md:h-full bg-white shadow-2xl z-10 flex flex-col order-2 md:order-1 relative rounded-t-3xl md:rounded-none -mt-4 md:mt-0 transition-all duration-500`}>
        
        {selectedPlace ? (
          <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-10">
            {/* الغلاف */}
            <div className="relative w-full h-40 shrink-0">
              <Image src={selectedPlace.image_url || FALLBACK_IMAGE} alt={selectedPlace.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <button onClick={() => setSelectedPlace(null)} className="absolute top-3 right-3 p-2 bg-white/30 backdrop-blur rounded-full text-white"><ArrowRight size={20}/></button>
              <div className="absolute bottom-4 right-4 text-white">
                <h1 className="text-xl font-black">{selectedPlace.name}</h1>
              </div>
            </div>

            {/* المحتوى */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPlace.description || "لا يوجد وصف."}</p>
            </div>

            {/* تفعيل زر الاتجاهات */}
            <div className="p-4 border-t">
              {selectedPlace.lat && selectedPlace.lng ? (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all"
                >
                  <Navigation size={18} /> الحصول على الاتجاهات
                </a>
              ) : (
                <button disabled className="w-full py-3 rounded-xl font-bold text-gray-400 bg-gray-100 cursor-not-allowed">
                  إحداثيات الموقع غير متوفرة
                </button>
              )}
            </div>
          </div>
        ) : (
          /* القائمة الرئيسية */
          <div className="flex flex-col h-full p-4">
            <h1 className="font-black text-xl mb-4">اكتشف سوف</h1>
            <input 
              className="w-full p-3 rounded-xl bg-gray-100 mb-4 outline-none" 
              placeholder="ابحث عن وجهتك..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredPlaces.map((place) => (
                <div key={place.id} onClick={() => handlePlaceSelect(place)} className="p-3 border rounded-xl cursor-pointer hover:border-orange-500">
                  <h4 className="font-bold">{place.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* الخريطة */}
      <section className="flex-1 h-[50dvh] md:h-full relative order-1 md:order-2">
        <ElOuedMap center={mapCenter} places={filteredPlaces} onMarkerClick={handlePlaceSelect} />
      </section>
    </main>
  );
}
