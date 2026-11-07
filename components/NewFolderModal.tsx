'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LegalFolder } from '@/types/legal';

interface NewFolderModalProps {
  onClose: () => void;
  onFolderCreated: (folder: LegalFolder) => void;
  userName: string;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  onClose,
  onFolderCreated,
  userName,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a folder name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          userName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create folder.');
      }

      onFolderCreated(data.folder);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl p-5 text-neutral-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <span className="text-xs font-semibold text-neutral-200">New Folder</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 my-3 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Board Resolutions"
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
