import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Globe2, 
  Calendar, 
  Star, 
  Heart, 
  Sparkles, 
  Camera, 
  Upload, 
  Tag, 
  MessageSquare,
  Search,
  Loader2,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CUISINES_LIST } from '../data/cuisinesList';
import { uploadImage, searchPlacesApi, searchCitiesApi } from '../services/api';

const COMMON_TAGS = [
  "Romantic Date",
  "Hidden Gem",
  "Street Food",
  "Rooftop / Views",
  "Late Night",
  "Outdoor Patio",
  "Cozy Vibe",
  "Celebration",
  "Budget Friendly",
  "Cocktail Bar",
  "Anniversary"
];

// Helper to guess cuisine from restaurant name or keywords
function guessCuisineFromName(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes('cafe') || lower.includes('café') || lower.includes('coffee') || lower.includes('bakery') || lower.includes('espresso') || lower.includes('roasters') || lower.includes('tea room')) return 'cafe';
  if (lower.includes('mcdonald') || lower.includes('burger king') || lower.includes('wendy') || lower.includes('kfc') || lower.includes('subway') || lower.includes('popeyes') || lower.includes('taco bell') || lower.includes('fast food') || lower.includes('five guys') || lower.includes('a&w') || lower.includes('harvey') || lower.includes('drive thru')) return 'fast-food';
  if (lower.includes('mandarin') || lower.includes('dim sum') || lower.includes('dumpling') || lower.includes('wok') || lower.includes('sichuan') || lower.includes('cantonese')) return 'chinese';
  if (lower.includes('sushi') || lower.includes('ramen') || lower.includes('izakaya') || lower.includes('udon') || lower.includes('yakitori') || lower.includes('omakase')) return 'japanese';
  if (lower.includes('pizza') || lower.includes('pasta') || lower.includes('trattoria') || lower.includes('osteria') || lower.includes('cacio') || lower.includes('ristorante')) return 'italian';
  if (lower.includes('taco') || lower.includes('taqueria') || lower.includes('mexican') || lower.includes('burrito') || lower.includes('quesadilla') || lower.includes('mole')) return 'mexican';
  if (lower.includes('thai') || lower.includes('pad thai') || lower.includes('tom yum')) return 'thai';
  if (lower.includes('pho') || lower.includes('banh mi') || lower.includes('vietnamese') || lower.includes('saigon')) return 'vietnamese';
  if (lower.includes('bbq') && lower.includes('korean') || lower.includes('kimchi') || lower.includes('bulgogi') || lower.includes('korean')) return 'korean';
  if (lower.includes('curry') || lower.includes('tandoor') || lower.includes('naan') || lower.includes('masala') || lower.includes('biryani') || lower.includes('indian')) return 'indian';
  if (lower.includes('bistro') || lower.includes('crepe') || lower.includes('french') || lower.includes('brasserie')) return 'french';
  if (lower.includes('tapas') || lower.includes('paella') || lower.includes('spanish')) return 'spanish';
  if (lower.includes('gyro') || lower.includes('souvlaki') || lower.includes('greek') || lower.includes('taverna')) return 'greek';
  if (lower.includes('shawarma') || lower.includes('falafel') || lower.includes('hummus') || lower.includes('kebab') || lower.includes('lebanese')) return 'lebanese';
  if (lower.includes('injera') || lower.includes('ethiopian') || lower.includes('wat') || lower.includes('tibs')) return 'ethiopian';
  if (lower.includes('ceviche') || lower.includes('peruvian') || lower.includes('lomo saltado')) return 'peruvian';
  if (lower.includes('steakhouse') || lower.includes('diner') || lower.includes('tavern') || lower.includes('inn & grill') || lower.includes('sit down')) return 'sit-down-restaurant';
  return null;
}

export default function RestaurantModal({ 
  isOpen, 
  onClose, 
  onSave, 
  restaurantToEdit, 
  existingCities = [] 
}) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    cuisineId: 'italian',
    cuisineName: 'Italian',
    cuisineFlag: '🇮🇹',
    dateVisited: new Date().toISOString().split('T')[0],
    rating: 5,
    priceLevel: '$$',
    whoPicked: 'Both of Us',
    herFavoriteDish: '',
    hisFavoriteDish: '',
    sharedDish: '',
    storyNotes: '',
    tags: [],
    photoUrl: '',
    wouldReturn: true,
    lat: null,
    lng: null
  });

  const [customTagInput, setCustomTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  // Autocomplete state
  const [restaurantSuggestions, setRestaurantSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const placeSearchTimerRef = useRef(null);
  const citySearchTimerRef = useRef(null);

  useEffect(() => {
    if (restaurantToEdit) {
      setFormData({
        ...restaurantToEdit,
        tags: restaurantToEdit.tags || []
      });
    } else {
      setFormData({
        name: '',
        city: existingCities.length > 0 ? existingCities[0] : '',
        country: '',
        cuisineId: 'italian',
        cuisineName: 'Italian',
        cuisineFlag: '🇮🇹',
        dateVisited: new Date().toISOString().split('T')[0],
        rating: 5,
        priceLevel: '$$',
        whoPicked: 'Both of Us',
        herFavoriteDish: '',
        hisFavoriteDish: '',
        sharedDish: '',
        storyNotes: '',
        tags: ['Romantic Date'],
        photoUrl: '',
        wouldReturn: true,
        lat: null,
        lng: null
      });
    }
    setRestaurantSuggestions([]);
    setCitySuggestions([]);
    setShowPlaceDropdown(false);
    setShowCityDropdown(false);
  }, [restaurantToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle typing in Restaurant Name input with autocomplete
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, name: val }));

    if (placeSearchTimerRef.current) clearTimeout(placeSearchTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingPlaces(true);
      setShowPlaceDropdown(true);

      placeSearchTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchPlacesApi(val, formData.city);
          setRestaurantSuggestions(results);
        } catch {
          setRestaurantSuggestions([]);
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 250);
    } else {
      setRestaurantSuggestions([]);
      setShowPlaceDropdown(false);
      setIsSearchingPlaces(false);
    }
  };

  // Select place from autocomplete
  const handleSelectPlace = (place) => {
    const inferredCuisineId = guessCuisineFromName(place.name);
    let matchedCuisine = null;
    if (inferredCuisineId) {
      matchedCuisine = CUISINES_LIST.find(c => c.id === inferredCuisineId);
    }

    setFormData(prev => ({
      ...prev,
      name: place.name || prev.name,
      city: place.city || prev.city,
      country: place.country || prev.country,
      lat: place.lat || prev.lat,
      lng: place.lng || prev.lng,
      ...(matchedCuisine ? {
        cuisineId: matchedCuisine.id,
        cuisineName: matchedCuisine.name,
        cuisineFlag: matchedCuisine.flag
      } : {})
    }));

    setShowPlaceDropdown(false);
    setRestaurantSuggestions([]);
  };

  // Handle typing in City input with autocomplete
  const handleCityChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, city: val }));

    if (citySearchTimerRef.current) clearTimeout(citySearchTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingCities(true);
      setShowCityDropdown(true);

      citySearchTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchCitiesApi(val);
          setCitySuggestions(results);
        } catch {
          setCitySuggestions([]);
        } finally {
          setIsSearchingCities(false);
        }
      }, 250);
    } else {
      setCitySuggestions([]);
      setShowCityDropdown(false);
      setIsSearchingCities(false);
    }
  };

  // Select city from autocomplete
  const handleSelectCity = (cityObj) => {
    setFormData(prev => ({
      ...prev,
      city: cityObj.cityName || prev.city,
      country: cityObj.country || prev.country,
      lat: cityObj.lat || prev.lat,
      lng: cityObj.lng || prev.lng
    }));

    setShowCityDropdown(false);
    setCitySuggestions([]);
  };

  const handleCuisineSelect = (e) => {
    const selectedId = e.target.value;
    const found = CUISINES_LIST.find(c => c.id === selectedId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        cuisineId: found.id,
        cuisineName: found.name,
        cuisineFlag: found.flag
      }));
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      };
    });
  };

  const addCustomTag = (e) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    if (!formData.tags.includes(customTagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, customTagInput.trim()] }));
    }
    setCustomTagInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim()) {
      alert('Please enter restaurant name and city.');
      return;
    }

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                {restaurantToEdit ? 'Edit Date Night Memory' : 'Log A Date Night Restaurant'}
              </h2>
              <p className="text-xs text-stone-500">
                Type a restaurant or city name for instant live autocomplete!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* Row 1: Restaurant Name with Live Autocomplete & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Restaurant Name *</span>
                <span className="text-[10px] text-rose-500 font-normal">Live Autocomplete ⚡</span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Start typing... e.g. Mandarin, Da Enzo, Shake Shack..."
                  value={formData.name}
                  onChange={handleNameChange}
                  onFocus={() => { if (restaurantSuggestions.length > 0) setShowPlaceDropdown(true); }}
                  autoComplete="off"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-stone-800"
                />
                <div className="absolute right-3 top-3 text-stone-400 pointer-events-none">
                  {isSearchingPlaces ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Restaurant Autocomplete Dropdown */}
              {showPlaceDropdown && restaurantSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden divide-y divide-stone-100 dark:divide-stone-700 max-h-60 overflow-y-auto">
                  {restaurantSuggestions.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => handleSelectPlace(place)}
                      className="p-3 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors flex items-start gap-2.5"
                    >
                      <span className="text-base mt-0.5">🍽️</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                            {place.name}
                          </p>
                          {place.type && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 shrink-0">
                              {place.type}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                          {place.displayName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1 h-[42px] px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 focus:outline-none"
                  >
                    <Star 
                      className={`w-5 h-5 transition-colors ${
                        star <= formData.rating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-stone-300 dark:text-stone-600'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: City with Live Autocomplete & Ethnic Cuisine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                <span>City Visited *</span>
                <span className="text-[10px] text-rose-500 font-normal">Glowing Boundary 🌟</span>
              </label>
              
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamilton, Paris, Rome, Tokyo..."
                  value={formData.city}
                  onChange={handleCityChange}
                  onFocus={() => { if (citySuggestions.length > 0) setShowCityDropdown(true); }}
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-stone-800"
                />
                <div className="absolute right-3 top-3 text-stone-400 pointer-events-none">
                  {isSearchingCities && <Loader2 className="w-4 h-4 animate-spin text-rose-500" />}
                </div>
              </div>

              {/* City Autocomplete Dropdown */}
              {showCityDropdown && citySuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden divide-y divide-stone-100 dark:divide-stone-700 max-h-52 overflow-y-auto">
                  {citySuggestions.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCity(c)}
                      className="p-3 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors flex items-center gap-2.5"
                    >
                      <span className="text-base">📍</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {c.cityName}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {c.displayName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {existingCities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-stone-400 self-center">Past cities:</span>
                  {existingCities.slice(0, 4).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, city: c }))}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300 text-stone-600 dark:text-stone-300 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Cuisine &amp; Dining Option *
              </label>
              <div className="relative">
                <select
                  value={formData.cuisineId}
                  onChange={handleCuisineSelect}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none font-medium"
                >
                  {CUISINES_LIST.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name} ({c.region})
                    </option>
                  ))}
                </select>
                <Globe2 className="absolute right-3.5 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 3: Date, Price & Who Picked */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Date Visited
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="date"
                  value={formData.dateVisited}
                  onChange={e => setFormData({ ...formData, dateVisited: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Price Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['$', '$$', '$$$', '$$$$'].map(price => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => setFormData({ ...formData, priceLevel: price })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      formData.priceLevel === price
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Who Picked This Spot?
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['Me', 'My Boyfriend', 'Both of Us'].map(picker => (
                  <button
                    key={picker}
                    type="button"
                    onClick={() => setFormData({ ...formData, whoPicked: picker })}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium truncate transition-all ${
                      formData.whoPicked === picker
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {picker}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Dishes Loved */}
          <div className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              What Did You Both Order &amp; Love?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  My Favorite Dish
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cacio e Pepe, Spicy Tuna Crispy Rice..."
                  value={formData.herFavoriteDish}
                  onChange={e => setFormData({ ...formData, herFavoriteDish: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  His Favorite Dish
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rigatoni Carbonara, Otoro Nigiri..."
                  value={formData.hisFavoriteDish}
                  onChange={e => setFormData({ ...formData, hisFavoriteDish: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Shared Dish, Dessert, or Bottle of Wine
              </label>
              <input
                type="text"
                placeholder="e.g. Strawberry Tiramisu, Mezcal Flight, Garlic Naan..."
                value={formData.sharedDish}
                onChange={e => setFormData({ ...formData, sharedDish: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Date Night Memory */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              Memory &amp; Story Notes
            </label>
            <textarea
              rows={3}
              placeholder="What made this date night memorable? (e.g. Sat under fairy lights, the rainstorm, funny moments, late night stroll...)"
              value={formData.storyNotes}
              onChange={e => setFormData({ ...formData, storyNotes: e.target.value })}
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Photo Upload or URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-stone-400" />
              Photo of Food or Date Selfie
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/60 transition-colors text-xs font-semibold text-stone-700 dark:text-stone-300">
                <Upload className="w-4 h-4 text-rose-500" />
                <span>{uploading ? 'Uploading...' : 'Upload From Phone / Computer'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  className="hidden" 
                  disabled={uploading}
                />
              </label>
              
              <span className="text-xs text-stone-400">or paste image link:</span>

              <input
                type="url"
                placeholder="https://..."
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full sm:flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {formData.photoUrl && (
              <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photoUrl: '' })}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Vibe Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              Vibe &amp; Date Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {COMMON_TAGS.map(tag => {
                const selected = formData.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                      selected
                        ? 'bg-rose-500 text-white font-semibold shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom tag (e.g. Speakeasy)..."
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustomTag(e); }}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-300"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Would Return Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Would you go back?</span>
              <p className="text-[11px] text-stone-500">Marks this spot with the "Must Return" seal</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, wouldReturn: !formData.wouldReturn })}
              className={`w-12 h-6 flex items-center rounded-full p-1 duration-200 ease-in-out ${
                formData.wouldReturn ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                  formData.wouldReturn ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/25 hover:shadow-lg transition-all"
          >
            {restaurantToEdit ? 'Save Changes' : 'Save To Food Journal ✨'}
          </button>
        </div>

      </div>
    </div>
  );
}
