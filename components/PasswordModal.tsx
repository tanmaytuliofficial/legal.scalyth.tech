'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { LegalFile } from '@/types/legal';

interface PasswordModalProps {
  file: LegalFile;
  onClose: () => void;
  onUnlockSuccess: (unlockedFile: LegalFile) => void;
  userName: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  file,
  onClose,
  onUnlockSuccess,
  userName,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/files/${file.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim(),
          action: 'VIEW',
          userName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect password.');
      }

      onUnlockSuccess(data.file);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl p-5 text-neutral-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <span className="text-xs font-semibold text-neutral-200">Password Required</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4">
          <h3 className="text-sm font-semibold text-white truncate">{file.name}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Enter the file password or master passkey to open.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full pl-3 pr-10 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-[11px] text-neutral-500">
            Default file PIN: <code className="text-neutral-400 font-mono">FOUNDER2026</code> or Master Pass
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 px-3 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-medium transition disabled:opacity-50"
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
