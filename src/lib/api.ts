import { mockDepartments, mockFiles, mockUsers } from '@/data/mockData';
import { Department, FileItem, FilePreviewData, User } from '@/types';

type DesktopAPI = {
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
};

const desktopApi: DesktopAPI | undefined = (globalThis as any).desktopAPI;

let fallbackUsers = [...mockUsers];
let fallbackDepartments = [...mockDepartments];
let fallbackFiles = [...mockFiles];

const buildInitialPassword = (name: string, cpf: string) =>
  `${name.trim().charAt(0).toLowerCase()}${cpf.substring(0, 6)}`;

const ensureDesktop = () => !!desktopApi;

export const api = {
  async bootstrap() {
    if (ensureDesktop()) {
      return desktopApi!.bootstrap();
    }
    return { basePath: mockDepartments[0]?.path ?? '' };
  },

  async login(cpf: string, password: string): Promise<User> {
    if (ensureDesktop()) {
      return desktopApi!.login({ cpf, password });
    }

    const user = fallbackUsers.find((u) => (u.cpf === cpf || u.login === cpf) && u.active);
    if (!user) {
      throw new Error('Usuario nao encontrado ou inativo');
    }
    const expectedPassword = buildInitialPassword(user.name, user.cpf);
    if (password !== expectedPassword && password !== 'admin') {
      throw new Error('Senha invalida');
    }
    return user;
  },

  async listDepartments(): Promise<Department[]> {
    if (ensureDesktop()) {
      return desktopApi!.listDepartments();
    }
    return fallbackDepartments;
  },

  async saveDepartment(payload: Partial<Department>): Promise<Department> {
    if (ensureDesktop()) {
      return desktopApi!.saveDepartment(payload);
    }
    if (payload.id) {
      fallbackDepartments = fallbackDepartments.map((d) => (d.id === payload.id ? { ...d, ...payload } as Department : d));
      return fallbackDepartments.find((d) => d.id === payload.id)!;
    }
    const newDept: Department = {
      id: payload.name?.toLowerCase().replace(/\s+/g, '-') ?? `dept-${Date.now()}`,
      name: payload.name ?? 'NOVO DEPARTAMENTO',
      path: payload.path ?? '',
      defaultAccess: payload.defaultAccess ?? false,
      active: payload.active ?? true,
    };
    fallbackDepartments.push(newDept);
    return newDept;
  },

  async toggleDepartmentStatus(payload: { id: string; active: boolean }): Promise<Department> {
    if (ensureDesktop()) {
      return desktopApi!.toggleDepartmentStatus(payload);
    }
    fallbackDepartments = fallbackDepartments.map((d) => (d.id === payload.id ? { ...d, active: payload.active } : d));
    return fallbackDepartments.find((d) => d.id === payload.id)!;
  },

  async listUsers(): Promise<User[]> {
    if (ensureDesktop()) {
      return desktopApi!.listUsers();
    }
    return fallbackUsers;
  },

  async saveUser(payload: { user: Partial<User>; password?: string }): Promise<User> {
    if (ensureDesktop()) {
      return desktopApi!.saveUser(payload);
    }
    if (payload.user.id) {
      fallbackUsers = fallbackUsers.map((u) => (u.id === payload.user.id ? { ...u, ...payload.user } as User : u));
      return fallbackUsers.find((u) => u.id === payload.user.id)!;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: payload.user.name ?? 'Novo Usuario',
      cpf: payload.user.cpf ?? '',
      login: payload.user.login ?? payload.user.cpf ?? '',
      role: payload.user.role ?? 'SERVIDOR',
      active: payload.user.active ?? true,
      departments: payload.user.departments ?? [],
    };
    fallbackUsers.push(newUser);
    return newUser;
  },

  async toggleUserStatus(payload: { id: string; active: boolean }): Promise<User> {
    if (ensureDesktop()) {
      return desktopApi!.toggleUserStatus(payload);
    }
    fallbackUsers = fallbackUsers.map((u) => (u.id === payload.id ? { ...u, active: payload.active } : u));
    return fallbackUsers.find((u) => u.id === payload.id)!;
  },

  async getUserPermissions(payload: { userId: string }): Promise<string[]> {
    if (ensureDesktop()) {
      return desktopApi!.getUserPermissions(payload);
    }
    const user = fallbackUsers.find((u) => u.id === payload.userId);
    return user?.departments ?? [];
  },

  async saveUserPermissions(payload: { userId: string; departmentIds: string[] }): Promise<string[]> {
    if (ensureDesktop()) {
      return desktopApi!.saveUserPermissions(payload);
    }
    fallbackUsers = fallbackUsers.map((u) =>
      u.id === payload.userId ? { ...u, departments: payload.departmentIds } : u,
    );
    return payload.departmentIds;
  },

  async listFiles(payload: { departmentId: string; relativePath?: string }): Promise<FileItem[]> {
    if (ensureDesktop()) {
      return desktopApi!.listFiles(payload);
    }
    const relativePath = payload.relativePath ?? '';
    return fallbackFiles
      .filter((f) => f.departmentId === payload.departmentId && (f.relativePath ?? '') === relativePath);
  },

  async previewFile(payload: { fullPath: string; type: FileItem['type'] }): Promise<FilePreviewData> {
    if (ensureDesktop()) {
      return desktopApi!.previewFile(payload);
    }
    if (payload.type === 'image') {
      return { mode: 'image', src: '', message: 'Preview indisponivel no modo web' };
    }
    if (payload.type === 'pdf') {
      return { mode: 'pdf', src: '', message: 'Preview indisponivel no modo web' };
    }
    return { mode: 'unsupported', message: 'Preview indisponivel' };
  },

  async openFile(payload: { fullPath: string }) {
    if (ensureDesktop()) {
      return desktopApi!.openFile(payload);
    }
    return;
  },

  async downloadFile(payload: { fullPath: string }) {
    if (ensureDesktop()) {
      return desktopApi!.downloadFile(payload);
    }
    return null;
  },
};
