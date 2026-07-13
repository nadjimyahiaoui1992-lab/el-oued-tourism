"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { X, Navigation } from "lucide-react";

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
    <main className="flex flex-col md:flex-row h-screen w-full bg-white font-sans">
      {/* القائمة الجانبية (بنفس ألوان صورتك الأصلية) */}
      <section className="w-full md:w-[400px] h-[40vh] md:h-full bg-white border-l shadow-lg z-20 overflow-y-auto">
        <div className="p-6 bg-[#065f46] text-white">
          <h1 className="font-black text-2xl">اكتشف سوف</h1>
          <p className="text-emerald-100 text-sm">دليلك السياحي لولاية الوادي</p>
        </div>
        <div className="p-2">
          {places.map(p => (
            <div key={p.id} onClick={() => setSelectedPlace(p)} 
              className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
              <h3 className="font-bold text-gray-800">{p.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة */}
      <section className="flex-1 h-[60vh] md:h-full relative">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </section>

      {/* نافذة التفاصيل */}
      {selectedPlace && (
        <div className="absolute inset-0 z-50 bg-white p-6 flex flex-col shadow-2xl">
          <button onClick={() => setSelectedPlace(null)} className="p-2 bg-gray-100 rounded-full w-fit mb-4"><X /></button>
          <h1 className="text-3xl font-black">{selectedPlace.name}</h1>
          <p className="text-gray-600 mt-4 leading-relaxed">{selectedPlace.description}</p>
          <a href={`http://maps.google.com/?q=${selectedPlace.lat},${selectedPlace.lng}`} target="_blank"
             className="mt-auto p-4 bg-[#065f46] text-white text-center rounded-xl font-bold flex items-center justify-center gap-2">
            <Navigation /> بدء الاتجاهات
          </a>
        </div>
      )}
    </main>
  );
}