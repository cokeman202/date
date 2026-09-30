import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  Star, 
  Edit3, 
  Trash2, 
  BookmarkCheck
} from 'lucide-react';
import { CUISINE_DEFAULT_PHOTOS } from '../services/imageService';

export default function RestaurantCard({ 
  restaurant, 
  onEdit, 
  onDelete, 
  onSelectCity, 
  onSelectCuisine 
}) {
  const {
    id,
    name,
    city,
    country,
    cuisineName,
    cuisineFlag,
    dateVisited,
    rating,
    priceLevel,
    whoPicked,
    herFavoriteDish,
    hisFavoriteDish,
    sharedDish,
    storyNotes,
    tags = [],
    photoUrl,
    wouldReturn
  } = restaurant;

  const formattedDate = dateVisited ? new Date(dateVisited).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  return (
    <div className="polaroid-card group relative bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-900 flex flex-col justify-between">
      
      {/* Top Media Banner */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        {photoUrl || CUISINE_DEFAULT_PHOTOS[restaurant.cuisineId] ? (
          <img 
            src={photoUrl || CUISINE_DEFAULT_PHOTOS[restaurant.cuisineId]} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-rose-50 to-amber-50 dark:from-stone-800 dark:to-stone-900 text-stone-400">
            <span className="text-5xl mb-2">{cuisineFlag || '🍽️'}</span>
            <span className="text-xs font-medium tracking-wide uppercase">{cuisineName || 'Delicious Date'}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Ethnic Cuisine Badge */}
        <button 
          onClick={(e) => { e.stopPropagation(); onSelectCuisine && onSelectCuisine(restaurant.cuisineId || cuisineName); }}
          className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-stone-100 text-xs font-bold shadow-md hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          title={`Filter by ${cuisineName}`}
        >
          <span className="text-base">{cuisineFlag || '🌍'}</span>
          <span>{cuisineName || 'Ethnic Cuisine'}</span>
        </button>

        {/* Rating & Price */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{rating ? Number(rating).toFixed(1) : '5.0'}</span>
          <span className="text-stone-300 ml-1">·</span>
          <span className="text-amber-300 font-semibold">{priceLevel || '$$'}</span>
        </div>

        {/* Restaurant Name & City Header in Banner */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl sm:text-2xl font-serif font-bold leading-tight tracking-tight drop-shadow-md">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-200">
            <button 
              onClick={(e) => { e.stopPropagation(); onSelectCity && onSelectCity(city); }}
              className="flex items-center gap-1 hover:text-rose-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
              title={`View ${city} on Map`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-semibold">{city}{country ? `, ${country}` : ''}</span>
            </button>
            {formattedDate && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-300" />
                  {formattedDate}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Body & Couple Food Highlights */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">

        {/* Who Picked Badge & Would Return Badge */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>
              {whoPicked === 'Both of Us' || whoPicked === 'Both'
                ? 'Joint Discovery'
                : whoPicked === 'Me'
                ? 'My Pick'
                : 'His Pick'}
            </span>
          </div>

          {wouldReturn && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <BookmarkCheck className="w-3.5 h-3.5" />
              Must Return!
            </span>
          )}
        </div>

        {/* Favorite Dishes Grid */}
        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3 space-y-2 border border-stone-100 dark:border-stone-800 text-xs">
          
          {herFavoriteDish && (
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 shrink-0 mt-0.5">
                My Favorite
              </span>
              <span className="text-stone-700 dark:text-stone-300">
                {herFavoriteDish}
              </span>
            </div>
          )}

          {hisFavoriteDish && (
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0 mt-0.5">
                His Favorite
              </span>
              <span className="text-stone-700 dark:text-stone-300">
                {hisFavoriteDish}
              </span>
            </div>
          )}

          {sharedDish && (
            <div className="flex items-start gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shrink-0 mt-0.5">
                We Shared
              </span>
              <span className="text-stone-700 dark:text-stone-300">
                {sharedDish}
              </span>
            </div>
          )}
        </div>

        {/* Date Night Memory */}
        {storyNotes && (
          <div className="relative pl-3 border-l-2 border-rose-300 dark:border-rose-700 italic text-stone-600 dark:text-stone-300 text-xs sm:text-[13px] leading-relaxed">
            “{storyNotes}”
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag, i) => (
              <span 
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-stone-50/70 dark:bg-stone-950/40 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <span className="text-[11px] text-stone-400">
          ID: {id.replace('rest-', '#')}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(restaurant)}
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title="Edit Restaurant"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            title="Delete Entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
