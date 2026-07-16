"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Map as MapIcon, Image as ImageIcon } from "lucide-react";
import { categoryColor } from "@/lib/categories";

// دالة لبناء الأيقونات المخصصة حسب التصنيف
function buildIcon(category, isSelected) {
  const color = categoryColor(category);
  const w = isSelected ? 48 : 38;
  const h = isSelected ? 60 : 48;
  
  return L.divIcon({
    className: "custom-pin-icon transition-all duration-300",
    html:
      '<div style="position:relative; width:' + w + 'px; height:' + h + 'px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">' +
      '<svg width="' + w + '" height="' + h + '" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="transition: all 0.3s ease;">' +
      '<path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0z" fill="' + color + '" ' + (isSelected ? 'stroke="white" stroke-width="2"' : "") + "/>" +
      '<circle cx="17" cy="17" r="7" fill="white"/>' +
      "</svg>" +
      "</div>",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
  });
}

// أيقونة موقع المستخدم الحالي (أنيميشن نبض)
const userIcon = L.divIcon({
  className: "user-location-icon",
  html:
    '<div style="position:relative; width:20px; height:20px;">' +
    '<div style="position:absolute; inset:-10px; background:rgba(61, 110, 119, 0.3); border-radius:999px; animation: pulseRing 2s infinite;"></div>' +
    '<div style="width:20px; height:20px; background:#3D6E77; border:3px solid white; border-radius:999px; box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>' +
    "</div>" +
    "<style>" +
    "@keyframes pulseRing {" +
    "0% { transform: scale(0.8); opacity: 0.9; }" +
    "70% { transform: scale(2.5); opacity: 0; }" +
    "100% { transform: scale(2.5); opacity: 0; }" +
    "}" +
    "</style>",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// مكون للتحكم في تغيير زووم الخريطة بسلاسة
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// أنماط الخريطة
const MAP_STYLES = {
  scenic: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap',
  },
  real: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
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
        
        {/* عرض المعالم السياحية */}
        {places.map(function (place) {
          if (!place.lat || !place.lng) return null;
          
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
              {/* النافذة المنبثقة عند التمرير (Hover Tooltip) */}
              <Tooltip 
                direction="top" 
                offset={[0, -50]} 
                opacity={1} 
                permanent={false}
                className="custom-leaflet-tooltip"
              >
                <div className="flex flex-col gap-2 min-w-[150px]" dir="rtl">
                  {/* عرض الصورة إذا كانت متوفرة */}
                  {place.image_url ? (
                    <div className="w-full h-24 rounded-lg overflow-hidden relative shadow-sm">
                      <img 
                        src={place.image_url} 
                        alt={place.name} 
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold text-white backdrop-blur-md shadow-sm"
                        style={{ backgroundColor: categoryColor(place.category) }}
                      >
                        {place.category}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-16 bg-sand flex items-center justify-center rounded-lg shadow-inner">
                      <ImageIcon className="text-ink/30" size={24} />
                    </div>
                  )}
                  
                  {/* اسم المعلم */}
                  <div className="text-center">
                    <h3 className="font-bold text-sm text-ink leading-tight">{place.name}</h3>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* عرض موقع المستخدم */}
        {userLocation ? (
          <Marker position={userLocation} icon={userIcon} zIndexOffset={2000} />
        ) : null}

        {/* رسم مسار الاتجاهات */}
        {route && route.coordinates ? (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: "#B5502E", weight: 5, opacity: 0.85, lineCap: "round", dashArray: "1, 8" }}
          />
        ) : null}
      </MapContainer>

      {/* زر تغيير نوع الخريطة */}
      <button
        onClick={function () {
          setMapStyle(function (s) {
            return s === "scenic" ? "real" : "scenic";
          });
        }}
        aria-label="تبديل نوع الخريطة"
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2.5 text-sm font-bold text-ink hover:bg-white transition-all border border-ink/10"
      >
        {mapStyle === "scenic" ? <Layers size={18} className="text-clay" /> : <MapIcon size={18} className="text-clay" />}
        {mapStyle === "scenic" ? "قمر صناعي" : "خريطة سياحية"}
      </button>

      {/* تنسيقات CSS مخصصة لإلغاء الستايل الافتراضي نتاع Leaflet Tooltip */}
      <style jsx global>{`
        .custom-leaflet-tooltip {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          padding: 0.5rem;
          color: inherit;
          white-space: normal;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(255, 255, 255, 0.95);
          margin-bottom: -1px;
        }
      `}</style>
    </div>
  );
}
