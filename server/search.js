// Places & Cities live search service using Photon (Komoot/OSM) with Nominatim fallback

export async function searchPlaces(query, cityContext = '') {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim();

  // Build query variations (e.g. with city context or without leading "The")
  const searchTerms = [];
  if (cityContext && !clean.toLowerCase().includes(cityContext.toLowerCase())) {
    searchTerms.push(`${clean} ${cityContext}`);
  }
  searchTerms.push(clean);
  if (/^the\s+/i.test(clean)) {
    searchTerms.push(clean.replace(/^the\s+/i, ''));
  }

  // 1. Try Photon API (super fast, designed for typeahead search)
  for (const term of searchTerms) {
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=8`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CouplesFoodPassportApp/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const results = data.features.map((f, idx) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [0, 0];
            const city = p.city || p.town || p.municipality || p.county || '';
            const state = p.state || '';
            const country = p.country || '';
            const street = [p.housenumber, p.street].filter(Boolean).join(' ');

            return {
              id: `photon-${p.osm_id || idx}`,
              name: p.name || clean,
              city: city,
              state: state,
              country: country,
              street: street,
              displayName: [p.name, street, city, state, country].filter(Boolean).join(', '),
              lat: coords[1],
              lng: coords[0],
              type: p.osm_value || 'place'
            };
          });

          // Return results prioritizing restaurants/cafes/amenities or matches with a city
          return results;
        }
      }
    } catch (err) {
      console.warn('Photon error:', err.message);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&format=json&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CouplesFoodPassportApp/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item, idx) => {
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.county || '';
        const name = item.name || item.display_name.split(',')[0].trim();
        return {
          id: `nom-${item.osm_id || idx}`,
          name: name,
          city: city,
          state: addr.state || '',
          country: addr.country || '',
          street: [addr.house_number, addr.road].filter(Boolean).join(' '),
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'place'
        };
      });
    }
  } catch (err) {
    console.warn('Nominatim search error:', err.message);
  }

  return [];
}

export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim();

  // Fix common province/state typos in city searches
  const normalized = clean
    .replace(/\bonterio\b/gi, 'Ontario')
    .replace(/\bfl\b/gi, 'Florida')
    .replace(/\bca\b/gi, 'California')
    .replace(/\bny\b/gi, 'New York');

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalized)}&osm_tag=place:city&osm_tag=place:town&osm_tag=place:municipality&osm_tag=boundary:administrative&limit=6`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CouplesFoodPassportApp/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        return data.features.map((f, idx) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const cityName = p.name || '';
          const state = p.state || '';
          const country = p.country || '';

          return {
            id: `city-${p.osm_id || idx}`,
            cityName: cityName,
            state: state,
            country: country,
            displayName: [cityName, state, country].filter(Boolean).join(', '),
            lat: coords[1],
            lng: coords[0]
          };
        });
      }
    }
  } catch (err) {
    console.warn('City search error:', err.message);
  }

  // Fallback Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalized)}&format=json&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CouplesFoodPassportApp/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item, idx) => {
        const addr = item.address || {};
        const cityName = addr.city || addr.town || addr.municipality || item.name || '';
        return {
          id: `city-nom-${item.osm_id || idx}`,
          cityName: cityName,
          state: addr.state || '',
          country: addr.country || '',
          displayName: [cityName, addr.state, addr.country].filter(Boolean).join(', '),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      });
    }
  } catch (err) {}

  return [];
}
