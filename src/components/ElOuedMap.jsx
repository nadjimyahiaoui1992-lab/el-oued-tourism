"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { decodeImageUrls } from "@/lib/placeImages";

const CATEGORY_COLORS = {
  "طبيعة": "#16a34a",
  "مغامرات": "#ca8a04",
  "تاريخ وثقافة": "#a16207",
  "أسواق": "#ea580c",
  "فنادق ومنتجعات": "#0284c7",
  "الفنادق والمنتجعات": "#0284c7",
  "المطاعم": "#dc2626",
  "المطاعم والمقاهي": "#dc2626",
  "المرافق الصحية": "#0891b2",
  "فضاء التسلية": "#9333ea",
  "الوكالات السياحية": "#4f46e5",
};
const DEFAULT_COLOR = "#059669";

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

function buildIcon(category) {
  const color = getCategoryColor(category);
  return L.divIcon({
    className: "custom-pin-icon",
    html: `
      <div style="position: relative; width: 34px; height: 44px;">
        <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0z" fill="${color}"/>
          <circle cx="17" cy="17" r="7" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

function buildPopupHtml(place) {
  const images = decodeImageUrls(place.image_url);
  const img = images[0] || "https://images.unsplash.com/photo-1682687982501-1e5898cb4703?q=80&w=600";
  const color = getCategoryColor(place.category);
  const rating = place.rating ? Number(place.rating).toFixed(1) : null;
  const dir = place.lat && place.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
    : "#";

  return `
    <div style="width: 220px; font-family: inherit;" dir="rtl">
      <div style="width:100%; height:110px; border-radius:12px; overflow:hidden; margin-bottom:8px; background:#f1f5f9;">
        <img src="${img}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'"/>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
        <span style="font-size:11px; font-weight:800; color:${color}; background:${color}1A; padding:2px 8px; border-radius:999px;">
          ${place.category || ""}
        </span>
        ${rating ? `<span style="font-size:11px; font-weight:800; color:#b45309;">★ ${rating}</span>` : ""}
      </div>
      <h3 style="font-size:14px; font-weight:800; color:#111827; margin:2px 0 8px;">${place.name || ""}</h3>
      <a href="${dir}" target="_blank" rel="noreferrer" style="display:block; text-align:center; background:${color}; color:white; font-size:12px; font-weight:700; padding:8px; border-radius:10px; text-decoration:none;">
        بدء الاتجاهات
      </a>
    </div>
  `;
}

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function ElOuedMap({ center, places, onMarkerClick }) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ChangeView center={center} />
        {places.map(
          (place) =>
            place.lat &&
            place.lng && (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={buildIcon(place.category)}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick) onMarkerClick(place);
                  },
                }}
              >
                <Popup>
                  <div dangerouslySetInnerHTML={{ __html: buildPopupHtml(place) }} />
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}
