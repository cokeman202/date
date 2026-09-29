import { DEFAULT_RESTAURANTS, DEFAULT_WISHLIST } from '../data/defaultData';
import { CITY_COORDINATES } from '../../server/geocode';

const STORAGE_KEY_REST = 'couple_passport_restaurants';
const STORAGE_KEY_WISH = 'couple_passport_wishlist';
const STORAGE_KEY_BOUNDARIES = 'couple_passport_boundaries';

async function checkApi(path, options = {}) {
  try {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// LocalStorage helpers
function getLocalRestaurants() {
  const data = localStorage.getItem(STORAGE_KEY_REST);
  if (!data) return DEFAULT_RESTAURANTS;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_RESTAURANTS;
  }
}

function setLocalRestaurants(items) {
  localStorage.setItem(STORAGE_KEY_REST, JSON.stringify(items));
}

function getLocalWishlist() {
  const data = localStorage.getItem(STORAGE_KEY_WISH);
  if (!data) return DEFAULT_WISHLIST;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_WISHLIST;
  }
}

function setLocalWishlist(list) {
  localStorage.setItem(STORAGE_KEY_WISH, JSON.stringify(list));
}

export async function getRestaurants() {
  try {
    const data = await checkApi('/api/restaurants');
    setLocalRestaurants(data);
    return data;
  } catch {
    return getLocalRestaurants();
  }
}

export async function addRestaurant(entry) {
  if (!entry.lat || !entry.lng) {
    const clean = (entry.city || '').trim().toLowerCase();
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (clean === key || clean.startsWith(key) || clean.includes(key)) {
        entry.lat = coords.lat;
        entry.lng = coords.lng;
        if (!entry.country) entry.country = coords.country;
        break;
      }
    }
    if (!entry.lat) {
      entry.lat = 40.7128 + (Math.random() - 0.5) * 0.05;
      entry.lng = -74.0060 + (Math.random() - 0.5) * 0.05;
    }
  }

  try {
    const data = await checkApi('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    const current = getLocalRestaurants();
    setLocalRestaurants([data, ...current]);
    return data;
  } catch {
    const newItem = { ...entry, id: 'rest-' + Date.now() };
    const current = getLocalRestaurants();
    const updated = [newItem, ...current];
    setLocalRestaurants(updated);
    return newItem;
  }
}

export async function updateRestaurant(id, entry) {
  try {
    const data = await checkApi(`/api/restaurants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    const current = getLocalRestaurants().map(r => r.id === id ? data : r);
    setLocalRestaurants(current);
    return data;
  } catch {
    const current = getLocalRestaurants().map(r => r.id === id ? { ...r, ...entry } : r);
    setLocalRestaurants(current);
    return { ...entry, id };
  }
}

export async function deleteRestaurant(id) {
  try {
    await checkApi(`/api/restaurants/${id}`, { method: 'DELETE' });
  } catch {
    // offline fallback
  }
  const current = getLocalRestaurants().filter(r => r.id !== id);
  setLocalRestaurants(current);
  return id;
}

// Fetch City Boundary GeoJSON with local cache
export async function getCityBoundaryData(cityName, coords) {
  if (!cityName) return null;
  const cleanCity = cityName.trim();
  const slug = cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Check localStorage cache
  try {
    const localCached = localStorage.getItem(`${STORAGE_KEY_BOUNDARIES}_${slug}`);
    if (localCached) {
      return JSON.parse(localCached);
    }
  } catch {}

  // Fetch from server API
  try {
    const query = new URLSearchParams({
      city: cleanCity,
      lat: coords?.lat || '',
      lng: coords?.lng || ''
    });
    const geojson = await checkApi(`/api/boundary?${query.toString()}`);
    if (geojson) {
      try {
        localStorage.setItem(`${STORAGE_KEY_BOUNDARIES}_${slug}`, JSON.stringify(geojson));
      } catch {}
      return geojson;
    }
  } catch (err) {
    // console.warn(`Failed to fetch boundary from server for ${cityName}:`, err.message);
  }

  // Check static bundled boundary file in /boundaries/${slug}.json or ./boundaries/${slug}.json
  try {
    const staticRes = await fetch(`./boundaries/${slug}.json`);
    if (staticRes.ok) {
      const geojson = await staticRes.json();
      if (geojson) {
        try {
          localStorage.setItem(`${STORAGE_KEY_BOUNDARIES}_${slug}`, JSON.stringify(geojson));
        } catch {}
        return geojson;
      }
    }
  } catch {}

  // Client-side fetch directly to OpenStreetMap Nominatim for live boundary
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanCity)}&polygon_geojson=1&format=json&limit=5`;
    const nomRes = await fetch(nomUrl);
    if (nomRes.ok) {
      const list = await nomRes.json();
      const polygonItem = list.find(item => item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon'));
      if (polygonItem) {
        const feature = {
          type: "Feature",
          properties: { name: cleanCity, display_name: polygonItem.display_name },
          geometry: polygonItem.geojson
        };
        try {
          localStorage.setItem(`${STORAGE_KEY_BOUNDARIES}_${slug}`, JSON.stringify(feature));
        } catch {}
        return feature;
      }
    }
  } catch {}

  // Fallback to client-side circular polygon
  const lat = coords?.lat || 40.7128;
  const lng = coords?.lng || -74.0060;
  const points = 36;
  const polyCoords = [];
  const radiusKm = 6.5;
  const distanceX = radiusKm / (111.320 * Math.cos(lat * Math.PI / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    polyCoords.push([lng + x, lat + y]);
  }

  const fallbackGeo = {
    type: "Feature",
    properties: { name: cleanCity, isFallback: true },
    geometry: {
      type: "Polygon",
      coordinates: [polyCoords]
    }
  };

  return fallbackGeo;
}

export async function getWishlist() {
  try {
    const data = await checkApi('/api/wishlist');
    setLocalWishlist(data);
    return data;
  } catch {
    return getLocalWishlist();
  }
}

export async function addWishlistItem(item) {
  try {
    const data = await checkApi('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const current = getLocalWishlist();
    setLocalWishlist([data, ...current]);
    return data;
  } catch {
    const newItem = { ...item, id: 'wish-' + Date.now() };
    const current = getLocalWishlist();
    setLocalWishlist([newItem, ...current]);
    return newItem;
  }
}

export async function deleteWishlistItem(id) {
  try {
    await checkApi(`/api/wishlist/${id}`, { method: 'DELETE' });
  } catch {}
  const current = getLocalWishlist().filter(w => w.id !== id);
  setLocalWishlist(current);
  return id;
}

export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export async function clearAllData() {
  try {
    await checkApi('/api/clear-all', { method: 'POST' });
  } catch {}
  setLocalRestaurants([]);
  setLocalWishlist([]);
  return { restaurants: [], wishlist: [] };
}

// Autocomplete Places API
export async function searchPlacesApi(query, cityContext = '') {
  if (!query || query.trim().length < 2) return [];
  try {
    const q = new URLSearchParams({ q: query, city: cityContext });
    return await checkApi(`/api/search-places?${q.toString()}`);
  } catch {
    // Client fallback to Photon directly if server unreachable
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        return (data.features || []).map((f, i) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const city = p.city || p.town || p.county || '';
          return {
            id: `client-${i}`,
            name: p.name || query,
            city: city,
            state: p.state || '',
            country: p.country || '',
            displayName: [p.name, p.street, city, p.state, p.country].filter(Boolean).join(', '),
            lat: coords[1],
            lng: coords[0]
          };
        });
      }
    } catch {}
    return [];
  }
}

// Autocomplete Cities API
export async function searchCitiesApi(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const q = new URLSearchParams({ q: query });
    return await checkApi(`/api/search-cities?${q.toString()}`);
  } catch {
    // Client-side fallback to Photon for cities
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        const seen = new Set();
        const cities = [];
        (data.features || []).forEach((f, i) => {
          const p = f.properties || {};
          const cityName = p.city || p.town || p.name;
          const country = p.country || '';
          if (cityName) {
            const key = `${cityName.toLowerCase()}|${country.toLowerCase()}`;
            if (!seen.has(key)) {
              seen.add(key);
              const coords = f.geometry?.coordinates || [0, 0];
              cities.push({
                id: `client-city-${i}`,
                name: cityName,
                city: cityName,
                country: country,
                displayName: [cityName, p.state, country].filter(Boolean).join(', '),
                lat: coords[1],
                lng: coords[0]
              });
            }
          }
        });
        return cities;
      }
    } catch {}
    return [];
  }
}
