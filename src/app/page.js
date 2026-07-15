"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Star, Navigation, Menu, X, Filter } from "lucide-react";

// استدعاء الخريطة التفاعلية بدون SSR
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex flex-col items-center justify-center bg-gray-50 animate-pulse rounded-2xl border border-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
      <span className="text-gray-500 text-sm font-bold">جاري تجهيز الخريطة...</span>
    </div>
  ),
});

const DEFAULT_CENTER = [33.3615, 6.8525];
const FALLBACK_IMAGE = "https://share.google/lzNAbtCg26lNd9KTm";
// صورة تعبيرية لولاية الوادي (كثبان وقباب) - يمكنك استبدالها بصورتك الخاصة
const HERO_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=1600";

const CATEGORIES = ["الكل", "طبيعة", "مغامرات", "تاريخ وثقافة", "أسواق", "الفنادق والمنتجعات", "المطاعم"];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // جلب البيانات من قاعدة البيانات
  const fetchPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("places").select("*").limit(50);
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

  // فلترة المعالم حسب البحث والتصنيف
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "الكل" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [places, search, activeCategory]);

  return (
    <main dir="rtl" className="flex flex-col min-h-screen w-full bg-[#fafafa]">
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm h-16 flex items-center">
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
            <a href="#" className="text-orange-500 border-b-2 border-orange-500 pb-1">الرئيسية</a>
            <a href="#places" className="hover:text-orange-500 transition-colors">الأماكن السياحية</a>
            <a href="#" className="hover:text-orange-500 transition-colors">من نحن</a>
          </div>

          <button className="md:hidden text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 2. Hero Section (الصورة الخاصة بالوادي) */}
      <section className="relative w-full h-[60vh] min-h-[400px] mt-16 flex flex-col justify-center px-4">
        <div className="absolute inset-0 z-0">
          <Image src={HERO_IMAGE} alt="واجهة ولاية الوادي" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
          <h2 className="text-white font-black text-4xl md:text-6xl mb-4 drop-shadow-md">
            اكتشف <span className="text-orange-500">سوف</span>
          </h2>
          <p className="text-white/90 text-sm md:text-lg font-medium mb-8 max-w-xl mx-auto drop-shadow">
            مدينة الألف قبة وبوابة الصحراء الكبرى
          </p>

          <div className="max-w-xl mx-auto bg-white rounded-xl p-1 flex items-center shadow-lg">
            <div className="bg-orange-500 text-white rounded-lg p-3">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن معلم، واحة، أو سوق..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 text-gray-700 text-sm font-bold"
            />
          </div>
        </div>
      </section>

      {/* 3. الخريطة التفاعلية (مباشرة بعد الواجهة) */}
      <section className="py-12 px-4 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="text-orange-500" size={24} />
            <h3 className="text-2xl font-black text-gray-900">خريطة المعالم السياحية</h3>
          </div>
          <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <ElOuedMap center={DEFAULT_CENTER} places={filteredPlaces} />
          </div>
        </div>
      </section>

      {/* 4. شريط التصنيفات */}
      <section id="places" className="pt-6 pb-4 px-4 bg-white sticky top-16 z-40 shadow-sm border-y border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <Filter className="text-gray-400 shrink-0 ml-2" size={20} />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                activeCategory === cat 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 5. صور المعالم والمعلومات والاتجاهات */}
      <section className="py-10 px-4 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold">لم نجد معالم تطابق بحثك في هذا التصنيف.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col group">
                
                {/* صورة المعلم الشارة */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={place.image_url || FALLBACK_IMAGE} 
                    alt={place.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md">
                    {place.category}
                  </div>
                </div>
                
                {/* التفاصيل والتقييم */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-gray-900">{place.name}</h4>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md">
                      <Star size={12} className="text-orange-500 fill-orange-500" />
                      <span className="font-bold text-orange-700 text-xs">{place.rating || "4.5"}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5 flex-1">
                    {place.description}
                  </p>
                  
                  {/* زر الاتجاهات المباشر */}
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <a 
                      href={place.lat && place.lng ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                        place.lat && place.lng 
                          ? "bg-gray-900 text-white hover:bg-orange-500" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={(e) => { if (!place.lat || !place.lng) e.preventDefault(); }}
                    >
                      <Navigation size={16} />
                      {place.lat && place.lng ? "الحصول على الاتجاهات" : "الموقع غير متوفر"}
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#111111] text-white py-10 px-4 border-t border-orange-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-black text-lg leading-none">اكتشف سوف</h4>
              <p className="text-[10px] text-gray-400 mt-1">دليلك السياحي الشامل لولاية الوادي</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-gray-400">
            <a href="#" className="hover:text-white transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-white transition-colors">اتصل بنا</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
