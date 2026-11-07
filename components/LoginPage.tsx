'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { getClientDeviceHints } from '@/lib/client-device';
import { UserSession } from '@/types/legal';

interface LoginPageProps {
  onSuccess: (userData: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [founderName, setFounderName] = useState('Tanmay (Founder)');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceLabel, setDeviceLabel] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let os = 'Windows';
      if (/Mac/i.test(ua)) os = 'macOS';
      else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
      else if (/Android/i.test(ua)) os = 'Android';
      else if (/Linux/i.test(ua)) os = 'Linux';

      let browser = 'Browser';
      if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
      else if (/Edg/i.test(ua)) browser = 'Edge';
      else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
      else if (/Firefox/i.test(ua)) browser = 'Firefox';

      setDeviceLabel(`${os} · ${browser}`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clientHint = getClientDeviceHints();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim(),
          founderName: founderName.trim(),
          clientHint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect password.');
      }

      onSuccess(data.user);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 font-sans selection:bg-neutral-800 selection:text-white">
      <div className="w-full max-w-sm">
        
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 mb-3.5 shadow-sm">
            <FileText className="w-5 h-5 text-neutral-300" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Scalyth Legal
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Founder disclosures, agreements, and corporate records
          </p>
        </div>

        {/* Form Box */}
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Your Name / Role
              </label>
              <input
                type="text"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="e.g. Tanmay (Founder)"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter vault password"
                  className="w-full pl-3 pr-10 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-medium text-xs shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {deviceLabel && (
            <div className="mt-5 pt-4 border-t border-neutral-800/60 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Detected: {deviceLabel}</span>
              <span className="flex items-center gap-1 text-neutral-400">
                <Lock className="w-3 h-3 text-neutral-500" /> Audit active
              </span>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-[11px] text-neutral-600">
          legal.scalyth.tech · Scalyth Technologies Inc.
        </div>

      </div>
    </div>
  );
};
