'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Laptop, 
  Smartphone, 
  Tablet, 
  FileText
} from 'lucide-react';
import { AccessLog } from '@/types/legal';

type AuditStats = {
  totalEvents: number;
  totalViews: number;
  totalDownloads: number;
  totalFailed: number;
  uniqueDevices: number;
};

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs?limit=300');
      const data = await res.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.userName?.toLowerCase().includes(query) ||
      log.fileName?.toLowerCase().includes(query) ||
      log.ipAddress?.toLowerCase().includes(query) ||
      log.device?.os?.toLowerCase().includes(query) ||
      log.device?.browser?.toLowerCase().includes(query) ||
      log.notes?.toLowerCase().includes(query);

    return matchesAction && matchesSearch;
  });

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-neutral-400" />;
    if (deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-neutral-400" />;
    return <Laptop className="w-3.5 h-3.5 text-neutral-400" />;
  };

  const getActionBadge = (action: string, status: string) => {
    if (status === 'DENIED' || action === 'FAILED_UNLOCK') {
      return (
        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40">
          Wrong password
        </span>
      );
    }
    if (action === 'VIEW') {
      return (
        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
          Viewed
        </span>
      );
    }
    if (action === 'DOWNLOAD') {
      return (
        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
          Downloaded
        </span>
      );
    }
    if (action === 'UNLOCK') {
      return (
        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
          Unlocked
        </span>
      );
    }
    if (action === 'LOGIN') {
      return (
        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
          Signed in
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-900 text-neutral-400">
        {action.toLowerCase()}
      </span>
    );
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'File', 'Device OS', 'Browser', 'IP Address', 'Status', 'Notes'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole || ''}"`,
      `"${l.action}"`,
      `"${l.fileName || 'N/A'}"`,
      `"${l.device?.os || ''}"`,
      `"${l.device?.browser || ''}"`,
      `"${l.ipAddress}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scalyth-legal-access-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Access History
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit log of document views, downloads, device types, and IP addresses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
          <div className="text-[11px] text-neutral-400">Total events</div>
          <div className="text-lg font-semibold text-white mt-0.5">{stats?.totalEvents ?? logs.length}</div>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
          <div className="text-[11px] text-neutral-400">Document views</div>
          <div className="text-lg font-semibold text-white mt-0.5">{stats?.totalViews ?? 0}</div>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
          <div className="text-[11px] text-neutral-400">Downloads</div>
          <div className="text-lg font-semibold text-white mt-0.5">{stats?.totalDownloads ?? 0}</div>
        </div>

        <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
          <div className="text-[11px] text-neutral-400">Denied attempts</div>
          <div className={`text-lg font-semibold mt-0.5 ${(stats?.totalFailed ?? 0) > 0 ? 'text-red-400' : 'text-neutral-400'}`}>
            {stats?.totalFailed ?? 0}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by user, file, IP, device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono text-[11px]"
          />
        </div>

        {/* Action filter pills */}
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {['ALL', 'VIEW', 'UNLOCK', 'DOWNLOAD', 'LOGIN', 'FAILED_UNLOCK'].map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={`px-2 py-1 rounded-md transition ${
                selectedAction === act
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {act === 'ALL' ? 'All' : act === 'FAILED_UNLOCK' ? 'Failed' : act.charAt(0) + act.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-800/80 overflow-hidden bg-neutral-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 border-b border-neutral-800/80 text-neutral-400 font-medium">
              <tr>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">File</th>
                <th className="py-2.5 px-3">Device</th>
                <th className="py-2.5 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-neutral-500">
                    No matching activity recorded
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const dateStr = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                  const timeStr = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-neutral-900/30 transition-colors ${
                        log.status === 'DENIED' ? 'bg-red-950/10' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                        {dateStr} {timeStr}
                      </td>

                      {/* User */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-neutral-200">
                        {log.userName}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getActionBadge(log.action, log.status)}
                      </td>

                      {/* File */}
                      <td className="py-2.5 px-3 max-w-xs">
                        {log.fileName ? (
                          <div className="flex items-center gap-1.5 truncate text-neutral-300" title={log.fileName}>
                            <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span className="truncate">{log.fileName}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>

                      {/* Device */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-neutral-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {getDeviceIcon(log.device?.deviceType)}
                          <span>
                            {log.device?.os || 'Desktop'} · {log.device?.browser || 'Browser'}
                          </span>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
