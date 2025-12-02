const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_BASE_PATH = '';

const resolveBasePath = () => process.env.SEDEMAT_BASE_PATH || DEFAULT_BASE_PATH;

const buildDefaultDepartments = (basePath) => {
  if (!basePath) return [];
  return [
    { id: 'administrativo', name: 'ADMINISTRATIVO', path: `${basePath}\\ADMINISTRATIVO`, defaultAccess: false, active: true },
    { id: 'desenvolvimento', name: 'DESENVOLVIMENTO ECONOMICO', path: `${basePath}\\DESENVOLVIMENTO ECONOMICO`, defaultAccess: false, active: true },
    { id: 'fiscalizacao', name: 'FISCALIZACAO', path: `${basePath}\\FISCALIZACAO`, defaultAccess: false, active: true },
    { id: 'geral-meio-ambiente', name: 'GERAL MEIO AMBIENTE', path: `${basePath}\\GERAL MEIO AMBIENTE`, defaultAccess: false, active: true },
    { id: 'juridico', name: 'JURIDICO', path: `${basePath}\\JURIDICO`, defaultAccess: false, active: true },
    { id: 'licenciamento', name: 'LICENCIAMENTO', path: `${basePath}\\LICENCIAMENTO`, defaultAccess: false, active: true },
    { id: 'turismo', name: 'TURISMO', path: `${basePath}\\TURISMO`, defaultAccess: false, active: true },
    { id: 'geral-sedemat', name: 'GERAL SEDEMAT', path: `${basePath}\\GERAL SEDEMAT`, defaultAccess: true, active: true },
    { id: 'scan', name: 'SCAN', path: `${basePath}\\SCAN`, defaultAccess: true, active: true },
  ];
};

const buildDefaultUsers = (defaultDepartments) => [
  {
    id: '1',
    name: 'Gestor TI',
    cpf: '12345678901',
    login: '12345678901',
    role: 'GESTOR_TI',
    active: true,
    departments: defaultDepartments.map((d) => d.id),
  },
  {
    id: '2',
    name: 'Joao Santos',
    cpf: '98765432100',
    login: '98765432100',
    role: 'SERVIDOR',
    active: true,
    departments: ['licenciamento', 'juridico', 'geral-sedemat', 'scan'],
  },
];

const buildInitialPassword = (name, cpf) => `${name.trim().charAt(0).toLowerCase()}${cpf.substring(0, 6)}`;
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

const ensureDataFile = (app) => {
  const filePath = path.join(app.getPath('userData'), 'sedemat-data.json');
  if (!fs.existsSync(filePath)) {
    const basePath = resolveBasePath();
    const defaultDepartments = buildDefaultDepartments(basePath);
    const defaultUsers = buildDefaultUsers(defaultDepartments);
    const usersWithPasswords = defaultUsers.map((u) => ({
      ...u,
      passwordHash: hashPassword(buildInitialPassword(u.name, u.cpf)),
    }));
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          users: usersWithPasswords,
          departments: defaultDepartments,
          basePath,
        },
        null,
        2,
      ),
      'utf-8',
    );
  }
  return filePath;
};

const readData = (app) => {
  const filePath = ensureDataFile(app);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let changed = false;

  const envBase = resolveBasePath();
  if (!data.basePath && envBase) {
    data.basePath = envBase;
    changed = true;
  }

  const basePath = data.basePath || envBase || '';

  // Guarantee default departments exist
  const defaultDepartments = buildDefaultDepartments(basePath);
  const existingIds = new Set((data.departments || []).map((d) => d.id));
  defaultDepartments.forEach((dept) => {
    if (!existingIds.has(dept.id)) {
      data.departments.push(dept);
      changed = true;
    }
  });

  if (changed) {
    saveData(app, data);
  }

  return data;
};

const saveData = (app, data) => {
  const filePath = ensureDataFile(app);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

const listUsers = (app) => {
  const data = readData(app);
  return data.users.map(sanitizeUser);
};

const login = (app, cpfOrLogin, password) => {
  const data = readData(app);
  const user = data.users.find((u) => u.cpf === cpfOrLogin || u.login === cpfOrLogin);
  if (!user || !user.active) {
    throw new Error('Usuario nao encontrado ou inativo');
  }
  const expected = user.passwordHash ?? hashPassword(buildInitialPassword(user.name, user.cpf));
  const providedHash = hashPassword(password);
  if (providedHash !== expected) {
    throw new Error('Senha invalida');
  }
  return sanitizeUser(user);
};

const saveUser = (app, payload) => {
  const data = readData(app);
  if (payload.id) {
    data.users = data.users.map((user) => {
      if (user.id !== payload.id) return user;
      return {
        ...user,
        ...payload,
        passwordHash: payload.password
          ? hashPassword(payload.password)
          : user.passwordHash ?? hashPassword(buildInitialPassword(user.name, user.cpf)),
      };
    });
    const updated = data.users.find((u) => u.id === payload.id);
    saveData(app, data);
    return sanitizeUser(updated);
  }

  const newUser = {
    id: `${Date.now()}`,
    name: payload.name,
    cpf: payload.cpf,
    login: payload.login || payload.cpf,
    role: payload.role || 'SERVIDOR',
    active: payload.active ?? true,
    departments: payload.departments || [],
    passwordHash: hashPassword(payload.password || buildInitialPassword(payload.name, payload.cpf)),
  };

  data.users.push(newUser);
  saveData(app, data);
  return sanitizeUser(newUser);
};

const toggleUserStatus = (app, id, active) => {
  const data = readData(app);
  data.users = data.users.map((u) => (u.id === id ? { ...u, active } : u));
  saveData(app, data);
  const updated = data.users.find((u) => u.id === id);
  return sanitizeUser(updated);
};

const getBasePath = (app) => {
  const data = readData(app);
  return data.basePath || resolveBasePath();
};

const updateBasePath = (app, newBasePath) => {
  const data = readData(app);
  const previousBase = data.basePath || resolveBasePath();
  const targetBase = newBasePath || resolveBasePath();

  data.basePath = targetBase;
  data.departments = data.departments.map((dept) => {
    if (previousBase && dept.path.startsWith(previousBase)) {
      const relative = dept.path.slice(previousBase.length);
      return { ...dept, path: targetBase + relative };
    }
    return dept;
  });

  const defaultDepartments = buildDefaultDepartments(targetBase);
  const existingIds = new Set(data.departments.map((d) => d.id));
  defaultDepartments.forEach((dept) => {
    if (!existingIds.has(dept.id)) {
      data.departments.push(dept);
    }
  });

  saveData(app, data);
  return { basePath: data.basePath };
};

const listDepartments = (app) => {
  const data = readData(app);
  return data.departments;
};

const saveDepartment = (app, dept) => {
  const data = readData(app);
  if (dept.id) {
    data.departments = data.departments.map((d) => (d.id === dept.id ? { ...d, ...dept } : d));
    saveData(app, data);
    return data.departments.find((d) => d.id === dept.id);
  }
  const newDept = {
    id: dept.name ? dept.name.toLowerCase().replace(/\s+/g, '-') : `dept-${Date.now()}`,
    name: dept.name || 'NOVO DEPARTAMENTO',
    path: dept.path || getBasePath(app),
    defaultAccess: dept.defaultAccess ?? false,
    active: dept.active ?? true,
  };
  data.departments.push(newDept);
  saveData(app, data);
  return newDept;
};

const toggleDepartmentStatus = (app, id, active) => {
  const data = readData(app);
  data.departments = data.departments.map((d) => (d.id === id ? { ...d, active } : d));
  saveData(app, data);
  return data.departments.find((d) => d.id === id);
};

const getUserPermissions = (app, userId) => {
  const data = readData(app);
  const user = data.users.find((u) => u.id === userId);
  if (!user) return [];
  const defaults = data.departments.filter((d) => d.defaultAccess).map((d) => d.id);
  return Array.from(new Set([...(user.departments || []), ...defaults]));
};

const saveUserPermissions = (app, userId, departmentIds) => {
  const data = readData(app);
  const defaults = data.departments.filter((d) => d.defaultAccess).map((d) => d.id);
  const permissions = Array.from(new Set([...departmentIds, ...defaults]));
  data.users = data.users.map((u) => (u.id === userId ? { ...u, departments: permissions } : u));
  saveData(app, data);
  return permissions;
};

const detectFileType = (entryName) => {
  const ext = path.extname(entryName).toLowerCase();
  if (['.pdf'].includes(ext)) return 'pdf';
  if (['.doc', '.docx'].includes(ext)) return 'word';
  if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'excel';
  if (['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(ext)) return 'image';
  return 'other';
};

const listFiles = (department, relativePath = '') => {
  const targetPath = relativePath ? path.join(department.path, relativePath) : department.path;
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });

  return entries.map((entry) => {
    const fullPath = path.join(targetPath, entry.name);
    const stats = fs.statSync(fullPath);
    const type = entry.isDirectory() ? 'folder' : detectFileType(entry.name);
    return {
      id: fullPath,
      name: entry.name,
      type,
      departmentId: department.id,
      relativePath,
      fullPath,
      modifiedDate: stats.mtime.toISOString(),
      size: entry.isDirectory() ? undefined : `${Math.max(1, Math.round(stats.size / 1024))} KB`,
    };
  });
};

const buildPreview = (fullPath, type) => {
  if (type === 'image') {
    const buffer = fs.readFileSync(fullPath);
    const mime = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
    }[path.extname(fullPath).toLowerCase()] || 'image/png';
    const src = `data:${mime};base64,${buffer.toString('base64')}`;
    return { mode: 'image', src };
  }

  if (type === 'pdf') {
    return { mode: 'pdf', src: `file://${fullPath}` };
  }

  return { mode: 'unsupported', message: 'Preview nao disponivel, abra o arquivo para visualizar' };
};

module.exports = {
  DEFAULT_BASE_PATH,
  ensureDataFile,
  readData,
  saveData,
  getBasePath,
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
};
