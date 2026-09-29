import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Home, 
  Calendar, 
  User, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export default function CoupleProfileModal({ 
  isOpen, 
  onClose, 
  couple, 
  onSaveCouple, 
  onResetDemo, 
  onExport, 
  onImport 
}) {
  const [partner1, setPartner1] = useState(couple?.partner1 || 'Sarah');
  const [partner2, setPartner2] = useState(couple?.partner2 || 'Jake');
  const [anniversaryDate, setAnniversaryDate] = useState(couple?.anniversaryDate || '2023-04-15');
  const [homeCity, setHomeCity] = useState(couple?.homeCity || 'New York, USA');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveCouple({
      partner1: partner1.trim() || 'Partner 1',
      partner2: partner2.trim() || 'Partner 2',
      anniversaryDate,
      homeCity: homeCity.trim()
    });
    onClose();
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        onImport(parsed);
        alert('Journal data imported successfully!');
        onClose();
      } catch (err) {
        alert('Invalid JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-rose-50/80 to-amber-50/50 dark:from-stone-900 dark:to-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50">
                Couple Profile &amp; Settings
              </h2>
              <p className="text-xs text-stone-500">
                Personalize your dining journal and manage your data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Partner 1 Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={partner1}
                    onChange={e => setPartner1(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Partner 2 Name (Boyfriend)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={partner2}
                    onChange={e => setPartner2(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Anniversary / Dating Since
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={e => setAnniversaryDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Home Base City
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={homeCity}
                    onChange={e => setHomeCity(e.target.value)}
                    placeholder="e.g. New York, USA"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow transition-all"
            >
              Save Couple Profile
            </button>
          </form>

          {/* Backup & Data Management */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              Journal Data &amp; Backups
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExport}
                className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-rose-500" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                <span>Import Backup</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileImport} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Reset to demo */}
            <div className="pt-2">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-xs text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Demo Sample Data</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
                  <span>Reset everything to original sample data?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { onResetDemo(); setConfirmReset(false); onClose(); }}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold"
                    >
                      Yes, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2 py-1 text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
