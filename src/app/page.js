"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Search, MapPin, X, Navigation } from "lucide-react";

// استدعاء الخريطة بشكل آمن
const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { ssr: false });

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => {
      if (data) setPlaces(data);
    });
  }, []);

  const filteredPlaces = places.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans">
      {/* القسم الجانبي */}
      <section className="w-full md:w-[400px] h-[40vh] md:h-full bg-white z-20 flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 bg-emerald-800 text-white font-bold text-center">اكتشف سوف</div>
        <div className="p-2 border-b">
          <input 
            className="w-full p-2 border rounded-lg text-sm" 
            placeholder="بحث عن معالم..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredPlaces.map(p => (
            <div key={p.id} onClick={() => setSelectedPlace(p)} className="p-4 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-3">
              <MapPin size={18} className="text-emerald-600" />
              <span className="font-bold text-sm">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* الخريطة */}
      <section className="flex-1 h-[60vh] md:h-full relative">
        <ElOuedMap places={filteredPlaces} onMarkerClick={setSelectedPlace} />
      </section>

      {/* نافذة التفاصيل */}
      {selectedPlace && (
        <div className="absolute inset-0 z-50 bg-white p-6 flex flex-col gap-4 shadow-2xl">
          <button onClick={() => setSelectedPlace(null)} className="p-3 bg-gray-100 rounded-full w-fit">
            <X size={24} />
          </button>
          <h1 className="text-3xl font-black">{selectedPlace.name}</h1>
          <p className="text-gray-600 text-lg leading-relaxed">{selectedPlace.description}</p>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`} 
            target="_blank" 
            className="mt-auto p-4 bg-emerald-600 text-white text-center rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Navigation /> بدء الاتجاهات
          </a>
        </div>
      )}
    </main>
  );
}