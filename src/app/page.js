"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Search, MapPin, X, Navigation, TreePalm, Landmark, Tent, ShoppingBag, BedDouble, Stethoscope, Utensils, FerrisWheel } from "lucide-react";

const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { ssr: false });

const CATEGORIES = [
  { name: "الكل", icon: TreePalm, color: "text-emerald-500" },
  { name: "طبيعة", icon: TreePalm, color: "text-emerald-500" },
  { name: "تاريخ وثقافة", icon: Landmark, color: "text-amber-600" },
  { name: "مغامرات", icon: Tent, color: "text-purple-500" },
  { name: "أسواق", icon: ShoppingBag, color: "text-blue-500" },
  { name: "الفنادق والمنتجعات", icon: BedDouble, color: "text-yellow-600" },
  { name: "المرافق الصحية", icon: Stethoscope, color: "text-red-500" },
  { name: "المطاعم", icon: Utensils, color: "text-orange-500" },
  { name: "فضاء التسلية", icon: FerrisWheel, color: "text-pink-500" },
];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => setPlaces(data || []));
  }, []);

  return (
    <main className="h-screen w-full flex flex-col md:flex-row relative">
      {/* قائمة المعالم */}
      <section className="w-full md:w-[400px] h-[30%] md:h-full bg-white z-20 overflow-y-auto">
        <div className="p-4 bg-emerald-800 text-white font-bold text-center">اكتشف سوف</div>
        {places.map(p => (
          <div key={p.id} onClick={() => setSelectedPlace(p)} className="p-4 border-b cursor-pointer hover:bg-gray-100">
            <h3 className="font-bold">{p.name}</h3>
          </div>
        ))}
      </section>

      {/* الخريطة (ربطنا الدبوس بـ setSelectedPlace) */}
      <section className="flex-1 h-[70%] md:h-full">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </section>

      {/* نافذة التفاصيل (التي لا تظهر) */}
      {selectedPlace && (
        <div className="absolute inset-0 z-50 bg-white p-6 flex flex-col gap-4">
          <button onClick={() => setSelectedPlace(null)} className="p-4 bg-gray-200 rounded-full w-fit"><X /></button>
          <h1 className="text-3xl font-black">{selectedPlace.name}</h1>
          <p>{selectedPlace.description}</p>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`} 
             target="_blank" className="p-4 bg-emerald-600 text-white text-center rounded-xl font-bold">
            بدء الاتجاهات
          </a>
        </div>
      )}
    </main>
  );
}