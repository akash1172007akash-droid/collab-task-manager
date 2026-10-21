import React, { useState } from 'react';
import {
  isLiveConfigAvailable,
  isUsingEmulator,
  resolvedFirebaseConfig,
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  setIsEmulatorPreferred,
  getIsEmulatorPreferred,
  type FirebaseCustomConfig,
} from '../lib/firebase';
import {
  X,
  Settings,
  Database,
  CheckCircle2,
  Server,
  Key,
  ExternalLink,
  Trash2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const stored = getStoredFirebaseConfig();
  const [apiKey, setApiKey] = useState(stored?.apiKey || resolvedFirebaseConfig.apiKey || '');
  const [projectId, setProjectId] = useState(stored?.projectId || resolvedFirebaseConfig.projectId || '');
  const [authDomain, setAuthDomain] = useState(stored?.authDomain || resolvedFirebaseConfig.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(stored?.storageBucket || resolvedFirebaseConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(stored?.messagingSenderId || resolvedFirebaseConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(stored?.appId || resolvedFirebaseConfig.appId || '');
  const [rawSnippet, setRawSnippet] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  // Auto-parse raw snippet if user pastes the snippet from Firebase Console
  const handleParseSnippet = (snippet: string) => {
    setRawSnippet(snippet);
    setError(null);
    try {
      // Extract apiKey, projectId, authDomain etc using regex
      const apiKeyMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = snippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = snippet.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
      if (projectIdMatch) setProjectId(projectIdMatch[1]);
      if (storageBucketMatch) setStorageBucket(storageBucketMatch[1]);
      if (messagingSenderIdMatch) setMessagingSenderId(messagingSenderIdMatch[1]);
      if (appIdMatch) setAppId(appIdMatch[1]);
    } catch (e: any) {
      console.warn('Could not parse snippet automatically:', e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setError('Both API Key and Project ID are required.');
      return;
    }

    const config: FirebaseCustomConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveStoredFirebaseConfig(config);
  };

  const handleClear = () => {
    if (window.confirm('Clear custom Firebase configuration and reset?')) {
      clearStoredFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Firebase Connection Settings</h3>
              <p className="text-xs text-slate-500">Connect to your real Firebase project or local emulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Database className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Active Mode:</span>
            {isLiveConfigAvailable ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Firebase ({projectId || 'Configured'})
              </span>
            ) : isUsingEmulator ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                <Server className="w-3.5 h-3.5" />
                Local Emulator (Port 9099 / 8080)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                Configuration Needed
              </span>
            )}
          </div>

          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Local Emulator Toggle (Only available on localhost) */}
        {isLocalhost && (
          <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-indigo-900">Localhost Detected</p>
              <p className="text-[11px] text-indigo-700">
                Run <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">npm run emulator</code> to test locally without cloud keys.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEmulatorPreferred(!getIsEmulatorPreferred())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                getIsEmulatorPreferred()
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300'
              }`}
            >
              {getIsEmulatorPreferred() ? 'Emulator Active' : 'Switch to Emulator'}
            </button>
          </div>
        )}

        {/* Paste from Firebase Console Helper */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Paste: Firebase Web App Config Object
          </label>
          <textarea
            rows={2}
            value={rawSnippet}
            onChange={(e) => handleParseSnippet(e.target.value)}
            placeholder="Paste your 'const firebaseConfig = { apiKey: ... };' snippet from Firebase Console here to auto-fill"
            className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Project ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-project-123"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="my-project.firebaseapp.com"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:1234567890:web:..."
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {stored ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Save & Connect</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
