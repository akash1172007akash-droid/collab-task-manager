import React, { useState } from 'react';
import { isLiveConfigAvailable, isUsingEmulator } from '../lib/firebase';
import { AlertCircle, CheckCircle2, Server, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FirebaseBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 text-xs text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isLiveConfigAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live Firebase Connected
            </span>
          ) : isUsingEmulator ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <Server className="w-3.5 h-3.5" />
              Firebase Local Emulator (Auth: 9099, Firestore: 8080)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Firebase Setup Required
            </span>
          )}

          <span className="text-slate-500 hidden sm:inline">
            {isLiveConfigAvailable
              ? 'Using project configured in .env'
              : 'Running in local emulator / verification mode. Live database requires credentials in .env.'}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {expanded ? 'Hide Firebase Setup Guide' : 'View Setup & Testing Guide'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-slate-700">
          <h4 className="font-semibold text-slate-900 text-sm">Firebase Configuration & Testing Guide</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="font-medium text-slate-800">Option A: Test Locally with Firebase Emulator</p>
              <p className="text-slate-600">
                1. Make sure Java is installed (OpenJDK 17+ or 25).
              </p>
              <p className="text-slate-600">
                2. Run emulator command: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900 font-mono">npm run emulator</code>
              </p>
              <p className="text-slate-600">
                3. The app automatically connects to local Firestore (port 8080) and Auth (port 9099).
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-medium text-slate-800">Option B: Connect to Live Firebase Project</p>
              <p className="text-slate-600">
                1. Create a project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline text-indigo-600">console.firebase.google.com</a>.
              </p>
              <p className="text-slate-600">
                2. Enable <strong>Email/Password</strong> in Authentication &gt; Sign-in method.
              </p>
              <p className="text-slate-600">
                3. Create <strong>Cloud Firestore</strong> database and deploy the security rules from <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">firestore.rules</code>.
              </p>
              <p className="text-slate-600">
                4. Copy <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env.example</code> to <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env</code> and fill in your Web App credentials.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
