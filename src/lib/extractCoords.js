export function extractCoordsFromLink(link) {
  if (!link) return null;
  const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!match) return null;
  return { lat: match[1], lng: match[2] };
}