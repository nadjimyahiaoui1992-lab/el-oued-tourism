"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import { Sparkles, MapPin } from "lucide-react";

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
    <div className="flex flex-col md:flex-row h-screen w-full bg-white font-sans text-gray-900">
      {/* القائمة الجانبية الأنيقة */}
      <aside className="w-full md:w-[400px] h-[30vh] md:h-full border-b md:border-b-0 md:border-r border-gray-100 flex flex-col bg-white">
        <div className="bg-emerald-900 p-6 text-white shadow-md">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="text-amber-400" /> اكتشف سوف
          </h1>
          <p className="text-emerald-100 text-sm mt-1">دليلك السياحي الشامل لولاية الوادي</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {places.map((p) => (
            <div key={p.id} onClick={() => setSelectedPlace(p)} 
              className="p-4 border border-gray-100 rounded-2xl cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {p.category}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* الخريطة */}
      <main className="flex-1 h-[70vh] md:h-full">
        <ElOuedMap places={places} onMarkerClick={setSelectedPlace} />
      </main>
    </div>
  );
}
