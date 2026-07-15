"use client";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { categoryColor } from "@/lib/categories";

// دبوس على شكل قطرة كلاسيكي (طرفه السفلي يشير بدقة لإحداثيات المعلم)
// مع بصمة "القباب" المصغّرة بداخله كتوقيع بصري للهوية
function pinIcon(color, active) {
  const w = active ? 38 : 30;
  const h = active ? 48 : 38;
  const svg = `
    <svg width="${w}" height="${h}" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="15.5" r="7.2" fill="white"/>
      <path d="M10 18 Q10 12.5 13.2 15.2 Q16 10.4 18.8 15.2 Q22 12.5 22 18 Z" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "el-oued-marker",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 8],
  });
}

// دبوس موقع المستخدم (نقطة الانطلاق)
function userIcon() {
  const svg = `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9" fill="#1F2A44" fill-opacity="0.18"/>
      <circle cx="11" cy="11" r="6" fill="#1F2A44" stroke="white" stroke-width="2.5"/>
    </svg>`;
  return L.divIcon({ html: svg, className: "el-oued-user-marker", iconSize: [22, 22], iconAnchor: [11, 11] });
}

// مكون لتحريك الكاميرا بسلاسة (طيران) لمكان محدد
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// يضبط إطار الخريطة تلقائيًا ليحتوي المسار كاملاً عند ظهوره
function FitRouteBounds({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [48, 48] });
    }
  }, [coordinates, map]);
  return null;
}

export default function ElOuedMap({ center, places = [], onMarkerClick, selectedId, route, userLocation }) {
  const icons = useMemo(() => {
    const cache = new Map();
    return (category, active) => {
      const key = `${category}-${active}`;
      if (!cache.has(key)) cache.set(key, pinIcon(categoryColor(category), active));
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
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="الخريطة">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="قمر صناعي">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="ليلي">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomleft" />
        <ChangeView center={center} />

        {route?.coordinates && (
          <>
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: "#B5502E", weight: 5, opacity: 0.85, lineCap: "round" }}
            />
            <FitRouteBounds coordinates={route.coordinates} />
          </>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon()} />
        )}

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
