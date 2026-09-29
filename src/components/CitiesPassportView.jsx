import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Star, 
  Sparkles, 
  Compass, 
  Stamp, 
  Search, 
  ExternalLink, 
  ChevronRight,
  Plane,
  PlusCircle,
  Eye
} from 'lucide-react';
import { getCityBoundaryData } from '../services/api';

const STAMP_COLORS = [
  { border: 'border-rose-700/80 dark:border-rose-500/80', text: 'text-rose-800 dark:text-rose-300', bg: 'bg-rose-50/70 dark:bg-rose-950/20' },
  { border: 'border-blue-700/80 dark:border-blue-500/80', text: 'text-blue-800 dark:text-blue-300', bg: 'bg-blue-50/70 dark:bg-blue-950/20' },
  { border: 'border-emerald-700/80 dark:border-emerald-500/80', text: 'text-emerald-800 dark:text-emerald-300', bg: 'bg-emerald-50/70 dark:bg-emerald-950/20' },
  { border: 'border-amber-700/80 dark:border-amber-500/80', text: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-50/70 dark:bg-amber-950/20' },
  { border: 'border-purple-700/80 dark:border-purple-500/80', text: 'text-purple-800 dark:text-purple-300', bg: 'bg-purple-50/70 dark:bg-purple-950/20' }
];

export default function CitiesPassportView({ 
  restaurants = [], 
  onSelectCityFilter,
  onOpenAddModal 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const boundaryLayersRef = useRef(new Map());

  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearch, setCitySearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('map'); // 'map' | 'stamps'
  const [boundariesData, setBoundariesData] = useState({});
  const [loadingBoundary, setLoadingBoundary] = useState(false);

  // Aggregate cities data from restaurants
  const citiesData = useMemo(() => {
    const map = new Map();

    restaurants.forEach(r => {
      const cityKey = (r.city || '').trim();
      if (!cityKey) return;

      if (!map.has(cityKey)) {
        map.set(cityKey, {
          cityName: cityKey,
          country: r.country || '',
          lat: r.lat || 40.7128,
          lng: r.lng || -74.0060,
          restaurants: [],
          cuisines: new Set(),
          earliestDate: r.dateVisited,
          latestDate: r.dateVisited,
          avgRating: 0
        });
      }

      const cityObj = map.get(cityKey);
      cityObj.restaurants.push(r);
      if (r.cuisineName) cityObj.cuisines.add(r.cuisineName);

      if (r.dateVisited) {
        if (!cityObj.earliestDate || r.dateVisited < cityObj.earliestDate) {
          cityObj.earliestDate = r.dateVisited;
        }
        if (!cityObj.latestDate || r.dateVisited > cityObj.latestDate) {
          cityObj.latestDate = r.dateVisited;
        }
      }
    });

    const list = Array.from(map.values()).map(c => {
      const totalScore = c.restaurants.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
      c.avgRating = (totalScore / c.restaurants.length).toFixed(1);
      c.uniqueCuisinesCount = c.cuisines.size;
      return c;
    });

    list.sort((a, b) => b.restaurants.length - a.restaurants.length);
    return list;
  }, [restaurants]);

  // Unique countries count
  const countriesCount = useMemo(() => {
    const set = new Set();
    citiesData.forEach(c => {
      if (c.country) set.add(c.country);
    });
    return set.size;
  }, [citiesData]);

  // Filtered cities list
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return citiesData;
    const q = citySearch.toLowerCase();
    return citiesData.filter(c => 
      c.cityName.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q)
    );
  }, [citiesData, citySearch]);

  // Pre-load boundaries for all visited cities
  useEffect(() => {
    async function loadAllBoundaries() {
      const newBoundaries = {};
      for (const city of citiesData) {
        try {
          const boundary = await getCityBoundaryData(city.cityName, { lat: city.lat, lng: city.lng });
          if (boundary) {
            newBoundaries[city.cityName] = boundary;
          }
        } catch (e) {
          console.warn(`Could not load boundary for ${city.cityName}`);
        }
      }
      setBoundariesData(newBoundaries);
    }

    if (citiesData.length > 0) {
      loadAllBoundaries();
    }
  }, [citiesData]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [38.0, -10.0],
        zoom: 2.5,
        minZoom: 2,
        maxZoom: 18,
        scrollWheelZoom: true
      });

      // CartoDB Voyager tiles with CARTO API key (removes watermark)
      L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_42r5_1_fb69abc4f4394e1cf6200ee0', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Markers & Glowing City Boundaries on the Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Clear old boundary layers
    boundaryLayersRef.current.forEach(layer => layer.remove());
    boundaryLayersRef.current.clear();

    const bounds = [];

    // Render boundary polygons and pins for each visited city
    citiesData.forEach(city => {
      if (city.lat && city.lng) {
        bounds.push([city.lat, city.lng]);

        const isSelected = selectedCity?.cityName === city.cityName;

        // Render GeoJSON Boundary Polygon if available
        const geojson = boundariesData[city.cityName];
        if (geojson) {
          try {
            // If selected, add an ambient neon halo layer first for intense glow
            if (isSelected) {
              const haloLayer = L.geoJSON(geojson, {
                style: () => ({
                  color: '#ff1e56',
                  weight: 16,
                  opacity: 0.45,
                  fill: false,
                  lineCap: 'round',
                  lineJoin: 'round'
                })
              }).addTo(map);
              boundaryLayersRef.current.set(`${city.cityName}_halo`, haloLayer);
            }

            const boundaryLayer = L.geoJSON(geojson, {
              style: () => ({
                className: isSelected ? 'active-glowing-city-boundary' : 'visited-city-boundary',
                color: isSelected ? '#ff1e56' : '#e11d48',
                weight: isSelected ? 4.5 : 2.5,
                opacity: isSelected ? 1 : 0.7,
                fillColor: isSelected ? '#ff2d55' : '#f43f5e',
                fillOpacity: isSelected ? 0.36 : 0.14
              })
            }).addTo(map);

            if (isSelected) {
              boundaryLayer.bringToFront();
            }

            boundaryLayer.on('click', () => {
              handleCityClick(city);
            });

            boundaryLayersRef.current.set(city.cityName, boundaryLayer);
          } catch (e) {
            console.warn('Leaflet geojson error:', e);
          }
        }

        // Custom HTML Marker Pin
        const pinHtml = `
          <div class="custom-couple-pin">
            <div class="pin-bubble" style="${isSelected ? 'background: #ff1e56; transform: scale(1.25); box-shadow: 0 0 20px #ff2d55;' : ''}">
              <span>🍷</span>
            </div>
            <div class="pin-city-badge" style="margin-top: 6px; margin-left: -15px; ${isSelected ? 'background: #ff1e56; color: white;' : ''}">
              <span>${city.cityName}</span>
              <span style="background: rgba(255,255,255,0.25); border-radius: 99px; padding: 1px 5px; font-size: 9px;">${city.restaurants.length}</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: pinHtml,
          className: 'couple-marker-wrapper',
          iconSize: [40, 40],
          iconAnchor: [20, 36],
          popupAnchor: [0, -36]
        });

        const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          handleCityClick(city);
        });

        markersRef.current.push(marker);
      }
    });

    // Render individual restaurant dot markers specifically where each restaurant is located
    restaurants.forEach(r => {
      if (r.lat && r.lng) {
        bounds.push([r.lat, r.lng]);

        const isCurrentCity = selectedCity?.cityName?.toLowerCase() === r.city?.toLowerCase();

        const dotHtml = `
          <div class="restaurant-map-dot-wrapper">
            <div class="restaurant-map-dot ${isCurrentCity ? 'highlighted-city-dot' : ''}">
              <div class="dot-core"></div>
              <div class="dot-ping"></div>
            </div>
            <span class="restaurant-dot-label">${r.name}</span>
          </div>
        `;

        const dotIcon = L.divIcon({
          html: dotHtml,
          className: 'restaurant-dot-marker',
          iconSize: [100, 36],
          iconAnchor: [50, 9],
          popupAnchor: [0, -10]
        });

        const restMarker = L.marker([r.lat, r.lng], { icon: dotIcon }).addTo(map);

        const popupHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 230px; padding: 12px; background: white; border-radius: 14px;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2;">${r.name}</h4>
              <span style="font-size: 11px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 6px; white-space: nowrap;">★ ${r.rating || '5.0'}</span>
            </div>
            <div style="font-size: 11px; color: #e11d48; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              <span>${r.cuisineFlag || '🍽️'}</span>
              <span>${r.cuisineName || 'Restaurant'}</span>
              <span style="color: #cbd5e1;">•</span>
              <span style="color: #64748b;">${r.priceLevel || '$$'}</span>
            </div>
            ${(r.herFavoriteDish || r.hisFavoriteDish || r.sharedDish) ? `
              <div style="font-size: 11px; color: #334155; background: #f8fafc; padding: 6px 8px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 8px;">
                ${r.herFavoriteDish ? `<div style="margin-bottom: 2px;"><strong style="color: #0f172a;">Loved:</strong> ${r.herFavoriteDish}</div>` : ''}
                ${r.hisFavoriteDish ? `<div style="margin-bottom: 2px;"><strong style="color: #0f172a;">Loved:</strong> ${r.hisFavoriteDish}</div>` : ''}
                ${r.sharedDish ? `<div><strong style="color: #0f172a;">Shared:</strong> ${r.sharedDish}</div>` : ''}
              </div>
            ` : ''}
            <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 4px;">
              <span>📍 ${r.city}</span>
              <span>${r.dateVisited || ''}</span>
            </div>
          </div>
        `;

        restMarker.bindPopup(popupHtml, { closeButton: false, offset: [0, -6] });

        restMarker.on('click', () => {
          const cityObj = citiesData.find(c => c.cityName.toLowerCase() === (r.city || '').toLowerCase());
          if (cityObj && selectedCity?.cityName !== cityObj.cityName) {
            setSelectedCity(cityObj);
          }
        });

        markersRef.current.push(restMarker);
      }
    });

    // Auto-fit bounds on initial load if no city selected
    if (!selectedCity && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    } else if (!selectedCity && bounds.length === 1) {
      map.setView(bounds[0], 5);
    }
  }, [citiesData, boundariesData, selectedCity]);

  // Click on a city: zoom into it, activate the glowing boundary!
  const handleCityClick = async (city) => {
    setSelectedCity(city);
    const map = mapInstanceRef.current;
    if (!map) return;

    let geojson = boundariesData[city.cityName];
    if (!geojson) {
      setLoadingBoundary(true);
      geojson = await getCityBoundaryData(city.cityName, { lat: city.lat, lng: city.lng });
      if (geojson) {
        setBoundariesData(prev => ({ ...prev, [city.cityName]: geojson }));
      }
      setLoadingBoundary(false);
    }

    if (geojson) {
      try {
        const tempLayer = L.geoJSON(geojson);
        if (tempLayer.getBounds().isValid()) {
          map.fitBounds(tempLayer.getBounds(), { padding: [45, 45], maxZoom: 13, animate: true, duration: 1.2 });
          return;
        }
      } catch (err) {}
    }

    const layer = boundaryLayersRef.current.get(city.cityName);
    if (layer && layer.getBounds().isValid()) {
      map.fitBounds(layer.getBounds(), { padding: [45, 45], maxZoom: 13, animate: true, duration: 1.2 });
    } else if (city.lat && city.lng) {
      map.setView([city.lat, city.lng], 11, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Top Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/40">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Travel &amp; Food Footprint</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Cities We’ve Been To
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Every city you’ve visited. Click any city to make its boundaries glow on the map and see your dining spots!
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                {citiesData.length}
              </span>
              <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                Cities
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-rose-300">
                {countriesCount}
              </span>
              <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                Countries
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-emerald-300">
                {restaurants.length}
              </span>
              <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                Restaurants
              </span>
            </div>
          </div>
        </div>

        {/* View toggle tabs */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-black/30 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'map' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Interactive Map (Glowing Boundaries)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('stamps')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'stamps' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Stamp className="w-4 h-4" />
              <span>Passport Stamp Board</span>
            </button>
          </div>

          {/* Quick city search */}
          {citiesData.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search visited cities..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Visited Cities Quick Selector Strip */}
      {citiesData.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Click To Glow City:
          </span>
          {citiesData.map(city => {
            const isSelected = selectedCity?.cityName === city.cityName;
            return (
              <button
                key={city.cityName}
                onClick={() => handleCityClick(city)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-300 scale-105'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <span>📍 {city.cityName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-500'
                }`}>
                  {city.restaurants.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 1. Interactive Map View with Glowing City Boundaries */}
      <div className={`space-y-4 ${activeSubTab === 'map' ? 'block' : 'hidden'}`}>
        <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-900">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[540px] z-10"
            style={{ background: '#f8fafc' }}
          />

          {/* Top Instruction Pill */}
          <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Click any city pin or boundary to light it up</span>
          </div>

          {/* Empty state overlay on map if 0 cities */}
          {citiesData.length === 0 && (
            <div className="absolute inset-0 z-30 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl">
                🗺️
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-2xl font-serif font-bold">Your Travel Map Is Ready</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  You haven't logged any restaurants yet! As soon as you add a restaurant, the city will appear on this map with its full glowing boundaries.
                </p>
              </div>
              <button
                onClick={onOpenAddModal}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Your First Restaurant</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Retro Passport Stamp Collection */}
      <div className={`space-y-4 ${activeSubTab === 'stamps' ? 'block' : 'hidden'}`}>
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCities.map((city, idx) => {
              const colorScheme = STAMP_COLORS[idx % STAMP_COLORS.length];
              const isSelected = selectedCity?.cityName === city.cityName;

              const topSpot = city.restaurants.reduce((prev, curr) => 
                (curr.rating > prev.rating) ? curr : prev, city.restaurants[0]
              );

              return (
                <div
                  key={city.cityName}
                  onClick={() => {
                    handleCityClick(city);
                    setActiveSubTab('map');
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border-2 border-dashed transition-all duration-300 relative group overflow-hidden ${
                    colorScheme.border
                  } ${colorScheme.bg} ${
                    isSelected 
                      ? 'ring-4 ring-rose-500 shadow-xl scale-[1.02]' 
                      : 'hover:shadow-lg hover:-translate-y-1'
                  }`}
                  style={{
                    transform: isSelected ? 'scale(1.02)' : `rotate(${(idx % 3 - 1) * 0.75}deg)`
                  }}
                >
                  <div className="flex items-center justify-between border-b border-current pb-2.5 opacity-85">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                        PASSPORT CONTROL
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-current">
                      ENTRY #{idx + 1}
                    </span>
                  </div>

                  <div className="my-4">
                    <h4 className="text-2xl font-mono font-black tracking-wider uppercase text-stone-900 dark:text-white leading-tight">
                      {city.cityName}
                    </h4>
                    <p className="text-xs font-mono font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 mt-0.5">
                      {city.country || 'Destination'}
                    </p>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] text-stone-700 dark:text-stone-300 border-t border-dashed border-current/40 pt-2.5">
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">FOOD STOPS LOGGED:</span>
                      <span className="font-bold">{city.restaurants.length} {city.restaurants.length === 1 ? 'SPOT' : 'SPOTS'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="opacity-80">CUISINES TASTED:</span>
                      <span className="font-bold">{city.uniqueCuisinesCount} TRADITIONS</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="opacity-80">AVG RATING:</span>
                      <span className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        ★ {city.avgRating}
                      </span>
                    </div>
                  </div>

                  {topSpot && (topSpot.herFavoriteDish || topSpot.hisFavoriteDish || topSpot.sharedDish) && (
                    <div className="mt-3 p-2 rounded-lg bg-white/70 dark:bg-black/40 border border-current/20 text-[10px] font-sans">
                      <span className="font-bold text-stone-800 dark:text-stone-200">Highlight Bite: </span>
                      <span className="text-stone-600 dark:text-stone-300 italic">
                        {topSpot.herFavoriteDish || topSpot.hisFavoriteDish || topSpot.sharedDish}
                      </span>
                    </div>
                  )}

                  <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-current/30 text-[10px] font-mono">
                    <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                      <Sparkles className="w-3 h-3" />
                      VERIFIED VISIT
                    </span>
                    <span className="opacity-60 group-hover:opacity-100 flex items-center gap-0.5">
                      Light up on map <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 text-center border border-dashed border-stone-300 dark:border-stone-800 max-w-md mx-auto space-y-3">
            <span className="text-4xl block">✈️</span>
            <h4 className="font-serif font-bold text-lg">No Passport Stamps Yet</h4>
            <p className="text-xs text-stone-500">
              When you log a restaurant in a new city, an official vintage border stamp will appear here!
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              + Log Restaurant
            </button>
          </div>
        )}
      </div>

      {/* Selected City Detail Showcase Card */}
      {selectedCity && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border-2 border-rose-300 dark:border-rose-800 shadow-xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">✨</span>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                  {selectedCity.cityName}{selectedCity.country ? `, ${selectedCity.country}` : ''}
                </h3>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                  Boundaries Glowing 🌟
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                You’ve shared {selectedCity.restaurants.length} meals across {selectedCity.uniqueCuisinesCount} ethnic traditions here.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectCityFilter(selectedCity.cityName)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Filter Food Journal for {selectedCity.cityName} →
              </button>
              <button
                onClick={() => setSelectedCity(null)}
                className="px-3 py-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>

          {/* Restaurant Cards in this glowing City */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCity.restaurants.map(rest => (
              <div 
                key={rest.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {rest.name}
                    </h5>
                    <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      <span>{rest.cuisineFlag}</span>
                      <span>{rest.cuisineName}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rest.rating}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-stone-600 dark:text-stone-300">
                  {rest.herFavoriteDish && (
                    <p><strong>My Favorite:</strong> {rest.herFavoriteDish}</p>
                  )}
                  {rest.hisFavoriteDish && (
                    <p><strong>His Favorite:</strong> {rest.hisFavoriteDish}</p>
                  )}
                  {rest.sharedDish && (
                    <p><strong>Shared:</strong> {rest.sharedDish}</p>
                  )}
                </div>

                {rest.storyNotes && (
                  <p className="text-[11px] italic text-stone-500 dark:text-stone-400 line-clamp-2 border-l-2 border-rose-300 pl-2">
                    “{rest.storyNotes}”
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
