"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { MapPin, Sparkles, X, Navigation } from "lucide-react";

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
    <main className="flex h-screen w-full flex-col md:flex-row bg-white">
      {/* القائمة الجانبية الأنيقة */}
      <section className="relative z-10 w-full shrink-0 border-b border-gray-200 bg-white shadow-lg md:w-[400px] md:border-b-0 md:border-l">
        <div className="bg-[#065f46] p-6 text-white">
          <h1 className="flex items-center gap-2 text-2xl font-black">
            <Sparkles className="text-amber-400" /> اكتشف سوف
          </h1>
          <p className="mt-1 text-sm text-emerald-100">دليلك السياحي لولاية الوادي</p>
        </div>
        <div className="h-[calc(100vh-120px)] overflow-y-auto p-4">
          {places.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPlace(p)}
              className="mb-3 cursor-pointer rounded-2xl border border-gray-100 p-4 transition-all hover:border-emerald-500 hover:shadow-md"
            >
              <h3 className="font-bold text-gray-800">{p.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={14} /> {p.category}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة */}
      <section className="relative flex-1 bg-gray-100">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </section>

      {/* نافذة التفاصيل الأنيقة */}
      {selectedPlace && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white p-6 shadow-2xl md:left-auto md:w-[400px]">
          <button onClick={() => setSelectedPlace(null)} className="mb-4 w-fit rounded-full bg-gray-100 p-3">
            <X size={20} />
          </button>
          <h2 className="text-3xl font-black text-gray-900">{selectedPlace.name}</h2>
          <p className="mt-4 flex-1 text-gray-600 leading-relaxed">{selectedPlace.description}</p>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`} 
             target="_blank" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#065f46] p-4 font-bold text-white">
            <Navigation size={20} /> بدء الاتجاهات
          </a>
        </div>
      )}
    </main>
  );
}