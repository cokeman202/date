import React, { useState } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  X, 
  Sparkles, 
  Globe, 
  AlertCircle,
  HelpCircle,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { 
  getCloudSyncUrl, 
  setCloudSyncUrl, 
  getGitHubToken, 
  setGitHubToken, 
  fetchFromCloud, 
  pushToGitHubGist,
  DEFAULT_CLOUD_URL,
  DEFAULT_GIST_WEB_URL
} from '../services/api';

export default function CloudSyncModal({ 
  isOpen, 
  onClose, 
  restaurants = [], 
  wishlist = [],
  onDataSynced 
}) {
  const [cloudUrl, setCloudUrlInput] = useState(getCloudSyncUrl());
  const [tokenInput, setTokenInput] = useState(getGitHubToken());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  if (!isOpen) return null;

  // Generate current JSON payload
  const currentPayload = JSON.stringify({
    restaurants,
    wishlist,
    updatedAt: new Date().toISOString()
  }, null, 2);

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(currentPayload);
      setCopied(true);
      setStatusMessage({ 
        type: 'success', 
        text: 'Journal data copied to clipboard! Now paste it into your Gist and click Update.' 
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Could not copy to clipboard automatically.' });
    }
  };

  // Save URL changes
  const handleSaveUrl = () => {
    setCloudSyncUrl(cloudUrl);
    setIsEditingUrl(false);
    setStatusMessage({ type: 'success', text: 'Cloud data source URL saved!' });
  };

  // Reset to default Gist
  const handleResetUrl = () => {
    setCloudUrlInput(DEFAULT_CLOUD_URL);
    setCloudSyncUrl(DEFAULT_CLOUD_URL);
    setIsEditingUrl(false);
    setStatusMessage({ type: 'success', text: 'Reset to your official GitHub Gist URL.' });
  };

  // Pull latest data from Cloud (Gist / Pastebin)
  const handlePullFromCloud = async () => {
    try {
      setIsSyncing(true);
      setStatusMessage(null);
      const data = await fetchFromCloud(cloudUrl);
      if (onDataSynced) {
        onDataSynced(data);
      }
      setStatusMessage({ 
        type: 'success', 
        text: `Successfully synced! Loaded ${data.restaurants.length} restaurants from the cloud.` 
      });
    } catch (err) {
      setStatusMessage({ 
        type: 'error', 
        text: `Sync failed: ${err.message}. If using pastebin.com, remember Pastebin blocks web browsers—use GitHub Gist instead!` 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Save GitHub Token
  const handleSaveToken = () => {
    setGitHubToken(tokenInput);
    setStatusMessage({ type: 'success', text: 'GitHub Personal Access Token saved!' });
  };

  // 1-Click Push directly to GitHub Gist using Token
  const handlePushDirectly = async () => {
    try {
      setIsPushing(true);
      setStatusMessage(null);
      await pushToGitHubGist(restaurants, wishlist);
      setStatusMessage({ 
        type: 'success', 
        text: 'Awesome! Your GitHub Gist was updated automatically. Your live website is updated in real-time!' 
      });
    } catch (err) {
      setStatusMessage({ 
        type: 'error', 
        text: `Auto-push failed: ${err.message}. You can always copy & paste into your Gist manually!` 
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Cloud className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Cloud Sync &amp; Live Updates</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Real-Time
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Keep your live website synced across all your phones &amp; computers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* Active Cloud Source */}
          <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-rose-500" />
                Live Cloud Data Source (Gist / Pastebin)
              </span>
              {!isEditingUrl ? (
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                >
                  Change URL
                </button>
              ) : (
                <button
                  onClick={handleResetUrl}
                  className="text-xs text-stone-500 hover:underline font-semibold"
                >
                  Reset Default
                </button>
              )}
            </div>

            {isEditingUrl ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={cloudUrl}
                  onChange={e => setCloudUrlInput(e.target.value)}
                  placeholder="https://gist.githubusercontent.com/.../raw/journal.json"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setCloudUrlInput(getCloudSyncUrl()); setIsEditingUrl(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUrl}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
                  >
                    Save URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <p className="text-xs font-mono text-stone-700 dark:text-stone-300 truncate">
                  {cloudUrl}
                </p>
                <button
                  onClick={handlePullFromCloud}
                  disabled={isSyncing}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold transition-all"
                  title="Pull latest data from this link"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-500' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Fetch Now'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: How to Update Your Live Website */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              How To Update The Live Website (3 Simple Steps)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex flex-col justify-between">
                <div>
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    1
                  </span>
                  <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    Copy Current JSON
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Copies your logged restaurants formatted for your cloud paste.
                  </p>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied! ✓' : 'Copy JSON'}</span>
                </button>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col justify-between">
                <div>
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    2
                  </span>
                  <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    Open Your Gist
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Opens your online GitHub Gist in a new browser tab.
                  </p>
                </div>
                <a
                  href={DEFAULT_GIST_WEB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Gist ↗</span>
                </a>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col justify-between">
                <div>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    3
                  </span>
                  <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                    Paste &amp; Update
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    Click <strong>Edit</strong> on GitHub, replace text with your copied JSON, and click <strong>Update</strong>!
                  </p>
                </div>
                <div className="mt-3 py-1.5 px-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold text-center">
                  Live on all devices! ✨
                </div>
              </div>
            </div>
          </div>

          {/* Section: Optional 1-Click Auto Push with GitHub Token */}
          <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-400" />
                Optional: 1-Click Instant Push (No Manual Pasting)
              </span>
              <button
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>How to get token?</span>
              </button>
            </div>

            {showTokenHelp && (
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-[11px] text-stone-600 dark:text-stone-300 space-y-1.5 leading-relaxed">
                <p>1. Go to <a href="https://github.com/settings/tokens/new?scopes=gist&description=Palate+and+Passport" target="_blank" rel="noreferrer" className="text-rose-600 underline font-bold">GitHub Token Generator</a>.</p>
                <p>2. Select the <strong>gist</strong> checkbox and click <strong>Generate token</strong> at the bottom.</p>
                <p>3. Copy the token (starts with <code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded">ghp_...</code>) and paste it below.</p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter GitHub Token (ghp_...)"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
              <button
                onClick={handleSaveToken}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold"
              >
                Save
              </button>
              {tokenInput && (
                <button
                  onClick={handlePushDirectly}
                  disabled={isPushing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Saving...' : '1-Click Push'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">
            Whenever this website opens, it automatically checks your Gist for real-time restaurants.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
