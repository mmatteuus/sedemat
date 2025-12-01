export type UserRole = 'GESTOR_TI' | 'SERVIDOR';

export interface User {
  id: string;
  name: string;
  cpf: string;
  login: string;
  role: UserRole;
  active: boolean;
  departments: string[];
}

export interface Department {
  id: string;
  name: string;
  path: string;
  defaultAccess: boolean;
  active: boolean;
}

export type FileType = 'folder' | 'pdf' | 'word' | 'excel' | 'image' | 'other';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  modifiedDate: string;
  size?: string;
  relativePath: string;
  fullPath: string;
  departmentId: string;
}

export interface FilePreviewData {
  mode: 'image' | 'pdf' | 'unsupported';
  src?: string;
  message?: string;
}
