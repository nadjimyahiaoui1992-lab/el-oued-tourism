// خدمة توجيه مجانية عمومية (OSRM demo server) — مناسبة للتجربة والاستعمال الخفيف.
// إذا زاد استعمال الموقع، يُفضّل الانتقال لخدمة توجيه خاصة (Mapbox, OpenRouteService, أو استضافة OSRM ذاتيًا)
// لتفادي حدود الاستعمال (rate limit) الخاصة بالسيرفر التجريبي.
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRoute(origin, destination) {
  // origin/destination: [lat, lng]
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  const res = await fetch(`${OSRM_BASE}/${coords}?overview=full&geometries=geojson`);
  if (!res.ok) throw new Error("route_fetch_failed");
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) throw new Error("no_route_found");
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("geolocation_unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}
