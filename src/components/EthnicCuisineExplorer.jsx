import React, { useState, useMemo } from 'react';
import { 
  Globe2, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  PlusCircle, 
  Award, 
  ArrowRight
} from 'lucide-react';
import { CUISINES_LIST, REGIONS } from '../data/cuisinesList';

export default function EthnicCuisineExplorer({ 
  restaurants = [], 
  onSelectCuisineFilter, 
  onOpenAddModalWithCuisine 
}) {
  const [selectedRegion, setSelectedRegion] = useState('All Cuisines');
  const [activeView, setActiveView] = useState('all'); // 'all' | 'unlocked' | 'locked'

  // Map restaurants by cuisineId or cuisineName
  const cuisineStats = useMemo(() => {
    const stats = new Map();

    restaurants.forEach(r => {
      let match = CUISINES_LIST.find(c => 
        c.id === r.cuisineId || 
        c.name.toLowerCase() === (r.cuisineName || '').toLowerCase()
      );

      const key = match ? match.id : (r.cuisineId || 'other');

      if (!stats.has(key)) {
        stats.set(key, {
          restaurants: [],
          dishesLoved: []
        });
      }

      const item = stats.get(key);
      item.restaurants.push(r);

      if (r.herFavoriteDish) item.dishesLoved.push(r.herFavoriteDish);
      if (r.hisFavoriteDish) item.dishesLoved.push(r.hisFavoriteDish);
      if (r.sharedDish) item.dishesLoved.push(r.sharedDish);
    });

    return stats;
  }, [restaurants]);

  // Total unlocked cuisines
  const unlockedCount = useMemo(() => {
    let count = 0;
    CUISINES_LIST.forEach(c => {
      if (cuisineStats.has(c.id) && cuisineStats.get(c.id).restaurants.length > 0) {
        count++;
      }
    });
    return count;
  }, [cuisineStats]);

  const percentageExplored = Math.round((unlockedCount / CUISINES_LIST.length) * 100);

  // Foodie Couple Level
  const foodieLevel = useMemo(() => {
    if (unlockedCount >= 20) return { title: "World Flavor Royalty 👑", desc: "You two have an extraordinary worldly palate!" };
    if (unlockedCount >= 12) return { title: "Master Culinary Nomads ✈️", desc: "True epicurean explorers sharing global flavors!" };
    if (unlockedCount >= 7) return { title: "Global Gastronomes 🌍", desc: "Expanding your horizons together one date at a time!" };
    if (unlockedCount >= 3) return { title: "Adventurous Daters 🍷", desc: "Great variety! So many delicious worlds left to unlock." };
    if (unlockedCount >= 1) return { title: "Curious Palates 🌱", desc: "The start of your global culinary adventure together!" };
    return { title: "Ready To Explore 🌍", desc: "Log your first ethnic restaurant date to unlock your passport!" };
  }, [unlockedCount]);

  // Filter cuisines list
  const filteredCuisines = useMemo(() => {
    return CUISINES_LIST.filter(c => {
      const matchRegion = selectedRegion === 'All Cuisines' || c.region === selectedRegion;
      const isUnlocked = cuisineStats.has(c.id) && cuisineStats.get(c.id).restaurants.length > 0;
      
      let matchStatus = true;
      if (activeView === 'unlocked') matchStatus = isUnlocked;
      if (activeView === 'locked') matchStatus = !isUnlocked;

      return matchRegion && matchStatus;
    });
  }, [selectedRegion, activeView, cuisineStats]);

  // Top Cuisines for breakdown chart
  const topCuisines = useMemo(() => {
    const list = [];
    CUISINES_LIST.forEach(c => {
      if (cuisineStats.has(c.id)) {
        const count = cuisineStats.get(c.id).restaurants.length;
        if (count > 0) {
          list.push({ cuisine: c, count });
        }
      }
    });
    return list.sort((a, b) => b.count - a.count).slice(0, 6);
  }, [cuisineStats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Header & Progress Tracker */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/40">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Ethnic Food Tracker</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              World Cuisine Passport
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Track the culinary cultures and traditional ethnic restaurants you've experienced.
            </p>
          </div>

          {/* Level & Progress Card */}
          <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Foodie Level
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                {unlockedCount} / {CUISINES_LIST.length} Cuisines ({percentageExplored}%)
              </span>
            </div>

            <div>
              <h4 className="text-lg font-serif font-bold text-white">
                {foodieLevel.title}
              </h4>
              <p className="text-xs text-stone-300 mt-0.5">
                {foodieLevel.desc}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(percentageExplored, 3)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Cuisines Breakdown Bar */}
        {topCuisines.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-3">
              Your Top Explored Traditions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {topCuisines.map(({ cuisine, count }) => (
                <div 
                  key={cuisine.id}
                  onClick={() => onSelectCuisineFilter(cuisine.id)}
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/10 text-center cursor-pointer transition-all hover:scale-105"
                >
                  <span className="text-2xl block mb-1">{cuisine.flag}</span>
                  <span className="text-xs font-bold block truncate">{cuisine.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono">{count} {count === 1 ? 'date' : 'dates'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Regional Tabs & Filter Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All Cuisines ({CUISINES_LIST.length})
            </button>
            <button
              onClick={() => setActiveView('unlocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'unlocked'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setActiveView('locked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'locked'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              To Discover ({CUISINES_LIST.length - unlockedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {REGIONS.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Cuisine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCuisines.map((cuisine) => {
            const hasVisited = cuisineStats.has(cuisine.id) && cuisineStats.get(cuisine.id).restaurants.length > 0;
            const data = cuisineStats.get(cuisine.id) || { restaurants: [], dishesLoved: [] };
            const visitCount = data.restaurants.length;

            return (
              <div
                key={cuisine.id}
                className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  hasVisited
                    ? 'bg-white dark:bg-stone-900 border-emerald-300/80 dark:border-emerald-800/80 shadow-md hover:shadow-xl hover:border-emerald-500'
                    : 'bg-stone-50/70 dark:bg-stone-900/40 border-dashed border-stone-300 dark:border-stone-800 opacity-90 hover:opacity-100 hover:border-amber-400'
                }`}
              >
                <div>
                  {/* Top Bar: Flag & Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 shadow-inner">
                        {cuisine.flag}
                      </span>
                      <div>
                        <h4 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
                          {cuisine.name}
                        </h4>
                        <span className="text-[11px] font-medium text-stone-500">
                          {cuisine.region}
                        </span>
                      </div>
                    </div>

                    {hasVisited ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{visitCount} {visitCount === 1 ? 'Date' : 'Dates'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 bg-stone-200/70 dark:bg-stone-800 px-2.5 py-1 rounded-full">
                        <Lock className="w-3.5 h-3.5" />
                        <span>To Try</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3">
                    {cuisine.description}
                  </p>

                  {hasVisited ? (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900/40 space-y-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                        Restaurants You’ve Been To:
                      </span>
                      <div className="space-y-1.5">
                        {data.restaurants.map(r => (
                          <div key={r.id} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[180px]">
                              {r.name}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              📍 {r.city}
                            </span>
                          </div>
                        ))}
                      </div>

                      {data.dishesLoved.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/30 text-[11px] text-stone-600 dark:text-stone-300">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Loved: </span>
                          <span>{data.dishesLoved.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-3 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                        Must-Try Dishes For Your Date:
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 italic">
                        {cuisine.mustTry}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80">
                  {hasVisited ? (
                    <button
                      onClick={() => onSelectCuisineFilter(cuisine.id)}
                      className="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>View in Food Journal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenAddModalWithCuisine(cuisine)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 hover:bg-amber-500 hover:text-white text-amber-900 dark:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log a Date for this Cuisine</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
