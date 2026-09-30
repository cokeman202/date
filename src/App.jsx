import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import RestaurantList from './components/RestaurantList';
import CitiesPassportView from './components/CitiesPassportView';
import EthnicCuisineExplorer from './components/EthnicCuisineExplorer';
import DateNightRoulette from './components/DateNightRoulette';
import WishlistView from './components/WishlistView';
import RestaurantModal from './components/RestaurantModal';
import CloudSyncModal from './components/CloudSyncModal';

import { 
  getRestaurants, 
  addRestaurant, 
  updateRestaurant, 
  deleteRestaurant,
  getWishlist,
  addWishlistItem,
  deleteWishlistItem,
  clearAllData
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'cities' | 'cuisines' | 'roulette' | 'wishlist'
  
  const [restaurants, setRestaurants] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [restaurantToEdit, setRestaurantToEdit] = useState(null);

  // Active Cross-Tab Filters (Initial: nothing selected)
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState('');

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [rests, wish] = await Promise.all([
          getRestaurants(),
          getWishlist()
        ]);
        setRestaurants(rests || []);
        setWishlist(wish || []);
      } catch (err) {
        console.error('Error loading journal data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Unique cities visited
  const totalCities = useMemo(() => {
    const set = new Set();
    restaurants.forEach(r => {
      if (r.city) set.add(r.city.trim().toLowerCase());
    });
    return set.size;
  }, [restaurants]);

  // Unique cuisines explored
  const totalCuisines = useMemo(() => {
    const set = new Set();
    restaurants.forEach(r => {
      if (r.cuisineId) set.add(r.cuisineId);
      else if (r.cuisineName) set.add(r.cuisineName.toLowerCase());
    });
    return set.size;
  }, [restaurants]);

  // Existing city names for autocomplete
  const existingCities = useMemo(() => {
    const set = new Set();
    restaurants.forEach(r => {
      if (r.city) set.add(r.city.trim());
    });
    return Array.from(set);
  }, [restaurants]);

  // Save Restaurant (Add or Edit)
  const handleSaveRestaurant = async (formData) => {
    try {
      if (restaurantToEdit) {
        const updated = await updateRestaurant(restaurantToEdit.id, formData);
        setRestaurants(prev => prev.map(r => r.id === restaurantToEdit.id ? updated : r));
        setRestaurantToEdit(null);
      } else {
        const created = await addRestaurant(formData);
        setRestaurants(prev => [created, ...prev]);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Delete Restaurant
  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to remove this restaurant memory?')) return;
    try {
      await deleteRestaurant(id);
      setRestaurants(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Navigate & filter by City from Passport
  const handleSelectCityFilter = (cityName) => {
    setSelectedCityFilter(cityName);
    setSelectedCuisineFilter('');
    setActiveTab('journal');
  };

  // Navigate & filter by Cuisine from Explorer
  const handleSelectCuisineFilter = (cuisineKey) => {
    setSelectedCuisineFilter(cuisineKey);
    setSelectedCityFilter('');
    setActiveTab('journal');
  };

  // Open modal with prefilled ethnic cuisine
  const handleOpenAddModalWithCuisine = (cuisine) => {
    setRestaurantToEdit({
      name: '',
      city: existingCities.length > 0 ? existingCities[0] : '',
      country: '',
      cuisineId: cuisine.id,
      cuisineName: cuisine.name,
      cuisineFlag: cuisine.flag,
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
      wouldReturn: true
    });
    setIsAddModalOpen(true);
  };

  // Convert wishlist item to restaurant
  const handleConvertToRestaurant = (item) => {
    setRestaurantToEdit({
      name: item.restaurant,
      city: item.city,
      country: item.country || '',
      cuisineName: item.cuisine || 'Ethnic Cuisine',
      cuisineId: item.cuisine?.toLowerCase().replace(/\s+/g, '-') || 'other',
      dateVisited: new Date().toISOString().split('T')[0],
      rating: 5,
      priceLevel: '$$',
      whoPicked: 'Both of Us',
      herFavoriteDish: '',
      hisFavoriteDish: '',
      sharedDish: '',
      storyNotes: item.notes ? `Finally went here! ${item.notes}` : 'Finally visited this dream spot together!',
      tags: ['Bucket List Achieved'],
      photoUrl: '',
      wouldReturn: true
    });
    setIsAddModalOpen(true);
    handleDeleteWishlist(item.id);
  };

  // Wishlist Handlers
  const handleAddWishlist = async (data) => {
    const item = await addWishlistItem(data);
    setWishlist(prev => [item, ...prev]);
  };

  const handleDeleteWishlist = async (id) => {
    await deleteWishlistItem(id);
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  // Export JSON Backup
  const handleExport = () => {
    const backup = {
      restaurants,
      wishlist,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `food-passport-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors selection:bg-rose-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => { setRestaurantToEdit(null); setIsAddModalOpen(true); }}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        onExport={handleExport}
        totalRestaurants={restaurants.length}
        totalCities={totalCities}
        totalCuisines={totalCuisines}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-stone-500">Opening Your Palate &amp; Passport...</p>
          </div>
        ) : (
          <>
            {activeTab === 'journal' && (
              <RestaurantList
                restaurants={restaurants}
                onEdit={(r) => { setRestaurantToEdit(r); setIsAddModalOpen(true); }}
                onDelete={handleDeleteRestaurant}
                onOpenAddModal={() => { setRestaurantToEdit(null); setIsAddModalOpen(true); }}
                selectedCityFilter={selectedCityFilter}
                setSelectedCityFilter={setSelectedCityFilter}
                selectedCuisineFilter={selectedCuisineFilter}
                setSelectedCuisineFilter={setSelectedCuisineFilter}
              />
            )}

            {activeTab === 'cities' && (
              <CitiesPassportView
                restaurants={restaurants}
                onSelectCityFilter={handleSelectCityFilter}
                onOpenAddModal={() => { setRestaurantToEdit(null); setIsAddModalOpen(true); }}
              />
            )}

            {activeTab === 'cuisines' && (
              <EthnicCuisineExplorer
                restaurants={restaurants}
                onSelectCuisineFilter={handleSelectCuisineFilter}
                onOpenAddModalWithCuisine={handleOpenAddModalWithCuisine}
              />
            )}

            {activeTab === 'roulette' && (
              <DateNightRoulette
                restaurants={restaurants}
                onOpenAddModalWithCuisine={handleOpenAddModalWithCuisine}
              />
            )}

            {activeTab === 'wishlist' && (
              <WishlistView
                wishlist={wishlist}
                onAddWishlist={handleAddWishlist}
                onDeleteWishlist={handleDeleteWishlist}
                onConvertToRestaurant={handleConvertToRestaurant}
              />
            )}
          </>
        )}

      </main>

      {/* Add / Edit Restaurant Modal */}
      <RestaurantModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setRestaurantToEdit(null); }}
        onSave={handleSaveRestaurant}
        restaurantToEdit={restaurantToEdit}
        existingCities={existingCities}
      />

      {/* Cloud Sync & Real-Time Updates Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        restaurants={restaurants}
        wishlist={wishlist}
        onDataSynced={({ restaurants: newRests, wishlist: newWish }) => {
          if (newRests) setRestaurants(newRests);
          if (newWish) setWishlist(newWish);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-400">
        <p>
          Palate &amp; Passport • Food Travel Journal • Click any city to view its glowing boundary and restaurant markers ✨
        </p>
      </footer>

    </div>
  );
}
