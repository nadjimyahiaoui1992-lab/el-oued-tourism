"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  MapPin,
  Star,
  Users,
  Camera,
  Map as MapIcon,
  Award,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";

// استدعاء الخريطة التفاعلية بدون SSR
const ElOuedMap = dynamic(() => import("@/components/ElOuedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex flex-col items-center justify-center bg-orange-50 rounded-3xl animate-pulse">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3" />
      <span className="text-orange-700 font-bold">جاري تحميل الخريطة...</span>
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

  // جلب البيانات من قاعدة البيانات
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
    <main dir="rtl" className="flex flex-col min-h-screen w-full bg-[#fafafa] font-sans">
      
      {/* 1. شريط التنقل العلوي (Navbar) */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* الشعار */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-orange-500 p-2 rounded-xl text-white">
                <MapPin size={24} />
              </div>
              <div>
                <h1 className="font-black text-xl text-gray-900 leading-tight">اكتشف سوف</h1>
                <p className="text-[10px] text-gray-500 font-bold">دليلك السياحي</p>
              </div>
            </div>

            {/* روابط سطح المكتب */}
            <div className="hidden md:flex items-center gap-8 font-bold text-gray-600 text-sm">
              <a href="#" className="text-orange-500 border-b-2 border-orange-500 pb-1">الرئيسية</a>
              <a href="#places" className="hover:text-orange-500 transition-colors">الأماكن السياحية</a>
              <a href="#" className="hover:text-orange-500 transition-colors">من نحن</a>
              <a href="#" className="hover:text-orange-500 transition-colors">اتصل بنا</a>
            </div>

            {/* زر القائمة للهواتف */}
            <button 
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* قائمة الهاتف المنسدلة */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 font-bold text-gray-700">
            <a href="#" className="text-orange-500">الرئيسية</a>
            <a href="#places">الأماكن السياحية</a>
            <a href="#">من نحن</a>
            <a href="#">اتصل بنا</a>
          </div>
        )}
      </nav>

      {/* 2. القسم الرئيسي (Hero Section) */}
      <section className="relative w-full h-[85vh] min-h-[600px] mt-20 flex flex-col items-center justify-center text-center px-4">
        {/* صورة الخلفية مع التدرج اللوني */}
        <div className="absolute inset-0 z-0">
          <Image src={HERO_IMAGE} alt="غيطان وكثبان الوادي" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent h-full" />
        </div>

        {/* محتوى القسم الرئيسي */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
          <h2 className="text-white font-black text-5xl md:text-7xl mb-4 drop-shadow-lg">
            اكتشف <span className="text-orange-500">سوف</span>
          </h2>
          <p className="text-white/90 text-sm md:text-lg lg:text-xl font-medium mb-8 max-w-2xl drop-shadow-md">
            الدليل السياحي الشامل لولاية الوادي، مدينة الألف قبة وبوابة الصحراء الكبرى
          </p>

          {/* شريط البحث المدمج */}
          <div className="w-full max-w-2xl bg-white rounded-full p-2 flex items-center shadow-2xl shadow-black/20">
            <div className="bg-orange-500 text-white rounded-full p-3 md:p-4">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="ابحث عن وجهتك (مثال: سوق الأعشاش، البياضة...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 text-gray-700 text-sm md:text-base font-medium"
            />
          </div>
        </div>

        {/* إحصائيات الموقع العائمة */}
        <div className="absolute bottom-[-40px] z-20 w-full max-w-5xl px-4 hidden md:block">
          <div className="bg-white rounded-2xl shadow-xl flex items-center justify-around p-6">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-orange-50 text-orange-500 p-3 rounded-full"><Award size={24} /></div>
              <span className="font-black text-2xl text-gray-800">4.7</span>
              <span className="text-xs text-gray-500 font-bold">تقييم عام</span>
            </div>
            <div className="w-px h-12 bg-gray-100"></div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-orange-50 text-orange-500 p-3 rounded-full"><Camera size={24} /></div>
              <span className="font-black text-2xl text-gray-800">8</span>
              <span className="text-xs text-gray-500 font-bold">مناطق طبيعية</span>
            </div>
            <div className="w-px h-12 bg-gray-100"></div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-orange-50 text-orange-500 p-3 rounded-full"><Users size={24} /></div>
              <span className="font-black text-2xl text-gray-800">+10K</span>
              <span className="text-xs text-gray-500 font-bold">زائر سنوياً</span>
            </div>
            <div className="w-px h-12 bg-gray-100"></div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-orange-50 text-orange-500 p-3 rounded-full"><MapIcon size={24} /></div>
              <span className="font-black text-2xl text-gray-800">+50</span>
              <span className="text-xs text-gray-500 font-bold">معلم سياحي</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. شبكة الأماكن السياحية (Cards Grid) */}
      <section id="places" className="pt-20 md:pt-32 pb-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl md:text-3xl font-black text-gray-900">الأماكن السياحية</h3>
          <button className="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors">
            عرض الجميع ←
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold">لم نجد معالم تطابق بحثك.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer flex flex-col">
                {/* الجزء العلوي: الصورة والشارة */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image 
                    src={place.image_url || FALLBACK_IMAGE} 
                    alt={place.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* شارة التصنيف */}
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                    {place.category}
                  </div>
                  {/* موقع المعلم على الصورة */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <MapPin size={12} /> الوادي
                  </div>
                </div>
                
                {/* الجزء السفلي: التفاصيل */}
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-black text-lg text-gray-900 mb-2">{place.name}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                    {place.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-orange-400 fill-orange-400" />
                      <span className="font-bold text-gray-800 text-sm">{place.rating || "4.5"}</span>
                      <span className="text-xs text-gray-400 font-medium">(120 تقييم)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. قسم الخريطة */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h3 className="text-3xl font-black text-gray-900 mb-2">خريطة المعالم</h3>
          <p className="text-gray-500 font-medium text-sm md:text-base">اكتشف مواقع المعالم السياحية على الخريطة التفاعلية</p>
        </div>
        <div className="max-w-6xl mx-auto h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <ElOuedMap center={DEFAULT_CENTER} places={filteredPlaces} />
        </div>
      </section>

      {/* 5. قسم الدعوة لاتخاذ إجراء (Call to Action) */}
      <section className="bg-orange-500 py-16 px-4 text-center mt-10">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4">جاهز لاكتشاف سوف؟</h3>
          <p className="text-orange-100 font-medium text-sm md:text-lg mb-8">
            ابدأ رحلتك الآن واستكشف أجمل المعالم السياحية في ولاية الوادي
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-white text-orange-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              تصفح الأماكن <ArrowLeft size={18} />
            </button>
            <button className="w-full sm:w-auto bg-orange-600 text-white border border-orange-400 font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition-colors">
              تواصل معنا
            </button>
          </div>
        </div>
      </section>

      {/* 6. التذييل (Footer) */}
      <footer className="bg-gray-900 text-white py-12 px-4 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-black text-xl leading-tight">اكتشف سوف</h4>
              <p className="text-xs text-gray-400 font-medium">دليلك السياحي الشامل</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-6 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-white transition-colors">روابط سريعة</a>
            <a href="#" className="hover:text-white transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
