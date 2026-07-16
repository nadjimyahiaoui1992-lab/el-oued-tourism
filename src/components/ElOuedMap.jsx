"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Map as MapIcon, LocateFixed, Phone } from "lucide-react";
import { categoryColor } from "@/lib/categories";
import { decodeImageUrls } from "@/lib/imageUtils";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";

// 🆕 دالة بناء دبابيس الخريطة مع أيقونات SVG داخلية مخصصة لكل تصنيف
function buildIcon(category, isSelected) {
  const color = categoryColor(category) || "#3D6E77";
  const w = isSelected ? 46 : 38;
  const h = isSelected ? 58 : 48;
  
  // اختيار الأيقونة الداخلية المناسبة لكل تصنيف بدقة (متوافقة مع تصنيفات موقعك)
  let innerIconSvg = "";
  
  switch (category) {
    case "فنادق ومنتجعات":
      innerIconSvg = `
        <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 22V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v18M12 18h.01M12 14h.01M16 18h.01M16 14h.01M8 18h.01M8 14h.01M12 10h.01M12 6h.01"/>
        </svg>
      `;
      break;
    case "أسواق":
      innerIconSvg = `
        <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
        </svg>
      `;
      break;
    case "تاريخ وثقافة":
      // رسم مبسط لمعلم تاريخي/قبة مسجد
      innerIconSvg = `
        <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 6a6 6 0 0 0-6 6v6h12v-6a6 6 0 0 0-6-6zM4 18h16"/>
        </svg>
      `;
      break;
    case "المرافق الصحية":
      innerIconSvg = `
        <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      `;
      break;
    case "الوكالات السياحية":
      innerIconSvg = `
        <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m16.2 7.8-2 5.7-5.7 2 2-5.7z"/>
        </svg>
      `;
      break;
    default:
      // أيقونة افتراضية دبوس عام مع نقطة في المنتصف
      innerIconSvg = `
        <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3" fill="${color}"/>
        </svg>
      `;
  }

  return L.divIcon({
    className: "custom-pin-icon transition-all duration-300",
    html: `
      <div style="position:relative; width:${w}px; height:${h}px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <svg width="${w}" height="${h}" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg" style="transition: all 0.3s ease;">
          <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 30 20 30s20-16 20-30C40 8.95 31.05 0 20 0z" fill="${color}" ${isSelected ? 'stroke="white" stroke-width="2.5"' : ""}/>
          <circle cx="20" cy="20" r="11" fill="white"/>
          ${innerIconSvg}
        </svg>
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h], // ضبط مكان ظهور النافذة المنبثقة بدقة فوق الدبوس
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
    attribution: '© CARTO © OpenStreetMap',
  },
  real: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
  },
};

export default function ElOuedMap({ center, places, onMarkerClick, selectedId, route, userLocation }) {
  const [mapStyle, setMapStyle] = useState("scenic");
  const activeStyle = MAP_STYLES[mapStyle];

  return (
    <div className="w-full h-full relative z-0">
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
        
        {places.map(function (place) {
          if (!place.lat || !place.lng) return null;
          
          // تحويل رابط الصورة إلى مصفوفة للـ Slider
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
              {/* النافذة المنبثقة التفاعلية */}
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="flex flex-col gap-3 w-[220px]" dir="rtl">
                  
                  {/* معرض الصور المصغر */}
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
                      className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-md shadow-sm"
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

                  {/* أزرار التفاعل */}
                  <div className="flex gap-2 border-t pt-2 mt-1">
                    {place.phone && (
                      <a 
                        href={`tel:${place.phone}`} 
                        className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-1.5 rounded-md text-xs font-bold hover:bg-green-600 transition"
                      >
                        <Phone size={14} /> اتصال
                      </a>
                    )}
                    <button 
                      onClick={() => window.open(`http://maps.google.com/?q=${place.lat},${place.lng}`)}
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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
