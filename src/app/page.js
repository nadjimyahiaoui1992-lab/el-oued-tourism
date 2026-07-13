"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { ssr: false });

export default function Home() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => {
      if (data) setPlaces(data);
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white">
      {/* القائمة الجانبية مع إجبار التنسيق */}
      <aside className="w-full md:w-[400px] bg-white border-l shadow-lg z-20">
        <div className="bg-emerald-800 p-6 text-white">
          <h1 className="text-2xl font-bold">اكتشف سوف</h1>
        </div>
        <div className="p-4">
          {places.map((p) => (
            <div key={p.id} className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">{p.name}</h3>
            </div>
          ))}
        </div>
      </aside>
      
      {/* الخريطة */}
      <main className="flex-1 bg-gray-100">
        <ElOuedMap places={places} />
      </main>
    </div>
  );
}