const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  bootstrap: () => ipcRenderer.invoke('bootstrap'),
  login: (payload) => ipcRenderer.invoke('auth:login', payload),
  listDepartments: () => ipcRenderer.invoke('departments:list'),
  saveDepartment: (payload) => ipcRenderer.invoke('departments:save', payload),
  toggleDepartmentStatus: (payload) => ipcRenderer.invoke('departments:toggle', payload),
  listUsers: () => ipcRenderer.invoke('users:list'),
  saveUser: (payload) => ipcRenderer.invoke('users:save', payload),
  toggleUserStatus: (payload) => ipcRenderer.invoke('users:toggle', payload),
  getUserPermissions: (payload) => ipcRenderer.invoke('permissions:get', payload),
  saveUserPermissions: (payload) => ipcRenderer.invoke('permissions:save', payload),
  listFiles: (payload) => ipcRenderer.invoke('files:list', payload),
  previewFile: (payload) => ipcRenderer.invoke('files:preview', payload),
  openFile: (payload) => ipcRenderer.invoke('files:open', payload),
  downloadFile: (payload) => ipcRenderer.invoke('files:download', payload),
});
