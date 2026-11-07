'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  History, 
  FileText, 
  Eye, 
  Check, 
  Copy, 
  Printer, 
  Lock 
} from 'lucide-react';
import { LegalFile } from '@/types/legal';

interface DocumentViewerModalProps {
  file: LegalFile;
  onClose: () => void;
  onViewHistory: (file: LegalFile) => void;
  onDownload: (file: LegalFile) => void;
  userName: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  file,
  onClose,
  onViewHistory,
  onDownload,
  userName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (file.content) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(file.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl h-[88vh] flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden text-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate">{file.name}</h2>
                {file.isPasswordProtected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                    <Lock className="w-2.5 h-2.5" /> Decrypted
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                <span>{file.category}</span>
                <span>·</span>
                <span>{formattedDate}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {file.accessCount || 1} views
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onViewHistory(file)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition"
              title="Access log"
            >
              <History className="w-3 h-3" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={() => onDownload(file)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition"
              title="Download file"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neutral-200" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confidential notice strip */}
        <div className="bg-neutral-900 border-b border-neutral-800 px-5 py-1.5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Scalyth Technologies Inc. · Confidential</span>
          <span className="hidden sm:inline text-neutral-500">
            Viewer: {userName}
          </span>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-950 font-sans">
          <div className="max-w-2xl mx-auto text-neutral-300 leading-relaxed text-xs sm:text-sm">
            {file.content ? (
              <pre className="whitespace-pre-wrap font-sans leading-relaxed text-neutral-200">
                {file.content}
              </pre>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <p>No preview text available for this file.</p>
                <button
                  onClick={() => onDownload(file)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
                >
                  Download to View
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
