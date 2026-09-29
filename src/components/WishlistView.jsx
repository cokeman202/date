import React, { useState } from 'react';
import { 
  Bookmark, 
  Plus, 
  MapPin, 
  Globe2, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Compass
} from 'lucide-react';
import { CUISINES_LIST } from '../data/cuisinesList';

export default function WishlistView({ 
  wishlist = [], 
  onAddWishlist, 
  onDeleteWishlist, 
  onConvertToRestaurant 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    restaurant: '',
    cuisine: 'Italian',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.restaurant.trim() || !formData.city.trim()) {
      alert('Please fill out the restaurant and city.');
      return;
    }
    onAddWishlist(formData);
    setFormData({
      city: '',
      country: '',
      restaurant: '',
      cuisine: 'Italian',
      notes: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent p-6 sm:p-8 rounded-3xl border border-amber-200/60 dark:border-amber-900/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Future Adventures</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Our Culinary Bucket List
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg">
            Spots you've bookmarked or saved from travel guides to visit on your next trip!
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{showAddForm ? 'Close Form' : 'Add Dream Spot'}</span>
        </button>
      </div>

      {/* Add New Dream Spot Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-amber-200 dark:border-stone-800 shadow-lg space-y-4 animate-in slide-in-from-top-3 duration-200">
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            New Spot on Your Radar
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                Restaurant or Food Market *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Myeongdong Kyoja..."
                value={formData.restaurant}
                onChange={e => setFormData({ ...formData, restaurant: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                City &amp; Country *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Seoul, South Korea..."
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                Ethnic Cuisine
              </label>
              <select
                value={formData.cuisine}
                onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {CUISINES_LIST.map(c => (
                  <option key={c.id} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              Why do you want to go here? (Must-order dish, who recommended it...)
            </label>
            <input
              type="text"
              placeholder="e.g. Must try their famous knife-cut noodles and dumplings!"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
            >
              Save to Wishlist
            </button>
          </div>
        </form>
      )}

      {/* Wishlist Cards Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                      {item.restaurant}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {item.city}
                      </span>
                      <span>•</span>
                      <span>{item.cuisine}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteWishlist(item.id)}
                    className="text-stone-300 hover:text-red-500 p-1 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.notes && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40 italic">
                    “{item.notes}”
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-400">
                  BUCKET LIST
                </span>
                <button
                  onClick={() => onConvertToRestaurant(item)}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>We Went Here! (Log It)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 text-center border border-dashed border-stone-300 dark:border-stone-800 max-w-md mx-auto space-y-3">
          <span className="text-4xl block">✨</span>
          <h4 className="font-serif font-bold text-lg">Your Wishlist is Clear</h4>
          <p className="text-xs text-stone-500">
            Hear about an amazing restaurant or city you both want to visit? Add it here to build your dream foodie bucket list!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold"
          >
            + Add Dream Spot
          </button>
        </div>
      )}

    </div>
  );
}
