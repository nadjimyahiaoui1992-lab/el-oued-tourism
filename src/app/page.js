"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Search, MapPin, Sparkles, Navigation, X } from "lucide-react";

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
    <main dir="rtl" className="flex flex-col md:flex-row h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* القائمة الجانبية (نفس تصميم صورك) */}
      <section className="bg-white w-full md:w-[420px] shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-6 bg-emerald-800 text-white">
          <h1 className="font-black text-2xl">اكتشف سوف</h1>
          <p className="text-emerald-50 text-sm">مدينة الألف قبة بانتظارك</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {places.map(p => (
            <div key={p.id} onClick={() => setSelectedPlace(p)} 
              className="mb-4 bg-white border border-gray-100 p-4 rounded-2xl cursor-pointer hover:border-emerald-400 transition-all shadow-sm">
              <h3 className="font-bold text-gray-900">{p.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة (تم ربطها برمجياً لتعمل) */}
      <section className="flex-1 relative bg-gray-200">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </section>

      {/* نافذة التفاصيل (ستظهر عند الضغط) */}
      {selectedPlace && (
        <div className="absolute inset-0 z-50 bg-white p-6 flex flex-col md:w-[400px] shadow-2xl">
          <button onClick={() => setSelectedPlace(null)} className="mb-4 p-2 bg-gray-100 rounded-full w-fit"><X /></button>
          <h1 className="text-3xl font-black mb-4">{selectedPlace.name}</h1>
          <p className="text-gray-600 mb-8">{selectedPlace.description}</p>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`} target="_blank" 
             className="mt-auto p-4 bg-emerald-600 text-white rounded-xl font-bold text-center flex justify-center gap-2">
            <Navigation /> بدء الاتجاهات
          </a>
        </div>
      )}
    </main>
  );
}