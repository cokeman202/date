import { DEFAULT_RESTAURANTS, DEFAULT_WISHLIST } from '../data/defaultData';
import { CITY_COORDINATES } from '../../server/geocode';

export const DEFAULT_CLOUD_URL = 'https://gist.githubusercontent.com/cokeman202/0103ec70fc7c6a8826ae5519fbe78fe6/raw/journal.json';
export const DEFAULT_GIST_WEB_URL = 'https://gist.github.com/cokeman202/0103ec70fc7c6a8826ae5519fbe78fe6';
const STORAGE_KEY_CLOUD_URL = 'palate_cloud_url';
const STORAGE_KEY_GITHUB_TOKEN = 'palate_github_token';

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
export function getLocalRestaurants() {
  const data = localStorage.getItem(STORAGE_KEY_REST);
  if (!data) return DEFAULT_RESTAURANTS;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_RESTAURANTS;
  }
}

export function setLocalRestaurants(items) {
  localStorage.setItem(STORAGE_KEY_REST, JSON.stringify(items));
}

export function getLocalWishlist() {
  const data = localStorage.getItem(STORAGE_KEY_WISH);
  if (!data) return DEFAULT_WISHLIST;
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_WISHLIST;
  }
}

export function setLocalWishlist(list) {
  localStorage.setItem(STORAGE_KEY_WISH, JSON.stringify(list));
}

export function getCloudSyncUrl() {
  return localStorage.getItem(STORAGE_KEY_CLOUD_URL) || DEFAULT_CLOUD_URL;
}

export function setCloudSyncUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY_CLOUD_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_CLOUD_URL, url.trim());
  }
}

export function getGitHubToken() {
  return localStorage.getItem(STORAGE_KEY_GITHUB_TOKEN) || '';
}

export function setGitHubToken(token) {
  if (!token || !token.trim()) {
    localStorage.removeItem(STORAGE_KEY_GITHUB_TOKEN);
  } else {
    localStorage.setItem(STORAGE_KEY_GITHUB_TOKEN, token.trim());
  }
}

// Fetch latest data from configured Cloud URL (GitHub Gist, Pastebin, etc.)
export async function fetchFromCloud(customUrl = null) {
  const targetUrl = (customUrl || getCloudSyncUrl()).trim();
  if (!targetUrl) throw new Error('No Cloud Sync URL provided');

  // Add cache buster query parameter so browsers never use stale cache
  const hasQuery = targetUrl.includes('?');
  const fetchUrl = `${targetUrl}${hasQuery ? '&' : '?'}t=${Date.now()}`;

  const res = await fetch(fetchUrl, {
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from cloud: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.restaurants)) {
    throw new Error('Invalid JSON format: expected object with "restaurants" array');
  }

  // Update localStorage with fresh cloud data
  setLocalRestaurants(data.restaurants);
  if (Array.isArray(data.wishlist)) {
    setLocalWishlist(data.wishlist);
  }

  return {
    restaurants: data.restaurants,
    wishlist: data.wishlist || []
  };
}

// Push to GitHub Gist using personal access token
export async function pushToGitHubGist(restaurants, wishlist) {
  const token = getGitHubToken();
  if (!token) throw new Error('No GitHub token configured. Please enter a token with "gist" scope.');

  const cloudUrl = getCloudSyncUrl();
  const match = cloudUrl.match(/gist\.github(?:usercontent)?\.com\/[^/]+\/([a-f0-9]+)/i);
  if (!match) throw new Error('Cloud URL must be a GitHub Gist URL to use 1-click auto push');

  const gistId = match[1];
  const payload = {
    restaurants: restaurants || getLocalRestaurants(),
    wishlist: wishlist || getLocalWishlist(),
    updatedAt: new Date().toISOString()
  };

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      files: {
        'journal.json': {
          content: JSON.stringify(payload, null, 2)
        }
      }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error HTTP ${res.status}`);
  }

  // Save to local storage as well
  setLocalRestaurants(payload.restaurants);
  setLocalWishlist(payload.wishlist);

  return await res.json();
}

export async function getRestaurants() {
  // 1. Try local Express server if running (dev / local desktop mode)
  try {
    const data = await checkApi('/api/restaurants');
    if (Array.isArray(data) && data.length > 0) {
      setLocalRestaurants(data);
      return data;
    }
  } catch {
    // backend not running or on static GitHub Pages
  }

  // 2. Try fetching real-time data from configured Cloud Gist / Pastebin
  try {
    const cloud = await fetchFromCloud();
    if (cloud && Array.isArray(cloud.restaurants)) {
      return cloud.restaurants;
    }
  } catch {
    // offline or network error, fallback to local storage
  }

  // 3. Fallback to localStorage / defaults
  return getLocalRestaurants();
}

// If token query parameter exists, save to localStorage and clean URL immediately
if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam && tokenParam.startsWith('ghp_')) {
      localStorage.setItem(STORAGE_KEY_GITHUB_TOKEN, tokenParam.trim());
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch {}
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
    const updated = [data, ...current];
    setLocalRestaurants(updated);
    if (getGitHubToken()) {
      pushToGitHubGist(updated, getLocalWishlist()).catch(e => console.warn('Auto-sync error:', e));
    }
    return data;
  } catch {
    const newItem = { ...entry, id: 'rest-' + Date.now() };
    const current = getLocalRestaurants();
    const updated = [newItem, ...current];
    setLocalRestaurants(updated);
    if (getGitHubToken()) {
      pushToGitHubGist(updated, getLocalWishlist()).catch(e => console.warn('Auto-sync error:', e));
    }
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
    if (getGitHubToken()) {
      pushToGitHubGist(current, getLocalWishlist()).catch(e => console.warn('Auto-sync error:', e));
    }
    return data;
  } catch {
    const current = getLocalRestaurants().map(r => r.id === id ? { ...r, ...entry } : r);
    setLocalRestaurants(current);
    if (getGitHubToken()) {
      pushToGitHubGist(current, getLocalWishlist()).catch(e => console.warn('Auto-sync error:', e));
    }
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
  if (getGitHubToken()) {
    pushToGitHubGist(current, getLocalWishlist()).catch(e => console.warn('Auto-sync error:', e));
  }
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
    const updated = [data, ...current];
    setLocalWishlist(updated);
    if (getGitHubToken()) {
      pushToGitHubGist(getLocalRestaurants(), updated).catch(() => {});
    }
    return data;
  } catch {
    const newItem = { ...item, id: 'wish-' + Date.now() };
    const current = getLocalWishlist();
    const updated = [newItem, ...current];
    setLocalWishlist(updated);
    if (getGitHubToken()) {
      pushToGitHubGist(getLocalRestaurants(), updated).catch(() => {});
    }
    return newItem;
  }
}

export async function deleteWishlistItem(id) {
  try {
    await checkApi(`/api/wishlist/${id}`, { method: 'DELETE' });
  } catch {}
  const current = getLocalWishlist().filter(w => w.id !== id);
  setLocalWishlist(current);
  if (getGitHubToken()) {
    pushToGitHubGist(getLocalRestaurants(), current).catch(() => {});
  }
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
