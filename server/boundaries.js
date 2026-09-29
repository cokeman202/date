import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CITY_COORDINATES } from './geocode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const BOUNDARIES_DIR = path.join(rootDir, 'data', 'boundaries');

if (!fs.existsSync(BOUNDARIES_DIR)) {
  fs.mkdirSync(BOUNDARIES_DIR, { recursive: true });
}

// Generate circular polygon only as an absolute last resort if no real geographic boundary exists
function generateCirclePolygon(lat, lng, radiusKm = 7) {
  const points = 48;
  const coords = [];
  const distanceX = radiusKm / (111.320 * Math.cos(lat * Math.PI / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords]
    },
    properties: {
      isFallback: true
    }
  };
}

export async function getCityBoundary(cityName, fallbackCoords) {
  if (!cityName) return null;
  const cleanCity = cityName.trim();
  const slug = cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cachePath = path.join(BOUNDARIES_DIR, `${slug}.json`);

  // 1. Check local cache
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      // If it's a real polygon (not an old fallback circle), return immediately
      if (cached && cached.geometry && !cached.properties?.isFallback) {
        return cached;
      }
    } catch (err) {
      console.warn(`Error reading boundary cache for ${cityName}:`, err.message);
    }
  }

  // 2. Build smart queries to find the real city administrative polygon
  // Fix common typos and extract base city name
  const normalized = cleanCity
    .replace(/\bonterio\b/gi, 'Ontario')
    .replace(/\bfl\b/gi, 'Florida')
    .replace(/\bca\b/gi, 'California')
    .replace(/\bny\b/gi, 'New York')
    .replace(/\btx\b/gi, 'Texas');

  const baseName = normalized.split(',')[0].trim();
  const firstWord = baseName.split(' ')[0].trim();

  const searchCandidates = [
    normalized,
    baseName,
    `${baseName}, city`,
    firstWord
  ];

  // Try each search candidate in Nominatim for a real Polygon / MultiPolygon
  for (const q of searchCandidates) {
    if (!q || q.length < 2) continue;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&polygon_geojson=1&limit=5`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'CouplesFoodPassportApp/1.0 (contact: info@couplespassport.local)'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Find first result with a real polygon/multipolygon
          const match = data.find(d => 
            d.geojson && 
            (d.geojson.type === 'Polygon' || d.geojson.type === 'MultiPolygon') &&
            d.geojson.coordinates && 
            d.geojson.coordinates.length > 0
          );

          if (match) {
            const geojson = {
              type: "Feature",
              properties: {
                name: cleanCity,
                displayName: match.display_name,
                osmId: match.osm_id,
                type: match.type
              },
              geometry: match.geojson
            };

            // Cache and return real polygon
            fs.writeFileSync(cachePath, JSON.stringify(geojson, null, 2), 'utf-8');
            return geojson;
          }
        }
      }
    } catch (err) {
      console.warn(`Error searching boundary for "${q}":`, err.message);
    }
  }

  // 3. Fallback coordinates only if OpenStreetMap had no boundary polygon
  let lat = fallbackCoords?.lat;
  let lng = fallbackCoords?.lng;

  if (!lat || !lng) {
    const lower = cleanCity.toLowerCase();
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (lower === key || lower.includes(key)) {
        lat = coords.lat;
        lng = coords.lng;
        break;
      }
    }
  }

  if (lat && lng) {
    const circleFeature = generateCirclePolygon(lat, lng, 7.0);
    circleFeature.properties.name = cleanCity;
    return circleFeature;
  }

  return null;
}
