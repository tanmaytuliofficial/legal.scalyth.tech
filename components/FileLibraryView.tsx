'use client';

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Lock, 
  History, 
  Download, 
  Trash2, 
  Eye, 
  Plus, 
  FolderOpen
} from 'lucide-react';
import { LegalFolder, LegalFile } from '@/types/legal';

interface FileLibraryViewProps {
  folders: LegalFolder[];
  files: LegalFile[];
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  searchQuery: string;
  onOpenFile: (file: LegalFile) => void;
  onViewHistory: (file: LegalFile) => void;
  onDownloadFile: (file: LegalFile) => void;
  onDeleteFile: (file: LegalFile) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenNewFolder: () => void;
  onOpenNewFile: () => void;
}

export const FileLibraryView: React.FC<FileLibraryViewProps> = ({
  folders,
  files,
  activeFolderId,
  setActiveFolderId,
  searchQuery,
  onOpenFile,
  onViewHistory,
  onDownloadFile,
  onDeleteFile,
  onDeleteFolder,
  onOpenNewFolder,
  onOpenNewFile,
}) => {
  const [filterSecurity, setFilterSecurity] = useState<'all' | 'locked' | 'unlocked'>('all');

  const filteredFiles = files.filter((f) => {
    const matchesFolder = !activeFolderId || f.folderId === activeFolderId;
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSecurity =
      filterSecurity === 'all' ||
      (filterSecurity === 'locked' && f.isPasswordProtected) ||
      (filterSecurity === 'unlocked' && !f.isPasswordProtected);

    return matchesFolder && matchesSearch && matchesSecurity;
  });

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  return (
    <div className="space-y-6">
      
      {/* Folder Row */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-neutral-400">Folders</span>
          <button
            onClick={onOpenNewFolder}
            className="text-xs text-neutral-400 hover:text-neutral-200 transition"
          >
            + New folder
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* All Files Card */}
          <button
            onClick={() => setActiveFolderId(null)}
            className={`p-3 rounded-xl border text-left transition ${
              activeFolderId === null
                ? 'border-neutral-600 bg-neutral-900 text-white'
                : 'border-neutral-800/80 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <FolderOpen className="w-4 h-4 text-neutral-300" />
              <span className="text-[11px] font-mono text-neutral-500">
                {files.length}
              </span>
            </div>
            <div className="font-medium text-xs truncate">All files</div>
          </button>

          {/* Individual Folders */}
          {folders.map((folder) => {
            const count = files.filter((f) => f.folderId === folder.id).length;
            const isActive = activeFolderId === folder.id;

            return (
              <div
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className={`group relative p-3 rounded-xl border text-left transition cursor-pointer ${
                  isActive
                    ? 'border-neutral-600 bg-neutral-900 text-white'
                    : 'border-neutral-800/80 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Folder className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 transition" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-neutral-500">
                      {count}
                    </span>
                    {folders.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-neutral-600 transition"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="font-medium text-xs truncate" title={folder.name}>
                  {folder.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & View Bar */}
      <div className="flex items-center justify-between border-t border-neutral-800/70 pt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-200">
            {activeFolder ? activeFolder.name : 'All files'}
          </span>
          <span className="text-neutral-500 font-mono text-[11px]">
            ({filteredFiles.length})
          </span>
        </div>

        {/* Security Filter */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilterSecurity('all')}
            className={`px-2 py-1 rounded-md transition ${
              filterSecurity === 'all'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterSecurity('locked')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${
              filterSecurity === 'locked'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Password required</span>
          </button>
          <button
            onClick={() => setFilterSecurity('unlocked')}
            className={`px-2 py-1 rounded-md transition ${
              filterSecurity === 'unlocked'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Open
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800/80 bg-neutral-900/20 py-16 text-center text-neutral-400 text-xs">
          <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
          <p className="font-medium text-neutral-300">No documents yet</p>
          <p className="text-neutral-500 text-[11px] mt-0.5 max-w-xs mx-auto">
            Upload your founder disclosure or create a legal document to get started.
          </p>
          <button
            onClick={onOpenNewFile}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-medium transition text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => {
            const dateObj = new Date(file.createdAt);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={file.id}
                className="group rounded-xl border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/70 hover:border-neutral-700 transition p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-400 group-hover:text-white transition" />
                      <span className="text-[11px] font-medium text-neutral-400">
                        {file.category}
                      </span>
                    </div>

                    {file.isPasswordProtected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                        <Lock className="w-2.5 h-2.5" /> Password
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onOpenFile(file)}
                    className="text-xs font-semibold text-neutral-100 hover:underline cursor-pointer truncate"
                    title={file.name}
                  >
                    {file.name}
                  </h3>

                  {file.description && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-normal">
                      {file.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span>{formattedDate}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {file.accessCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenFile(file)}
                      className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition text-xs"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => onViewHistory(file)}
                      className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition"
                      title="Access history"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDownloadFile(file)}
                      className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteFile(file)}
                      className="p-1 rounded-md text-neutral-600 hover:text-red-400 hover:bg-red-950/20 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
