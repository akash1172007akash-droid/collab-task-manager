import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, FolderKanban } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, logoutUser } = useAuth();

  return (
    <header className="bg-slate-900 text-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              CollabTask <span className="text-xs bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30">MVP</span>
            </span>
            <p className="text-[11px] text-slate-400 hidden sm:block">Real-time Firebase Project & Task Workspace</p>
          </div>
        </div>

        {/* Right side: User info & actions */}
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-semibold flex items-center justify-center text-xs">
                {(userProfile?.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-slate-200 leading-tight">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => logoutUser()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
