'use client';

import React, { useState, useEffect } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { Navbar } from '@/components/Navbar';
import { FileLibraryView } from '@/components/FileLibraryView';
import { AuditLogsView } from '@/components/AuditLogsView';
import { PasswordModal } from '@/components/PasswordModal';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';
import { AuditHistoryModal } from '@/components/AuditHistoryModal';
import { NewFileModal } from '@/components/NewFileModal';
import { NewFolderModal } from '@/components/NewFolderModal';
import { LegalFolder, LegalFile, UserSession } from '@/types/legal';
import { getClientDeviceHints } from '@/lib/client-device';

export default function Home() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Navigation
  const [currentTab, setCurrentTab] = useState<'files' | 'audit'>('files');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [folders, setFolders] = useState<LegalFolder[]>([]);
  const [files, setFiles] = useState<LegalFile[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Modals
  const [fileToUnlock, setFileToUnlock] = useState<LegalFile | null>(null);
  const [viewingFile, setViewingFile] = useState<LegalFile | null>(null);
  const [historyFile, setHistoryFile] = useState<LegalFile | null>(null);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  // Check existing session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSession(data);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoadingSession(false);
      }
    }
    checkSession();
  }, []);

  // Fetch folders and files when authenticated
  const loadVaultData = async () => {
    try {
      const [foldersRes, filesRes] = await Promise.all([
        fetch('/api/folders'),
        fetch('/api/files'),
      ]);

      if (foldersRes.ok) {
        const fData = await foldersRes.json();
        setFolders(fData.folders || []);
      }
      if (filesRes.ok) {
        const flData = await filesRes.json();
        setFiles(flData.files || []);
      }
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  };

  useEffect(() => {
    if (session?.authenticated) {
      loadVaultData();
    }
  }, [session]);

  const handleLoginSuccess = (userData: UserSession) => {
    setSession(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setSession(null);
  };

  // Open file handler (checks password first)
  const handleOpenFile = async (file: LegalFile) => {
    if (file.isPasswordProtected) {
      // Trigger password prompt
      setFileToUnlock(file);
    } else {
      // Direct access
      try {
        const clientHint = getClientDeviceHints();
        const res = await fetch(`/api/files/${file.id}/access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'VIEW',
            userName: session?.userName || 'Scalyth Founder',
            clientHint,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setViewingFile(data.file);
          loadVaultData(); // refresh access count
        }
      } catch (err) {
        console.error('File view error:', err);
      }
    }
  };

  // Unlocked successfully via modal
  const handleUnlockSuccess = (unlockedFile: LegalFile) => {
    setFileToUnlock(null);
    setViewingFile(unlockedFile);
    loadVaultData(); // update counters
  };

  // Download handler (logs download event)
  const handleDownloadFile = async (file: LegalFile) => {
    try {
      const clientHint = getClientDeviceHints();
      let enteredPassword = '';
      if (file.isPasswordProtected) {
        enteredPassword = prompt(`Enter password to download "${file.name}":`) || '';
        if (!enteredPassword) return;
      }

      const res = await fetch(`/api/files/${file.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DOWNLOAD',
          password: enteredPassword,
          userName: session?.userName || 'Scalyth Founder',
          clientHint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to download file: password incorrect');
        return;
      }

      // Download payload as file
      const blob = new Blob([data.file.content || ''], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      loadVaultData();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Delete file
  const handleDeleteFile = async (file: LegalFile) => {
    if (!confirm(`Are you sure you want to permanently delete "${file.name}"? This action will be audited.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and its documents?')) return;
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
      if (res.ok) {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        if (activeFolderId === folderId) setActiveFolderId(null);
        loadVaultData();
      }
    } catch (err) {
      console.error('Delete folder error:', err);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          <p className="text-xs text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render the login page
  if (!session?.authenticated) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
        onOpenNewFile={() => setIsNewFileModalOpen(true)}
        onLogout={handleLogout}
        userName={session.userName}
        deviceSummary={session.deviceSummary}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'files' ? (
          <FileLibraryView
            folders={folders}
            files={files}
            activeFolderId={activeFolderId}
            setActiveFolderId={setActiveFolderId}
            searchQuery={searchQuery}
            onOpenFile={handleOpenFile}
            onViewHistory={(file) => setHistoryFile(file)}
            onDownloadFile={handleDownloadFile}
            onDeleteFile={handleDeleteFile}
            onDeleteFolder={handleDeleteFolder}
            onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
            onOpenNewFile={() => setIsNewFileModalOpen(true)}
          />
        ) : (
          <AuditLogsView />
        )}
      </main>

      {/* Password Modal for locked files */}
      {fileToUnlock && (
        <PasswordModal
          file={fileToUnlock}
          onClose={() => setFileToUnlock(null)}
          onUnlockSuccess={handleUnlockSuccess}
          userName={session.userName}
        />
      )}

      {/* Document Reader Modal */}
      {viewingFile && (
        <DocumentViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
          onViewHistory={(file) => {
            setViewingFile(null);
            setHistoryFile(file);
          }}
          onDownload={handleDownloadFile}
          userName={session.userName}
        />
      )}

      {/* File Audit History Modal */}
      {historyFile && (
        <AuditHistoryModal
          file={historyFile}
          onClose={() => setHistoryFile(null)}
        />
      )}

      {/* New File / Document Modal */}
      {isNewFileModalOpen && (
        <NewFileModal
          folders={folders}
          activeFolderId={activeFolderId}
          onClose={() => setIsNewFileModalOpen(false)}
          onFileCreated={(newFile) => {
            setIsNewFileModalOpen(false);
            setFiles((prev) => [newFile, ...prev]);
            loadVaultData();
          }}
          userName={session.userName}
        />
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <NewFolderModal
          onClose={() => setIsNewFolderModalOpen(false)}
          onFolderCreated={(newFolder) => {
            setIsNewFolderModalOpen(false);
            setFolders((prev) => [...prev, newFolder]);
            setActiveFolderId(newFolder.id);
          }}
          userName={session.userName}
        />
      )}
    </div>
  );
}
