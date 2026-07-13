"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { ssr: false });

export default function Home() {
  const [places, setPlaces] = useState([]);
  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => { if (data) setPlaces(data); });
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside className="sidebar">
        <h1>اكتشف سوف</h1>
        {places.map(p => (
          <div key={p.id} className="place-card">
            <h3 style={{ color: 'black' }}>{p.name}</h3>
          </div>
        ))}
      </aside>
      <main style={{ flex: 1 }}>
        <ElOuedMap places={places} />
      </main>
    </div>
  );
}
