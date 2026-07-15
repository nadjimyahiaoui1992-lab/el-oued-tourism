"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// إصلاح أيقونات Leaflet الافتراضية
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

export default function ElOuedMap({ center, places = [], onMarkerClick }) {
  return (
    <div className="w-full h-full relative z-0 bg-gray-100">
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
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(place);
                },
              }}
            >
              {/* النافذة المنبثقة الاحترافية عند النقر على الدبوس */}
              <Popup className="rounded-2xl overflow-hidden custom-popup">
                <div className="text-right p-0 w-48" dir="rtl">
                  <div className="w-full h-24 relative bg-gray-200">
                    <img 
                      src={place.image_url || "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=400"} 
                      alt={place.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {place.category}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-black text-sm text-gray-900 mb-1">{place.name}</h3>
                    <p className="text-gray-500 text-[10px] line-clamp-2 leading-relaxed">
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
