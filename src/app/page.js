"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Search, MapPin, Sparkles } from "lucide-react";

const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { ssr: false });

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => {
      if (data) setPlaces(data);
    });
  }, []);

  return (
    <main dir="rtl" className="h-screen w-full flex flex-col md:flex-row bg-gray-50 overflow-hidden font-sans">
      {/* القائمة الجانبية الأنيقة */}
      <section className="w-full md:w-[400px] h-1/3 md:h-full bg-white shadow-xl z-20 flex flex-col border-l border-gray-200">
        <div className="p-6 bg-[#065f46] text-white">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="text-amber-400" /> اكتشف سوف
          </h1>
          <p className="text-emerald-100 text-sm mt-1">دليلك السياحي لولاية الوادي</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {places.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPlace(p)}
              className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
            >
              <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin size={14} /> {p.category}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة الاحترافية */}
      <section className="flex-1 h-2/3 md:h-full relative">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </section>
    </main>
  );
}