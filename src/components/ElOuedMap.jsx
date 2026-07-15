"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// إعداد الأيقونة المخصصة
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// مكون لتغيير عرض الخريطة بسلاسة
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      // استخدام flyTo بدلاً من setView لحركة انتقال سينمائية واحترافية
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function ElOuedMap({ center = [33.3683, 6.8674], places = [], onMarkerClick }) {
  return (
    // إضافة حواف دائرية وظلال ناعمة للإطار الخارجي للخريطة
    <div className="w-full h-full relative z-0 rounded-2xl overflow-hidden shadow-md border border-gray-100">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="w-full h-full font-sans"
        zoomControl={false} // تعطيل التحكم الافتراضي لإعادة تموضعه
      >
        {/* استخدام خريطة CartoDB ذات الألوان العصرية والمريحة للعين */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* نقل أزرار التكبير لليسار لتتناسب مع واجهة المستخدم العربية */}
        <ZoomControl position="bottomleft" />
        
        <ChangeView center={center} />
        
        {places.map((place) => (
          place.lat && place.lng && (
            <Marker 
              key={place.id || Math.random()}
              position={[place.lat, place.lng]} 
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(place);
                },
              }}
            >
              {/* تصميم احترافي للنافذة المنبثقة عند النقر على المعلم */}
              <Popup className="rounded-xl overflow-hidden">
                <div className="text-right p-1" dir="rtl">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {place.name || "معلم سياحي"}
                  </h3>
                  
                  {place.description && (
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {place.description}
                    </p>
                  )}
                  
                  {place.image && (
                    <img 
                      src={place.image} 
                      alt={place.name} 
                      className="w-full h-24 object-cover rounded-lg mt-2 border border-gray-100" 
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
