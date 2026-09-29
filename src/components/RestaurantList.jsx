import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  X, 
  PlusCircle, 
  Sparkles,
  MapPin
} from 'lucide-react';
import RestaurantCard from './RestaurantCard';
import { CUISINES_LIST } from '../data/cuisinesList';

export default function RestaurantList({
  restaurants = [],
  onEdit,
  onDelete,
  onOpenAddModal,
  selectedCityFilter,
  setSelectedCityFilter,
  selectedCuisineFilter,
  setSelectedCuisineFilter
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedPicker, setSelectedPicker] = useState('all');
  const [onlyMustReturn, setOnlyMustReturn] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const uniqueCities = useMemo(() => {
    const set = new Set();
    restaurants.forEach(r => {
      if (r.city) set.add(r.city.trim());
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name?.toLowerCase().includes(q);
        const matchCity = r.city?.toLowerCase().includes(q);
        const matchCuisine = r.cuisineName?.toLowerCase().includes(q);
        const matchHerDish = r.herFavoriteDish?.toLowerCase().includes(q);
        const matchHisDish = r.hisFavoriteDish?.toLowerCase().includes(q);
        const matchShared = r.sharedDish?.toLowerCase().includes(q);
        const matchNotes = r.storyNotes?.toLowerCase().includes(q);
        const matchTags = r.tags?.some(t => t.toLowerCase().includes(q));

        if (!matchName && !matchCity && !matchCuisine && !matchHerDish && !matchHisDish && !matchShared && !matchNotes && !matchTags) {
          return false;
        }
      }

      if (selectedCityFilter && r.city?.toLowerCase() !== selectedCityFilter.toLowerCase()) {
        return false;
      }

      if (selectedCuisineFilter) {
        const matchesId = r.cuisineId?.toLowerCase() === selectedCuisineFilter.toLowerCase();
        const matchesName = r.cuisineName?.toLowerCase() === selectedCuisineFilter.toLowerCase();
        if (!matchesId && !matchesName) return false;
      }

      if (selectedRating !== 'all') {
        if (Number(r.rating) < Number(selectedRating)) return false;
      }

      if (selectedPicker !== 'all') {
        if (selectedPicker === 'Me' && r.whoPicked !== 'Me') return false;
        if (selectedPicker === 'His' && r.whoPicked !== 'My Boyfriend' && r.whoPicked !== 'Him') return false;
        if (selectedPicker === 'Both' && r.whoPicked !== 'Both of Us' && r.whoPicked !== 'Both') return false;
      }

      if (onlyMustReturn && !r.wouldReturn) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.dateVisited || '').localeCompare(a.dateVisited || '');
      }
      if (sortBy === 'oldest') {
        return (a.dateVisited || '').localeCompare(b.dateVisited || '');
      }
      if (sortBy === 'highest_rated') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [
    restaurants, 
    searchQuery, 
    selectedCityFilter, 
    selectedCuisineFilter, 
    selectedRating, 
    selectedPicker, 
    onlyMustReturn, 
    sortBy
  ]);

  const hasActiveFilters = Boolean(
    searchQuery || 
    selectedCityFilter || 
    selectedCuisineFilter || 
    selectedRating !== 'all' || 
    selectedPicker !== 'all' || 
    onlyMustReturn
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCityFilter('');
    setSelectedCuisineFilter('');
    setSelectedRating('all');
    setSelectedPicker('all');
    setOnlyMustReturn(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
        
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by restaurant, city, pasta, sushi, tacos, or memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-stone-800 transition-all text-stone-900 dark:text-stone-100"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Controls: Sort & Grid/Table Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="newest">Date: Most Recent</option>
              <option value="oldest">Date: Earliest First</option>
              <option value="highest_rated">Highest Rated ★</option>
              <option value="name">Restaurant A–Z</option>
            </select>

            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-stone-900 text-rose-600 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                title="Grid Polaroid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-stone-900 text-rose-600 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                title="Compact List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Secondary Filter Chips Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          
          {/* City filter */}
          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              selectedCityFilter 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' 
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
          >
            <option value="">All Cities ({uniqueCities.length})</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Cuisine filter */}
          <select
            value={selectedCuisineFilter}
            onChange={(e) => setSelectedCuisineFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              selectedCuisineFilter 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' 
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
          >
            <option value="">All Ethnic Cuisines</option>
            {CUISINES_LIST.map(c => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </select>

          {/* Picker filter */}
          <select
            value={selectedPicker}
            onChange={(e) => setSelectedPicker(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              selectedPicker !== 'all' 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' 
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
          >
            <option value="all">Who Picked: Everyone</option>
            <option value="Me">My Picks</option>
            <option value="His">His Picks</option>
            <option value="Both">Joint Discoveries</option>
          </select>

          {/* Must Return toggle */}
          <button
            onClick={() => setOnlyMustReturn(!onlyMustReturn)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              onlyMustReturn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Must Return Only</span>
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold px-2 py-1"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-stone-400">
            Showing <strong>{filteredRestaurants.length}</strong> of {restaurants.length} spots
          </div>
        </div>

      </div>

      {/* Grid or Table Display */}
      {filteredRestaurants.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(r => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelectCity={setSelectedCityFilter}
                onSelectCuisine={setSelectedCuisineFilter}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3.5 px-4">Restaurant</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Ethnic Cuisine</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Favorite Dishes</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {filteredRestaurants.map(r => (
                    <tr key={r.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-stone-100 font-serif text-sm">
                        {r.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                        📍 {r.city}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
                          <span>{r.cuisineFlag}</span>
                          <span>{r.cuisineName}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {r.dateVisited}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-500">
                        ★ {r.rating}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-stone-600 dark:text-stone-400">
                        {r.herFavoriteDish || r.hisFavoriteDish || r.sharedDish || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onEdit(r)}
                          className="text-stone-500 hover:text-rose-600 mr-2 font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(r.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-dashed border-stone-300 dark:border-stone-800 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto text-3xl">
            🍷
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {hasActiveFilters ? 'No Date Spots Match Your Search' : 'Your Journal is Fresh & Ready!'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters 
              ? 'Try resetting your active filters to see all your logged restaurants.' 
              : 'Start logging restaurants you have been to. Each one will unlock ethnic cuisines and light up cities on your travel map!'}
          </p>

          <div className="pt-2 flex justify-center gap-3">
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-200"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={onOpenAddModal}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Log Your First Restaurant</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
