"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { categoryColor } from "@/lib/categories";

function buildIcon(category, isSelected) {
  const color = categoryColor(category);
  const w = isSelected ? 42 : 34;
  const h = isSelected ? 54 : 44;
  return L.divIcon({
    className: "custom-pin-icon",
    html: `
      <div style="position:relative; width:${w}px; height:${h}px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35));">
        <svg width="${w}" height="${h}" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.6 0 0 7.6 0 17c0 12.7 17 27 17 27s17-14.3 17-27C34 7.6 26.4 0 17 0z" fill="${color}" ${isSelected ? 'stroke="white" stroke-width="2"' : ""}/>
          <circle cx="17" cy="17" r="7" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
  });
}

const userIcon = L.divIcon({
  className: "user-location-icon",
  html: `
    <div style="position:relative; width:20px; height:20px;">
      <div style="position:absolute; inset:-8px; background:#3D6E7733; border-radius:999px; animation: pulseRing 2s infinite;"></div>
      <div style="width:20px; height:20px; background:#3D6E77; border:3px solid white; border-radius:999px; box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
    </div>
    <style>
      @keyframes pulseRing {
        0% { transform: scale(0.8); opacity: 0.9; }
        70% { transform: scale(2); opacity: 0; }
        100% { transform: scale(2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function ElOuedMap({ center, places, onMarkerClick, selectedId, route, userLocation }) {
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
                position={[parseFloat(place.lat), parseFloat(place.lng)]}
                icon={buildIcon(place.category, selectedId === place.id)}
                zIndexOffset={selectedId === place.id ? 1000 : 0}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick) onMarkerClick(place);
                  },
                }}
              />
            )
        )}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon} zIndexOffset={2000} />
        )}

        {route && route.coordinates && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: "#B5502E", weight: 5, opacity: 0.85, lineCap: "round" }}
          />
        )}
      </MapContainer>
    </div>
  );
}
