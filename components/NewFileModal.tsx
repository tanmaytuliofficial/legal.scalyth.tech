'use client';

import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { LegalFolder, LegalFile } from '@/types/legal';

interface NewFileModalProps {
  folders: LegalFolder[];
  activeFolderId: string | null;
  onClose: () => void;
  onFileCreated: (file: LegalFile) => void;
  userName: string;
}

const TEMPLATES: Record<string, { name: string; category: string; content: string; passRecommended?: boolean }> = {
  founderDisclosure: {
    name: 'Scalyth_Statutory_Founder_Disclosure_2026.md',
    category: 'Founder Disclosure',
    passRecommended: true,
    content: `# SCALYTH TECHNOLOGIES INC.
## STATUTORY FOUNDER DISCLOSURE STATEMENT (2026)

### 1. FOUNDER COVENANTS
- Full Devotion: 100% executive working time dedicated to Scalyth Technologies Inc.
- Outside Directorships: Declared and vetted.
- Capital Contribution: Fully paid in Class-A Common Stock.

### 2. REVERSE VESTING
- Subject to 48-month reverse vesting with 1-year cliff.
- Double-trigger acceleration on corporate sale/change of control.

### 3. IP ASSIGNMENT
All technology, architecture, and codebase are transferred to Scalyth Technologies.
`,
  },
  nda: {
    name: 'Enterprise_Mutual_NDA_Template.md',
    category: 'NDA',
    passRecommended: false,
    content: `# MUTUAL NON-DISCLOSURE AGREEMENT
**BETWEEN SCALYTH TECHNOLOGIES INC. AND COUNTERPARTY**

1. Definition of Confidential Information: Technical architectures, source code, benchmarks, customer identities, and business plans.
2. Standard of Care: Reasonable standard of care.
3. Term: 3 years from execution date.
`,
  },
  ipTransfer: {
    name: 'IP_Assignment_&_Copyright_Transfer_Deed.md',
    category: 'IP Assignment',
    passRecommended: true,
    content: `# INTELLECTUAL PROPERTY ASSIGNMENT DEED
**TO: SCALYTH TECHNOLOGIES INC.**

The undersigned contributor hereby irrevocably assigns and transfers to Scalyth Technologies Inc.:
- All worldwide copyrights, patents, source code repositories, and documentation.
- Any inventions, methods, or software developed for Scalyth.
`,
  },
};

export const NewFileModal: React.FC<NewFileModalProps> = ({
  folders,
  activeFolderId,
  onClose,
  onFileCreated,
  userName,
}) => {
  const [name, setName] = useState('');
  const [folderId, setFolderId] = useState(activeFolderId || folders[0]?.id || '');
  const [category, setCategory] = useState('Founder Disclosure');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateSelect = (key: string) => {
    if (!key) return;
    const t = TEMPLATES[key];
    if (t) {
      setName(t.name);
      setCategory(t.category);
      setContent(t.content);
      if (t.passRecommended) {
        setIsPasswordProtected(true);
        if (!password) setPassword('SCALYTH2026');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!name) {
      setName(file.name);
    }
    setDescription(`Uploaded (${(file.size / 1024).toFixed(1)} KB)`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text || `Uploaded file content: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a file name.');
      return;
    }
    if (!folderId) {
      setError('Please select a folder.');
      return;
    }
    if (isPasswordProtected && !password.trim()) {
      setError('Please enter a password for this file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          folderId,
          category,
          description: description.trim(),
          content,
          isPasswordProtected,
          password: password.trim(),
          fileType: 'contract',
          userName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create file.');
      }

      onFileCreated(data.file);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl text-neutral-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
          <div>
            <h3 className="text-xs font-semibold text-white">Add Legal Document</h3>
            <p className="text-[11px] text-neutral-400">Save a new contract or statement to the vault</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300">
              {error}
            </div>
          )}

          {/* Template picker */}
          <div>
            <label className="block text-neutral-400 mb-1">
              Start with a template (optional)
            </label>
            <select
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-neutral-600"
              defaultValue=""
            >
              <option value="">Blank document</option>
              <option value="founderDisclosure">Founder Disclosure Statement 2026</option>
              <option value="nda">Mutual Non-Disclosure Agreement (MNDA)</option>
              <option value="ipTransfer">IP Assignment & Inventions Deed</option>
            </select>
          </div>

          {/* Name & Folder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Founder_Disclosure_Statement.md"
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono text-[11px]"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">
                Folder *
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-neutral-600"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-neutral-600"
              >
                <option value="Founder Disclosure">Founder Disclosure</option>
                <option value="Shareholders Agreement">Shareholders Agreement</option>
                <option value="NDA">NDA</option>
                <option value="IP Assignment">IP Assignment</option>
                <option value="Board Resolution">Board Resolution</option>
                <option value="Compliance Audit">Compliance Audit</option>
                <option value="General Legal">General Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Content / Upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-400">
                Document text
              </label>
              <label className="cursor-pointer text-[11px] text-neutral-400 hover:text-white transition">
                <span>Upload a local file</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.md,.json,.pdf,.docx"
                />
              </label>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Paste agreement text or clauses here..."
              className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono text-[11px] leading-relaxed"
            />
          </div>

          {/* Password Lock Toggle */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Password Protect</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  Require a password to view or download this document.
                </div>
              </div>

              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-neutral-100 focus:ring-0 cursor-pointer"
              />
            </div>

            {isPasswordProtected && (
              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-neutral-400 mb-1 text-[11px]">
                  File Password *
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. FOUNDER2026"
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 font-mono text-[11px]"
                  required={isPasswordProtected}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
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
              {loading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
