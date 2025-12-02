import type { Department, FileItem, FilePreviewData, User } from '../types';

declare global {
  interface Window {
    desktopAPI?: {
      bootstrap: () => Promise<{ basePath: string }>;
      login: (payload: { cpf: string; password: string }) => Promise<User>;
      listDepartments: () => Promise<Department[]>;
      saveDepartment: (payload: Partial<Department>) => Promise<Department>;
      toggleDepartmentStatus: (payload: { id: string; active: boolean }) => Promise<Department>;
      listUsers: () => Promise<User[]>;
      saveUser: (payload: { user: Partial<User>; password?: string }) => Promise<User>;
      toggleUserStatus: (payload: { id: string; active: boolean }) => Promise<User>;
      getUserPermissions: (payload: { userId: string }) => Promise<string[]>;
      saveUserPermissions: (payload: { userId: string; departmentIds: string[] }) => Promise<string[]>;
      listFiles: (payload: { departmentId: string; relativePath?: string }) => Promise<FileItem[]>;
      previewFile: (payload: { fullPath: string; type: FileItem['type'] }) => Promise<FilePreviewData>;
      openFile: (payload: { fullPath: string }) => Promise<void>;
      downloadFile: (payload: { fullPath: string }) => Promise<string | null>;
      updateBasePath: (payload: { basePath: string }) => Promise<{ basePath: string }>;
    };
  }
}

export {};
