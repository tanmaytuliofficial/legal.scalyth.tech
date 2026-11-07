export type DeviceInfo = {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  platform?: string;
  screenResolution?: string;
  userAgent: string;
};

export type AccessAction = 
  | 'VIEW'
  | 'DOWNLOAD'
  | 'UNLOCK'
  | 'FAILED_UNLOCK'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN';

export type AccessStatus = 'SUCCESS' | 'DENIED' | 'FLAGGED';

export type AccessLog = {
  id: string;
  timestamp: string;
  fileId?: string;
  fileName?: string;
  folderId?: string;
  userName: string;
  userRole?: string;
  action: AccessAction;
  device: DeviceInfo;
  ipAddress: string;
  status: AccessStatus;
  notes?: string;
};

export type LegalFolder = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
};

export type LegalFile = {
  id: string;
  folderId: string;
  name: string;
  category: string;
  description: string;
  mimeType: string;
  size: number;
  isPasswordProtected: boolean;
  password?: string; // Stored securely on server only
  hasPassword?: boolean; // Sent to client without revealing password
  content?: string; // Text/Markdown/HTML or Base64 data URI
  fileType: 'document' | 'pdf' | 'spreadsheet' | 'contract' | 'archive' | 'other';
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  tags?: string[];
};

export type UserSession = {
  authenticated: boolean;
  userName: string;
  role: string;
  loginTime: string;
  deviceSummary?: string;
};
