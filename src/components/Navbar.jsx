import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Globe2, 
  Sparkles, 
  PlusCircle, 
  Heart, 
  Bookmark, 
  Moon, 
  Sun,
  UtensilsCrossed,
  Download,
  Cloud
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  onExport,
  onOpenCloudSync,
  totalRestaurants,
  totalCities,
  totalCuisines
}) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { id: 'journal', label: 'Food Journal', icon: BookOpen, count: totalRestaurants },
    { id: 'cities', label: 'Cities & Glowing Map', icon: MapPin, count: totalCities },
    { id: 'cuisines', label: 'Ethnic Cuisines', icon: Globe2, count: totalCuisines },
    { id: 'roulette', label: 'Date Roulette', icon: Sparkles },
    { id: 'wishlist', label: 'Wishlist', icon: Bookmark }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 ring-2 ring-white dark:ring-stone-800">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50">
                  Palate &amp; Passport
                </h1>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Food Travel Journal
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-stone-900 text-rose-600 dark:text-rose-400 shadow-sm shadow-stone-300/50 dark:shadow-black/40 scale-100'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                        : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCloudSync}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs font-semibold border border-stone-200/80 dark:border-stone-700/80"
              title="Cloud Sync / Real-Time Live Website Updates"
            >
              <Cloud className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Live Sync</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <button
              onClick={onExport}
              className="p-2.5 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Download Journal Backup (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-500/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Restaurant</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-stone-100 dark:border-stone-800/80 -mx-4 px-4 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
