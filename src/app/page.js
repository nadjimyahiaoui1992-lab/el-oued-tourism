"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Star, Users, Camera, Map as MapIcon, Award, Menu, X } from "lucide-react";

// استدعاء الخريطة التفاعلية بدون SSR
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex flex-col items-center justify-center bg-gray-50 animate-pulse">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
      <span className="text-gray-500 text-sm font-bold">جاري تجهيز الخريطة...</span>
    </div>
  ),
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=800";
const HERO_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=1600";

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("places").select("*").limit(20);
      if (error) throw error;
      if (data) setPlaces(data);
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    return places.filter((p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [places, search]);

  return (
    <main dir="rtl" className="flex flex-col min-h-screen w-full bg-white">
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm h-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <MapPin size={20} />
            </div>
            <div>
              <h1 className="font-black text-lg text-gray-900 leading-none">اكتشف سوف</h1>
              <p className="text-[9px] text-gray-500 font-bold">دليلك السياحي</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-bold text-gray-600 text-sm">
            <a href="#" className="text-orange-500 bg-orange-50 px-3 py-1 rounded-full">الرئيسية</a>
            <a href="#places" className="hover:text-orange-500 transition-colors">الأماكن السياحية</a>
            <a href="#" className="hover:text-orange-500 transition-colors">من نحن</a>
            <a href="#" className="hover:text-orange-500 transition-colors">اتصل بنا</a>
          </div>

          <button className="md:hidden text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[75vh] min-h-[500px] mt-16 flex flex-col justify-center px-4">
        <div className="absolute inset-0 z-0">
          <Image src={HERO_IMAGE} alt="غيطان وكثبان الوادي" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center mt-[-50px]">
          <h2 className="text-white font-black text-5xl md:text-7xl mb-4 drop-shadow-md">
            اكتشف <span className="text-orange-500">سوف</span>
          </h2>
          <p className="text-white text-sm md:text-lg font-medium mb-8 max-w-xl mx-auto drop-shadow">
            الدليل السياحي الشامل لولاية الوادي، مدينة الألف قبة وبوابة الصحراء الكبرى
          </p>

          <div className="max-w-xl mx-auto bg-white rounded-xl p-1 flex items-center shadow-lg">
            <div className="bg-orange-500 text-white rounded-lg p-3">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن وجهتك..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 text-gray-700 text-sm font-bold"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar (Flat design like screenshot 1) */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-center divide-x divide-x-reverse divide-gray-100">
          <div className="flex-1 flex flex-col items-center gap-1">
            <Award size={24} className="text-orange-500 mb-1" />
            <span className="font-black text-xl text-gray-900">4.7</span>
            <span className="text-[10px] text-gray-500 font-bold">تقييم عام</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <Camera size={24} className="text-orange-500 mb-1" />
            <span className="font-black text-xl text-gray-900">8</span>
            <span className="text-[10px] text-gray-500 font-bold">مناطق طبيعية</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <Users size={24} className="text-orange-500 mb-1" />
            <span className="font-black text-xl text-gray-900">+10K</span>
            <span className="text-[10px] text-gray-500 font-bold">زائر سنوياً</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <MapIcon size={24} className="text-orange-500 mb-1" />
            <span className="font-black text-xl text-gray-900">+50</span>
            <span className="text-[10px] text-gray-500 font-bold">معلم سياحي</span>
          </div>
        </div>
      </section>

      {/* Cards Section (Like screenshot 2) */}
      <section id="places" className="py-16 px-4 max-w-6xl mx-auto w-full bg-white">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-xl" />)}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold">لم نجد معالم تطابق بحثك.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="group cursor-pointer flex flex-col">
                <div className="relative h-60 w-full overflow-hidden rounded-2xl mb-4">
                  <Image 
                    src={place.image_url || FALLBACK_IMAGE} 
                    alt={place.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-md">
                    {place.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <MapPin size={10} /> الوادي
                  </div>
                </div>
                
                <h4 className="font-black text-lg text-gray-900 mb-2">{place.name}</h4>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                  {place.description}
                </p>
                <div className="flex items-center gap-1 mt-auto">
                  <Star size={14} className="text-orange-400 fill-orange-400" />
                  <span className="font-bold text-gray-800 text-sm">{place.rating || "4.5"}</span>
                  <span className="text-[10px] text-gray-400">({Math.floor(Math.random() * 200) + 50} تقييم)</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 flex justify-center">
          <button className="border border-gray-200 text-gray-700 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors">
            عرض جميع الأماكن ←
          </button>
        </div>
      </section>

      {/* Map Section (Like screenshot 3) */}
      <section className="pt-10 pb-0 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 mb-2">خريطة المعالم</h3>
          <p className="text-gray-500 font-medium text-xs">اكتشف مواقع المعالم السياحية على الخريطة التفاعلية</p>
        </div>
        <div className="max-w-5xl mx-auto h-[400px] rounded-t-2xl overflow-hidden">
          <ElOuedMap center={DEFAULT_CENTER} places={filteredPlaces} />
        </div>
      </section>

      {/* CTA Section (Orange Block connected to Map) */}
      <section className="bg-[#e67e22] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-black text-white mb-3">جاهز لاكتشاف سوف؟</h3>
          <p className="text-orange-100 font-medium text-sm mb-8">
            ابدأ رحلتك الآن واستكشف أجمل المعالم السياحية في ولاية الوادي
          </p>
          <div className="flex flex-row items-center justify-center gap-4">
            <button className="bg-[#d35400] text-white font-bold text-sm py-3 px-8 rounded-full hover:bg-[#ba4a00] transition-colors">
              تواصل معنا
            </button>
            <button className="bg-white text-[#e67e22] font-bold text-sm py-3 px-8 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              تصفح الأماكن ←
            </button>
          </div>
        </div>
      </section>

      {/* Footer (Dark Block connected to CTA) */}
      <footer className="bg-[#111111] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-black text-lg leading-none">اكتشف سوف</h4>
              <p className="text-[10px] text-gray-400 mt-1">دليلك السياحي الشامل</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-gray-400">
            <a href="#" className="hover:text-white transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-white transition-colors">روابط سريعة</a>
            <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
