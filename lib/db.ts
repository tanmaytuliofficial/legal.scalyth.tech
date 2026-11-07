import fs from 'fs';
import path from 'path';
import { LegalFolder, LegalFile, AccessLog } from '@/types/legal';

interface VaultDatabase {
  folders: LegalFolder[];
  files: LegalFile[];
  logs: AccessLog[];
  meta: {
    version: string;
    vaultName: string;
    organization: string;
    lastUpdated: string;
  };
}

const DB_PATH = path.join(process.cwd(), 'data', 'legal-vault.json');

const INITIAL_FOLDERS: LegalFolder[] = [
  {
    id: 'folder-founder-disclosure',
    name: 'Founder Disclosures',
    description: 'Founder declarations, equity covenants, and disclosures',
    color: 'emerald',
    icon: 'ShieldAlert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'folder-agreements-ndas',
    name: 'Agreements & NDAs',
    description: 'Contracts, NDAs, and service agreements',
    color: 'blue',
    icon: 'FileLock2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'folder-corporate-records',
    name: 'Corporate Records',
    description: 'Board resolutions, compliance, and corporate filings',
    color: 'purple',
    icon: 'Briefcase',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// No fake files - empty clean vault ready for real documents
const INITIAL_FILES: LegalFile[] = [];

const INITIAL_LOGS: AccessLog[] = [];

function initDB(): VaultDatabase {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData: VaultDatabase = {
      folders: INITIAL_FOLDERS,
      files: INITIAL_FILES,
      logs: INITIAL_LOGS,
      meta: {
        version: '2.0.0',
        vaultName: 'Scalyth Legal Vault',
        organization: 'Scalyth Technologies Inc.',
        lastUpdated: new Date().toISOString(),
      },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as VaultDatabase;
    return parsed;
  } catch (err) {
    console.error('Error reading vault DB, resetting to defaults:', err);
    const defaultData: VaultDatabase = {
      folders: INITIAL_FOLDERS,
      files: INITIAL_FILES,
      logs: INITIAL_LOGS,
      meta: {
        version: '2.0.0',
        vaultName: 'Scalyth Legal Vault',
        organization: 'Scalyth Technologies Inc.',
        lastUpdated: new Date().toISOString(),
      },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function saveDB(data: VaultDatabase): void {
  data.meta.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function stripPassword(file: LegalFile): LegalFile {
  const safe = { ...file };
  delete safe.password;
  return {
    ...safe,
    hasPassword: Boolean(file.isPasswordProtected),
  };
}

export const db = {
  getVault(): VaultDatabase {
    return initDB();
  },

  getFolders(): LegalFolder[] {
    const data = initDB();
    return data.folders;
  },

  createFolder(folder: Omit<LegalFolder, 'id' | 'createdAt' | 'updatedAt'>): LegalFolder {
    const data = initDB();
    const newFolder: LegalFolder = {
      ...folder,
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.folders.push(newFolder);
    saveDB(data);
    return newFolder;
  },

  deleteFolder(folderId: string): boolean {
    const data = initDB();
    const index = data.folders.findIndex((f) => f.id === folderId);
    if (index === -1) return false;
    data.folders.splice(index, 1);
    data.files = data.files.filter((f) => f.folderId !== folderId);
    saveDB(data);
    return true;
  },

  getFiles(folderId?: string): LegalFile[] {
    const data = initDB();
    const list = folderId ? data.files.filter((f) => f.folderId === folderId) : data.files;
    return list.map((file) => stripPassword(file));
  },

  getFileById(fileId: string): LegalFile | null {
    const data = initDB();
    const file = data.files.find((f) => f.id === fileId);
    return file || null;
  },

  createFile(fileData: Omit<LegalFile, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): LegalFile {
    const data = initDB();
    const newFile: LegalFile = {
      ...fileData,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessedAt: undefined,
    };
    data.files.unshift(newFile);
    saveDB(data);

    return stripPassword(newFile);
  },

  updateFile(fileId: string, updates: Partial<LegalFile>): LegalFile | null {
    const data = initDB();
    const index = data.files.findIndex((f) => f.id === fileId);
    if (index === -1) return null;

    data.files[index] = {
      ...data.files[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDB(data);

    return stripPassword(data.files[index]);
  },

  deleteFile(fileId: string): boolean {
    const data = initDB();
    const index = data.files.findIndex((f) => f.id === fileId);
    if (index === -1) return false;
    data.files.splice(index, 1);
    saveDB(data);
    return true;
  },

  verifyFilePassword(fileId: string, passwordAttempt: string): { valid: boolean; file: LegalFile | null } {
    const data = initDB();
    const file = data.files.find((f) => f.id === fileId);
    if (!file) return { valid: false, file: null };

    if (!file.isPasswordProtected) {
      return { valid: true, file };
    }

    const masterPass = process.env.LEGAL_MASTER_PASSWORD || 'SCALYTH2026';
    const valid = file.password === passwordAttempt || masterPass === passwordAttempt;
    return { valid, file };
  },

  recordAccess(logData: Omit<AccessLog, 'id' | 'timestamp'>): AccessLog {
    const data = initDB();
    const newLog: AccessLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    if (logData.fileId && (logData.action === 'VIEW' || logData.action === 'DOWNLOAD' || logData.action === 'UNLOCK')) {
      const fileIndex = data.files.findIndex((f) => f.id === logData.fileId);
      if (fileIndex !== -1) {
        data.files[fileIndex].accessCount = (data.files[fileIndex].accessCount || 0) + 1;
        data.files[fileIndex].lastAccessedAt = newLog.timestamp;
      }
    }

    data.logs.unshift(newLog);
    if (data.logs.length > 1000) {
      data.logs = data.logs.slice(0, 1000);
    }
    saveDB(data);
    return newLog;
  },

  getAccessLogs(filter?: { fileId?: string; action?: string; limit?: number }): AccessLog[] {
    const data = initDB();
    let logs = data.logs;
    if (filter?.fileId) {
      logs = logs.filter((l) => l.fileId === filter.fileId);
    }
    if (filter?.action) {
      logs = logs.filter((l) => l.action === filter.action);
    }
    const limit = filter?.limit || 100;
    return logs.slice(0, limit);
  },
};
