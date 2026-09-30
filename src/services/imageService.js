// Restaurant & Cuisine Image Search Service
// Supports Wikipedia/Wikimedia Commons API, curated HD culinary photography, and Google / Yelp direct search links.

export const CUISINE_DEFAULT_PHOTOS = {
  // Dining Styles
  "sit-down-restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
  "fast-food": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop",
  "cafe": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop",

  // Mediterranean & Southern Europe
  "italian": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop",
  "greek": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop",
  "spanish": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&auto=format&fit=crop",
  "portuguese": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop",

  // East Asian
  "japanese": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop",
  "korean": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&auto=format&fit=crop",
  "chinese": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop",
  "taiwanese": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop",

  // Southeast Asian
  "thai": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop",
  "vietnamese": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop",
  "filipino": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop",
  "indonesian": "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop",

  // South Asian
  "indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop",
  "pakistani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop",
  "nepalese": "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&auto=format&fit=crop",

  // Latin American & Caribbean
  "mexican": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop",
  "peruvian": "https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop",
  "caribbean": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop",
  "cuban": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop",
  "brazilian": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop",
  "colombian": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop",

  // Middle Eastern & North African
  "lebanese": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop",
  "turkish": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop",
  "persian": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop",
  "moroccan": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop",

  // African
  "ethiopian": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
  "west-african": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop",

  // European
  "french": "https://images.unsplash.com/photo-1502998070258-dc1338445ac2?w=800&auto=format&fit=crop",
  "georgian": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop",
  "german": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop",

  // Regional
  "cajun-creole": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop",
  "hawaiian": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop"
};

const GENERIC_FOOD_PHOTO = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop";

/**
 * Searches Wikipedia & Wikimedia Commons for a real photo of the restaurant or chain.
 */
async function queryWikipediaPhoto(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return null;
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=3&prop=pageimages&pithumbsize=900&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    
    // Find the first page with a high-res thumbnail
    for (const page of pages) {
      if (page.thumbnail?.source) {
        return page.thumbnail.source;
      }
    }
  } catch (err) {
    console.warn('Wikipedia photo search error:', err.message);
  }
  return null;
}

/**
 * Automatically find a photo for a restaurant:
 * 1. Exact restaurant search on Wikipedia (Mandarin, Starbucks, The Keg, etc.)
 * 2. Restaurant + City search
 * 3. Favorite dish search on Wikipedia
 * 4. Fallback to delicious high-res cuisine photography
 */
export async function autoFindRestaurantPhoto({ name, city = '', cuisineId = '', dish = '' }) {
  if (!name && !cuisineId && !dish) return null;

  const cleanName = (name || '').trim();
  const cleanCity = (city || '').trim();

  // Try 1: Search exact restaurant name
  if (cleanName) {
    const photo1 = await queryWikipediaPhoto(cleanName);
    if (photo1) return { url: photo1, source: 'wikipedia', label: `${cleanName} (Wikipedia)` };

    // Try 2: Search with "restaurant" or city
    const photo2 = await queryWikipediaPhoto(`${cleanName} restaurant`);
    if (photo2) return { url: photo2, source: 'wikipedia', label: `${cleanName} (Wikipedia)` };

    if (cleanCity) {
      const photo3 = await queryWikipediaPhoto(`${cleanName} ${cleanCity}`);
      if (photo3) return { url: photo3, source: 'wikipedia', label: `${cleanName} (Wikipedia)` };
    }
  }

  // Try 3: Search dish name if provided
  if (dish && dish.trim()) {
    const dishPhoto = await queryWikipediaPhoto(dish.trim());
    if (dishPhoto) return { url: dishPhoto, source: 'dish', label: `${dish} (Wikipedia)` };
  }

  // Try 4: Return curated high-res culinary photo for the cuisine / dining type
  if (cuisineId && CUISINE_DEFAULT_PHOTOS[cuisineId]) {
    return {
      url: CUISINE_DEFAULT_PHOTOS[cuisineId],
      source: 'curated',
      label: 'Curated Culinary Photo'
    };
  }

  return {
    url: GENERIC_FOOD_PHOTO,
    source: 'generic',
    label: 'Dining Atmosphere'
  };
}

/**
 * Direct Google Images search URL for the user to find photos with 1 click.
 */
export function getGoogleImagesUrl(name, city = '') {
  const query = [name, city, 'restaurant food'].filter(Boolean).join(' ');
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

/**
 * Direct Yelp search URL for the user to find photos with 1 click.
 */
export function getYelpSearchUrl(name, city = '') {
  const loc = city || 'Ontario, Canada';
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(name || 'restaurants')}&find_loc=${encodeURIComponent(loc)}`;
}
