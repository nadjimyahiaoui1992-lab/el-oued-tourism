"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

const ElOuedMap = dynamic(() => import('@/components/ElOuedMap'), { ssr: false });

export default function Home() {
  const [places, setPlaces] = useState([]);
  useEffect(() => {
    supabase.from('places').select('*').then(({ data }) => { if (data) setPlaces(data); });
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'row' }}>
      {/* القائمة الجانبية */}
      <aside style={{ width: '400px', backgroundColor: '#064e3b', color: 'white', padding: '20px', overflowY: 'auto' }}>
        <h1 style={{ marginBottom: '20px' }}>اكتشف سوف</h1>
        {places.map(p => (
          <div key={p.id} style={{ 
            backgroundColor: 'white', 
            color: '#1f2937', 
            padding: '15px', 
            marginBottom: '10px', 
            borderRadius: '10px',
            fontWeight: 'bold'
          }}>
            {p.name}
          </div>
        ))}
      </aside>
      
      {/* الخريطة */}
      <main style={{ flex: 1 }}>
        <ElOuedMap places={places} />
      </main>
    </div>
  );
}
