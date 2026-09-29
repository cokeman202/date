import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  RotateCw, 
  Globe2, 
  Star, 
  ArrowRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CUISINES_LIST } from '../data/cuisinesList';

export default function DateNightRoulette({ 
  restaurants = [], 
  onOpenAddModalWithCuisine 
}) {
  const [spinMode, setSpinMode] = useState('new_cuisine');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerResult, setWinnerResult] = useState(null);

  const visitedCuisineIds = new Set(restaurants.map(r => r.cuisineId || r.cuisineName?.toLowerCase()));
  const unvisitedCuisines = CUISINES_LIST.filter(c => !visitedCuisineIds.has(c.id));
  const topSpots = restaurants.filter(r => Number(r.rating) >= 4.8);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinnerResult(null);

    let candidates = [];
    if (spinMode === 'new_cuisine') {
      candidates = unvisitedCuisines.length > 0 ? unvisitedCuisines : CUISINES_LIST;
    } else if (spinMode === 'revisit_favorite') {
      candidates = topSpots.length > 0 ? topSpots : restaurants;
    } else {
      candidates = restaurants;
    }

    if (candidates.length === 0) {
      setIsSpinning(false);
      alert('No logged restaurants to pick from yet! Try spinning for a "New Ethnic Cuisine" to discover what to eat tonight.');
      return;
    }

    let counter = 0;
    const maxTicks = 18;
    const interval = setInterval(() => {
      counter++;
      const randomIdx = Math.floor(Math.random() * candidates.length);
      setWinnerResult(candidates[randomIdx]);

      if (counter >= maxTicks) {
        clearInterval(interval);
        setIsSpinning(false);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    }, 90);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-rose-500" />
          <span>The “Where Should We Eat Tonight?” Decider</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
          Date Night Roulette 🎲
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm max-w-lg mx-auto">
          End the eternal dinner debate. Let destiny choose your next delicious meal together!
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => { setSpinMode('new_cuisine'); setWinnerResult(null); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            spinMode === 'new_cuisine'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 shadow-md ring-2 ring-rose-400'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Globe2 className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              New Flavor
            </span>
          </div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Unexplored Ethnic Cuisine
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Pick a tradition you haven't tasted together yet ({unvisitedCuisines.length} options)
          </p>
        </button>

        <button
          onClick={() => { setSpinMode('revisit_favorite'); setWinnerResult(null); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            spinMode === 'revisit_favorite'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 shadow-md ring-2 ring-rose-400'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Reliable Love
            </span>
          </div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Revisit a 5-Star Spot
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Spin among your top-rated date nights ({topSpots.length} spots)
          </p>
        </button>

        <button
          onClick={() => { setSpinMode('any_spot'); setWinnerResult(null); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            spinMode === 'any_spot'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 shadow-md ring-2 ring-rose-400'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
              Pure Chaos
            </span>
          </div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Any Past Memory
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Randomly select from your entire food journal archive ({restaurants.length} spots)
          </p>
        </button>
      </div>

      {/* The Big Spin Box */}
      <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-6">
        
        <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/20 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
            {isSpinning ? 'SPINNING THE COMPASS...' : 'READY FOR TONIGHT’S DATE'}
          </span>
        </div>

        {/* Display Box */}
        <div className="relative z-10 min-h-[190px] flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-lg mx-auto shadow-inner">
          {winnerResult ? (
            spinMode === 'new_cuisine' ? (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <span className="text-6xl block">{winnerResult.flag}</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
                  {winnerResult.name} Cuisine!
                </h3>
                <p className="text-xs sm:text-sm text-stone-100 max-w-sm">
                  {winnerResult.description}
                </p>
                <div className="mt-2 text-xs bg-black/20 px-3 py-1.5 rounded-lg inline-block">
                  <strong>Must-Try Dishes:</strong> {winnerResult.mustTry}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <span className="text-5xl block">{winnerResult.cuisineFlag || '🍽️'}</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
                  {winnerResult.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-rose-100">
                  <span>📍 {winnerResult.city}</span>
                  <span>•</span>
                  <span>★ {winnerResult.rating}</span>
                  <span>•</span>
                  <span>{winnerResult.cuisineName}</span>
                </div>
                {winnerResult.storyNotes && (
                  <p className="text-xs italic text-stone-200 line-clamp-2 max-w-sm">
                    “{winnerResult.storyNotes}”
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="space-y-2 text-rose-100">
              <Dices className="w-12 h-12 mx-auto stroke-[1.5] text-white animate-bounce" />
              <p className="text-base font-medium">
                Hit the spin button below to decide tonight's date!
              </p>
            </div>
          )}
        </div>

        {/* Spin Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="px-8 py-4 bg-white text-rose-600 hover:bg-stone-50 font-serif font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center gap-3"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Choosing...' : 'Spin The Wheel 🎲'}</span>
          </button>

          {winnerResult && spinMode === 'new_cuisine' && !isSpinning && (
            <button
              onClick={() => onOpenAddModalWithCuisine(winnerResult)}
              className="px-6 py-4 bg-black/40 hover:bg-black/60 text-white text-sm font-bold rounded-2xl border border-white/20 transition-all flex items-center gap-2"
            >
              <span>Log Tonight’s {winnerResult.name} Date</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
