"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Map as MapIcon, LocateFixed, Phone, Image as ImageIcon } from "lucide-react";
import { categoryColor } from "@/lib/categories";
import { decodeImageUrls } from "@/lib/imageUtils";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";

// 🆕 دالة الأيقونات 3D (تستخدم صور PNG شفافة بدل الـ SVG)
function buildIcon(category, isSelected) {
  // يمكنك تغيير مسارات الصور لتتطابق مع مجلد الأصول (assets) لديك
  const iconPaths = {
    "فندق": "/icons/hotel-3d.png",
    "مطعم": "/icons/restaurant-3d.png",
    "تاريخي": "/icons/mosque-3d.png",
    "واحة": "/icons/oasis-3d.png"
  };
  
  const iconUrl = iconPaths[category] || "/icons/default-3d.png";
  const size = isSelected ? [60, 60] : [45, 45]; // تكبير الأيقونة عند التحديد

  return L.icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className: "transition-all duration-300 drop-shadow-xl"
  });
}

const userIcon = L.divIcon({
  className: "user-location-icon",
  html:
    '<div style="position:relative; width:20px; height:20px;">' +
    '<div style="position:absolute; inset:-10px; background:rgba(61, 110, 119, 0.3); border-radius:999px; animation: pulseRing 2s infinite;"></div>' +
    '<div style="width:20px; height:20px; background:#3D6E77; border:3px solid white; border-radius:999px; box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>' +
    "</div>" +
    "<style>@keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.9; } 70% { transform: scale(2.5); opacity: 0; } 100% { transform: scale(2.5); opacity: 0; } }</style>",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  return (
    <button
      onClick={() => {
        setLocating(true);
        map.locate().on("locationfound", function (e) {
          setLocating(false);
          map.flyTo(e.latlng, 14, { animate: true, duration: 1.5 });
        }).on("locationerror", function() {
          setLocating(false);
          alert("تعذر تحديد موقعك. يرجى تفعيل الـ GPS في جهازك.");
        });
      }}
      title="موقعي الحالي"
      className="absolute bottom-6 right-4 z-[1000] p-3.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-ink/10 text-clay hover:bg-white hover:scale-105 transition-all"
    >
      <LocateFixed size={22} className={locating ? "animate-pulse text-amber-500" : ""} />
    </button>
  );
}

const MAP_STYLES = {
  scenic: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
  real: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

export default function ElOuedMap({ center, places, onMarkerClick, selectedId, route, userLocation }) {
  const [mapStyle, setMapStyle] = useState("scenic");
  const [activeCategory, setActiveCategory] = useState("الكل"); // 🆕 حالة التصنيف
  const activeStyle = MAP_STYLES[mapStyle];

  // 🆕 تصفية الأماكن بناءً على التصنيف المختار
  const filteredPlaces = activeCategory === "الكل" 
    ? places 
    : places.filter(place => place.category === activeCategory);

  // استخراج التصنيفات الفريدة من البيانات لإنشاء أزرار الفلترة
  const uniqueCategories = ["الكل", ...new Set(places.map(p => p.category).filter(Boolean))];

  return (
    <div className="w-full h-full relative z-0">
      
      {/* 🆕 شريط الفلترة (التصنيفات) */}
      <div className="absolute top-16 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {uniqueCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? "bg-clay text-white border-2 border-white" 
                : "bg-white/90 text-ink border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer url={activeStyle.url} attribution={activeStyle.attribution} />
        <ChangeView center={center} />
        <LocateButton />
        
        {filteredPlaces.map(function (place) {
          if (!place.lat || !place.lng) return null;
          
          // تحويل رابط الصورة إلى مصفوفة إذا كان هناك أكثر من صورة
          const images = place.image_url ? place.image_url.split(',') : [FALLBACK_IMAGE];

          return (
            <Marker
              key={place.id}
              position={[parseFloat(place.lat), parseFloat(place.lng)]}
              icon={buildIcon(place.category, selectedId === place.id)}
              zIndexOffset={selectedId === place.id ? 1000 : 0}
              eventHandlers={{
                click: function () {
                  if (onMarkerClick) onMarkerClick(place);
                },
              }}
            >
              {/* 🆕 تغيير Tooltip إلى Popup لإتاحة التفاعل */}
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="flex flex-col gap-3 w-[220px]" dir="rtl">
                  
                  {/* 🆕 معرض الصور (Slider) */}
                  <div className="w-full h-32 rounded-lg overflow-x-auto flex snap-x snap-mandatory scrollbar-hide shadow-inner relative">
                    {images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={decodeImageUrls(img.trim()) || FALLBACK_IMAGE} 
                        alt={place.name} 
                        className="w-full h-full object-cover flex-shrink-0 snap-center bg-gray-100"
                      />
                    ))}
                    <div 
                      className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-md shadow-sm"
                      style={{ backgroundColor: categoryColor(place.category) }}
                    >
                      {place.category}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="font-bold text-base text-ink mb-1">{place.name}</h3>
                    {place.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{place.description}</p>
                    )}
                  </div>

                  {/* 🆕 أزرار الاتصال والتفاعل */}
                  <div className="flex gap-2 border-t pt-2 mt-1">
                    {place.phone && (
                      <a 
                        href={`tel:${place.phone}`} 
                        className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-1.5 rounded-md text-xs font-bold hover:bg-green-600 transition"
                      >
                        <Phone size={14} /> اتصال
                      </a>
                    )}
                    {/* يمكنك إضافة زر لاتجاهات جوجل ماب هنا */}
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white py-1.5 rounded-md text-xs font-bold hover:bg-blue-600 transition"
                    >
                      <MapIcon size={14} /> المسار
                    </button>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation ? (
          <Marker position={userLocation} icon={userIcon} zIndexOffset={2000} />
        ) : null}

        {route && route.coordinates ? (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: "#B5502E", weight: 5, opacity: 0.85, lineCap: "round", dashArray: "1, 8" }}
          />
        ) : null}
      </MapContainer>

      <button
        onClick={() => setMapStyle(s => s === "scenic" ? "real" : "scenic")}
        aria-label="تبديل نوع الخريطة"
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2.5 text-sm font-bold text-ink hover:bg-white transition-all border border-ink/10"
      >
        {mapStyle === "scenic" ? <Layers size={18} className="text-clay" /> : <MapIcon size={18} className="text-clay" />}
        {mapStyle === "scenic" ? "قمر صناعي" : "خريطة سياحية"}
      </button>

      <style jsx global>{`
        /* إخفاء شريط التمرير لمعرض الصور وشريط الفلترة مع الحفاظ على القدرة على التمرير */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* تحسين مظهر النافذة المنبثقة Popup */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
          line-height: normal;
        }
        .leaflet-popup-tip {
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
