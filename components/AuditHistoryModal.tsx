'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Laptop, 
  Smartphone, 
  Tablet
} from 'lucide-react';
import { AccessLog, LegalFile } from '@/types/legal';

interface AuditHistoryModalProps {
  file: LegalFile;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ file, onClose }) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`/api/logs?fileId=${file.id}`);
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error('Failed to load file history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [file.id]);

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-neutral-400" />;
    if (deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-neutral-400" />;
    return <Laptop className="w-3.5 h-3.5 text-neutral-400" />;
  };

  const getActionBadge = (action: string, status: string) => {
    if (status === 'DENIED' || action === 'FAILED_UNLOCK') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40">
          Wrong password
        </span>
      );
    }
    if (action === 'VIEW') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
          Viewed
        </span>
      );
    }
    if (action === 'DOWNLOAD') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
          Downloaded
        </span>
      );
    }
    if (action === 'UNLOCK') {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
          Unlocked
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-900 text-neutral-400">
        {action.toLowerCase()}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl text-neutral-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
          <div>
            <h3 className="text-xs font-semibold text-white">Document Activity</h3>
            <p className="text-[11px] text-neutral-400 truncate max-w-sm mt-0.5">
              {file.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-neutral-950">
          {loading ? (
            <div className="text-center py-10 text-neutral-500 text-xs">
              Loading activity...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">
              No recorded views yet.
            </div>
          ) : (
            logs.map((log) => {
              const dateObj = new Date(log.timestamp);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    log.status === 'DENIED'
                      ? 'bg-red-950/20 border-red-900/40 text-red-200'
                      : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action, log.status)}
                      <span className="font-medium text-neutral-200">
                        {log.userName}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-neutral-500">
                      {formattedDate} {formattedTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1.5 border-t border-neutral-800/60">
                    <div className="flex items-center gap-1.5">
                      {getDeviceIcon(log.device?.deviceType)}
                      <span>
                        {log.device?.os || 'Desktop'} · {log.device?.browser || 'Browser'}
                      </span>
                    </div>

                    <span className="font-mono text-neutral-500 text-[10px]">
                      {log.ipAddress}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-500">
          <span>{logs.length} logged events</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
