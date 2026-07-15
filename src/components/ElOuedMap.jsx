"use client";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { categoryColor } from "@/lib/categories";

// دبوس مخصص على شكل قبة صغيرة، بلون الصنف
function domeIcon(color, active) {
  const size = active ? 40 : 32;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="36" rx="7" ry="2.4" fill="#2B2118" opacity="0.18"/>
      <path d="M9 26 C9 13, 31 13, 31 26 L31 30 C31 32.2 29.2 34 27 34 L13 34 C10.8 34 9 32.2 9 30 Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="20" cy="12" r="3.4" fill="${color}" stroke="white" stroke-width="1.5"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "el-oued-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 4],
    popupAnchor: [0, -size + 6],
  });
}

// مكون لتحريك الكاميرا بسلاسة (طيران)
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function ElOuedMap({ center, places = [], onMarkerClick, selectedId }) {
  const icons = useMemo(() => {
    const cache = new Map();
    return (category, active) => {
      const key = `${category}-${active}`;
      if (!cache.has(key)) cache.set(key, domeIcon(categoryColor(category), active));
      return cache.get(key);
    };
  }, []);

  return (
    <div className="w-full h-full relative z-0 bg-sand">
      <MapContainer
        center={center}
        zoom={12}
        zoomControl={false}
        className="w-full h-full font-sans"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <ZoomControl position="bottomleft" />
        <ChangeView center={center} />

        {places.map((place) => (
          place.lat && place.lng && (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={icons(place.category, place.id === selectedId)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(place);
                },
              }}
            >
              {/* النافذة المنبثقة الاحترافية عند النقر على الدبوس */}
              <Popup className="custom-popup">
                <div className="text-right w-48" dir="rtl">
                  <div className="w-full h-24 relative bg-sand">
                    <img
                      src={place.image_url || "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=400"}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute top-2 right-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow"
                      style={{ backgroundColor: categoryColor(place.category) }}
                    >
                      {place.category}
                    </div>
                  </div>
                  <div className="p-2.5 bg-sand-light">
                    <h3 className="font-black text-sm text-ink mb-1">{place.name}</h3>
                    <p className="text-ink-soft text-[10px] line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
