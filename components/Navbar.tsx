'use client';

import React from 'react';
import { 
  FolderPlus, 
  Plus, 
  Search,
  LogOut,
  Files,
  Activity
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'files' | 'audit';
  setCurrentTab: (tab: 'files' | 'audit') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewFolder: () => void;
  onOpenNewFile: () => void;
  onLogout: () => void;
  userName: string;
  deviceSummary?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  onOpenNewFolder,
  onOpenNewFile,
  onLogout,
  userName,
  deviceSummary,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Logo & Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">Scalyth</span>
              <span className="text-neutral-600 font-mono text-xs">/</span>
              <span className="text-xs text-neutral-400 font-medium">legal</span>
            </div>

            {/* View Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-neutral-800 ml-3 text-xs">
              <button
                onClick={() => setCurrentTab('files')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  currentTab === 'files'
                    ? 'bg-neutral-800 text-white font-medium shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Files className="w-3.5 h-3.5" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => setCurrentTab('audit')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  currentTab === 'audit'
                    ? 'bg-neutral-800 text-white font-medium shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Access History</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search documents or files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewFolder}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition"
              title="New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">New Folder</span>
            </button>

            <button
              onClick={onOpenNewFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 transition active:scale-95"
              title="Add File"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File</span>
            </button>

            {/* User indicator & Logout */}
            <div 
              className="flex items-center gap-2 pl-2 border-l border-neutral-800 text-xs text-neutral-400"
              title={deviceSummary ? `Verified on ${deviceSummary}` : undefined}
            >
              <span className="hidden lg:inline text-neutral-300 font-medium truncate max-w-[140px]">
                {userName}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-950/20 transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
