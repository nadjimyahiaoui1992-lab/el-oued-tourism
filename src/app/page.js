"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Search, MapPin, Sparkles } from "lucide-react";

// استدعاء الخريطة من المسار المعتاد
const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { 
  ssr: false 
});

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => {
      if (data) setPlaces(data);
    });
  }, []);

  return (
    <main dir="rtl" className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-white">
      {/* القائمة الجانبية (تصميمك الأصلي) */}
      <section className="w-full md:w-[400px] h-[40vh] md:h-full bg-white z-20 flex flex-col shadow-2xl overflow-hidden border-l">
        <div className="p-6 bg-[#065f46] text-white">
          <h1 className="font-black text-2xl flex items-center gap-2">
            <Sparkles className="text-amber-400" /> اكتشف سوف
          </h1>
          <p className="text-emerald-100 text-sm mt-1">دليلك السياحي الشامل لولاية الوادي</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {places.map(p => (
            <div key={p.id} onClick={() => setSelectedPlace(p)} 
              className="p-4 border rounded-2xl cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
              <h3 className="font-bold text-gray-800">{p.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {p.category}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة */}
      <section className="flex-1 h-[60vh] md:h-full relative">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </section>
    </main>
  );
}