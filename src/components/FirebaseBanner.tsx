import React, { useState } from 'react';
import { isLiveConfigAvailable, isUsingEmulator, resolvedFirebaseConfig } from '../lib/firebase';
import {
  AlertCircle,
  CheckCircle2,
  Server,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';

interface FirebaseBannerProps {
  onOpenSettings?: () => void;
}

export const FirebaseBanner: React.FC<FirebaseBannerProps> = ({ onOpenSettings }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 text-xs text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isLiveConfigAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live Firebase Connected: {resolvedFirebaseConfig.projectId}
            </span>
          ) : isUsingEmulator ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Server className="w-3.5 h-3.5" />
              Firebase Local Emulator (Port 9099 / 8080)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Firebase Configuration Required
            </span>
          )}

          <span className="text-slate-500 hidden sm:inline">
            {isLiveConfigAvailable
              ? 'Real-time synchronization active with Cloud Firestore.'
              : isUsingEmulator
              ? 'Local mode: Ensure `npm run emulator` is running in your terminal.'
              : 'Connect your Firebase project to enable live authentication and real-time database.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isLiveConfigAvailable ? 'Firebase Settings' : 'Connect Firebase'}</span>
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{expanded ? 'Hide Guide' : 'Setup Guide'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-slate-700">
          <h4 className="font-semibold text-slate-900 text-sm">Firebase Connection & Testing Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="font-medium text-slate-800">Option A: Connect to Live Firebase (Recommended)</p>
              <p className="text-slate-600">
                1. Click the <strong>"Connect Firebase"</strong> button above.
              </p>
              <p className="text-slate-600">
                2. Paste your Web App config snippet from <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline text-indigo-600">Firebase Console</a>.
              </p>
              <p className="text-slate-600">
                3. Click Save & Connect — your credentials save securely to your browser session and connect immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-medium text-slate-800">Option B: Run Local Emulator Suite</p>
              <p className="text-slate-600">
                1. Make sure Java is installed (OpenJDK 17+ or 25).
              </p>
              <p className="text-slate-600">
                2. In your terminal, run: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900 font-mono">npm run emulator</code>
              </p>
              <p className="text-slate-600">
                3. The app connects to local Firestore (8080) and Auth (9099) with zero cloud setup needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
