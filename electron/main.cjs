const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell, dialog, nativeImage } = require('electron');
const {
  getBasePath,
  ensureDataFile,
  login,
  listUsers,
  saveUser,
  toggleUserStatus,
  listDepartments,
  saveDepartment,
  toggleDepartmentStatus,
  getUserPermissions,
  saveUserPermissions,
  listFiles,
  buildPreview,
  updateBasePath,
} = require('./data-store.cjs');

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const iconPath = path.join(__dirname, 'icon.ico');
const treeIcon = nativeImage.createFromPath(iconPath);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    icon: treeIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
};

app.whenReady().then(() => {
  ensureDataFile(app);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('bootstrap', async () => ({ basePath: getBasePath(app) }));
ipcMain.handle('basePath:update', async (_, payload) => updateBasePath(app, payload.basePath));

ipcMain.handle('auth:login', async (_, payload) => login(app, payload.cpf, payload.password));

ipcMain.handle('departments:list', async () => listDepartments(app));
ipcMain.handle('departments:save', async (_, payload) => saveDepartment(app, payload));
ipcMain.handle('departments:toggle', async (_, payload) =>
  toggleDepartmentStatus(app, payload.id, payload.active),
);

ipcMain.handle('users:list', async () => listUsers(app));
ipcMain.handle('users:save', async (_, payload) =>
  saveUser(app, { ...payload.user, password: payload.password }),
);
ipcMain.handle('users:toggle', async (_, payload) => toggleUserStatus(app, payload.id, payload.active));

ipcMain.handle('permissions:get', async (_, payload) => getUserPermissions(app, payload.userId));
ipcMain.handle('permissions:save', async (_, payload) =>
  saveUserPermissions(app, payload.userId, payload.departmentIds),
);

ipcMain.handle('files:list', async (_, payload) => {
  const departments = listDepartments(app);
  const department = departments.find((d) => d.id === payload.departmentId);
  if (!department) {
    throw new Error('Departamento nao encontrado');
  }
  try {
    return listFiles(department, payload.relativePath || '');
  } catch (error) {
    throw new Error('Falha ao listar arquivos. Verifique o acesso ao compartilhamento de rede.');
  }
});

ipcMain.handle('files:preview', async (_, payload) => buildPreview(payload.fullPath, payload.type));

ipcMain.handle('files:open', async (_, payload) => {
  await shell.openPath(payload.fullPath);
});

ipcMain.handle('files:download', async (_, payload) => {
  const result = await dialog.showSaveDialog({
    title: 'Salvar copia do arquivo',
    defaultPath: path.basename(payload.fullPath),
  });
  if (result.canceled || !result.filePath) return null;
  fs.copyFileSync(payload.fullPath, result.filePath);
  return result.filePath;
});
