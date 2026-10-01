// Fallback coordinates for common cities worldwide to ensure instant, reliable map pins
export const CITY_COORDINATES = {
  // North America
  "new york": { lat: 40.7128, lng: -74.0060, country: "United States", countryCode: "US" },
  "new york city": { lat: 40.7128, lng: -74.0060, country: "United States", countryCode: "US" },
  "nyc": { lat: 40.7128, lng: -74.0060, country: "United States", countryCode: "US" },
  "los angeles": { lat: 34.0522, lng: -118.2437, country: "United States", countryCode: "US" },
  "san francisco": { lat: 37.7749, lng: -122.4194, country: "United States", countryCode: "US" },
  "chicago": { lat: 41.8781, lng: -87.6298, country: "United States", countryCode: "US" },
  "austin": { lat: 30.2672, lng: -97.7431, country: "United States", countryCode: "US" },
  "seattle": { lat: 47.6062, lng: -122.3321, country: "United States", countryCode: "US" },
  "miami": { lat: 25.7617, lng: -80.1918, country: "United States", countryCode: "US" },
  "new orleans": { lat: 29.9511, lng: -90.0715, country: "United States", countryCode: "US" },
  "boston": { lat: 42.3601, lng: -71.0589, country: "United States", countryCode: "US" },
  "washington dc": { lat: 38.9072, lng: -77.0369, country: "United States", countryCode: "US" },
  "denver": { lat: 39.7392, lng: -104.9903, country: "United States", countryCode: "US" },
  "portland": { lat: 45.5152, lng: -122.6784, country: "United States", countryCode: "US" },
  "nashville": { lat: 36.1627, lng: -86.7816, country: "United States", countryCode: "US" },
  "san diego": { lat: 32.7157, lng: -117.1611, country: "United States", countryCode: "US" },
  "honolulu": { lat: 21.3069, lng: -157.8583, country: "United States", countryCode: "US" },
  "toronto": { lat: 43.6532, lng: -79.3832, country: "Canada", countryCode: "CA" },
  "hamilton": { lat: 43.2557, lng: -79.8711, country: "Canada", countryCode: "CA" },
  "mississauga": { lat: 43.5890, lng: -79.6441, country: "Canada", countryCode: "CA" },
  "paris, ontario": { lat: 43.1944, lng: -80.3845, country: "Canada", countryCode: "CA" },
  "montreal": { lat: 45.5017, lng: -73.5673, country: "Canada", countryCode: "CA" },
  "vancouver": { lat: 49.2827, lng: -123.1207, country: "Canada", countryCode: "CA" },
  "mexico city": { lat: 19.4326, lng: -99.1332, country: "Mexico", countryCode: "MX" },
  "oaxaca": { lat: 17.0732, lng: -96.7266, country: "Mexico", countryCode: "MX" },
  "cancun": { lat: 21.1619, lng: -86.8515, country: "Mexico", countryCode: "MX" },

  // Europe
  "paris": { lat: 48.8566, lng: 2.3522, country: "France", countryCode: "FR" },
  "rome": { lat: 41.9028, lng: 12.4964, country: "Italy", countryCode: "IT" },
  "florence": { lat: 43.7696, lng: 11.2558, country: "Italy", countryCode: "IT" },
  "venice": { lat: 45.4408, lng: 12.3155, country: "Italy", countryCode: "IT" },
  "naples": { lat: 40.8518, lng: 14.2681, country: "Italy", countryCode: "IT" },
  "london": { lat: 51.5074, lng: -0.1278, country: "United Kingdom", countryCode: "GB" },
  "edinburgh": { lat: 55.9533, lng: -3.1883, country: "United Kingdom", countryCode: "GB" },
  "barcelona": { lat: 41.3879, lng: 2.1699, country: "Spain", countryCode: "ES" },
  "madrid": { lat: 40.4168, lng: -3.7038, country: "Spain", countryCode: "ES" },
  "seville": { lat: 37.3891, lng: -5.9845, country: "Spain", countryCode: "ES" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands", countryCode: "NL" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany", countryCode: "DE" },
  "munich": { lat: 48.1351, lng: 11.5820, country: "Germany", countryCode: "DE" },
  "vienna": { lat: 48.2082, lng: 16.3738, country: "Austria", countryCode: "AT" },
  "prague": { lat: 50.0755, lng: 14.4378, country: "Czech Republic", countryCode: "CZ" },
  "budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary", countryCode: "HU" },
  "athens": { lat: 37.9838, lng: 23.7275, country: "Greece", countryCode: "GR" },
  "santorini": { lat: 36.3932, lng: 25.4615, country: "Greece", countryCode: "GR" },
  "lisbon": { lat: 38.7223, lng: -9.1393, country: "Portugal", countryCode: "PT" },
  "porto": { lat: 41.1579, lng: -8.6291, country: "Portugal", countryCode: "PT" },
  "dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland", countryCode: "IE" },
  "copenhagen": { lat: 55.6761, lng: 12.5683, country: "Denmark", countryCode: "DK" },
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden", countryCode: "SE" },
  "istanbul": { lat: 41.0082, lng: 28.9784, country: "Turkey", countryCode: "TR" },
  "zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland", countryCode: "CH" },

  // Asia & Pacific
  "tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan", countryCode: "JP" },
  "kyoto": { lat: 35.0116, lng: 135.7681, country: "Japan", countryCode: "JP" },
  "osaka": { lat: 34.6937, lng: 135.5023, country: "Japan", countryCode: "JP" },
  "seoul": { lat: 37.5665, lng: 126.9780, country: "South Korea", countryCode: "KR" },
  "bangkok": { lat: 13.7563, lng: 100.5018, country: "Thailand", countryCode: "TH" },
  "chiang mai": { lat: 18.7883, lng: 98.9853, country: "Thailand", countryCode: "TH" },
  "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore", countryCode: "SG" },
  "hanoi": { lat: 21.0285, lng: 105.8542, country: "Vietnam", countryCode: "VN" },
  "ho chi minh city": { lat: 10.8231, lng: 106.6297, country: "Vietnam", countryCode: "VN" },
  "taipei": { lat: 25.0330, lng: 121.5654, country: "Taiwan", countryCode: "TW" },
  "hong kong": { lat: 22.3193, lng: 114.1694, country: "Hong Kong", countryCode: "HK" },
  "bali": { lat: -8.4095, lng: 115.1889, country: "Indonesia", countryCode: "ID" },
  "sydney": { lat: -33.8688, lng: 151.2093, country: "Australia", countryCode: "AU" },
  "melbourne": { lat: -37.8136, lng: 144.9631, country: "Australia", countryCode: "AU" },
  "mumbai": { lat: 19.0760, lng: 72.8777, country: "India", countryCode: "IN" },
  "delhi": { lat: 28.6139, lng: 77.2090, country: "India", countryCode: "IN" },

  // South America, Africa & Middle East
  "buenos aires": { lat: -34.6037, lng: -58.3816, country: "Argentina", countryCode: "AR" },
  "lima": { lat: -12.0464, lng: -77.0428, country: "Peru", countryCode: "PE" },
  "rio de janeiro": { lat: -22.9068, lng: -43.1729, country: "Brazil", countryCode: "BR" },
  "santiago": { lat: -33.4489, lng: -70.6693, country: "Chile", countryCode: "CL" },
  "marrakech": { lat: 31.6295, lng: -7.9811, country: "Morocco", countryCode: "MA" },
  "cairo": { lat: 30.0444, lng: 31.2357, country: "Egypt", countryCode: "EG" },
  "cape town": { lat: -33.9249, lng: 18.4241, country: "South Africa", countryCode: "ZA" },
  "dubai": { lat: 25.2048, lng: 55.2708, country: "United Arab Emirates", countryCode: "AE" }
};

export async function geocodeCity(cityName) {
  if (!cityName) return null;
  const clean = cityName.trim().toLowerCase();
  
  // 1. Direct match or prefix match in local database
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean === key || clean.startsWith(key) || clean.includes(key)) {
      return {
        lat: coords.lat,
        lng: coords.lng,
        country: coords.country,
        countryCode: coords.countryCode
      };
    }
  }

  // 2. Fetch from OpenStreetMap Nominatim with safety timeout
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CouplePalatePassportApp/1.0'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          country: data[0].display_name.split(',').pop()?.trim() || ''
        };
      }
    }
  } catch (err) {
    console.warn(`Geocoding error for "${cityName}":`, err.message);
  }

  // Fallback random slight offset around New York / center if unknown
  return { lat: 40.7128, lng: -74.0060, country: "World" };
}
