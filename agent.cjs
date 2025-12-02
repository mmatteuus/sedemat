const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  ensureDataFile,
  getBasePath,
  updateBasePath,
  login,
  listDepartments,
  saveDepartment,
  toggleDepartmentStatus,
  listUsers,
  saveUser,
  toggleUserStatus,
  getUserPermissions,
  saveUserPermissions,
  listFiles,
  buildPreview,
} = require('./electron/data-store.cjs');

const PORT = Number(process.env.SEDEMAT_AGENT_PORT || 6464);
const ORIGIN = process.env.SEDEMAT_AGENT_ORIGIN || '*';
const DATA_DIR =
  process.env.SEDEMAT_AGENT_DATA_DIR ||
  path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'pastas-sedemat');

fs.mkdirSync(DATA_DIR, { recursive: true });

const appContext = {
  getPath: () => DATA_DIR,
};

ensureDataFile(appContext);

const log = (...args) => {
  if (process.env.SEDEMAT_AGENT_LOG !== 'false') {
    console.log('[agent]', ...args);
  }
};

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
};

const sendJson = (res, status, payload) => {
  setCors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString());
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

const normalizeUserPayload = (body) => {
  if (body.user) {
    return { ...body.user, password: body.password };
  }
  return body;
};

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/health') {
      return sendJson(res, 200, { status: 'ok' });
    }

    if (req.method === 'GET' && pathname === '/bootstrap') {
      const basePath = getBasePath(appContext);
      return sendJson(res, 200, { basePath });
    }

    if (req.method === 'POST' && pathname === '/base-path') {
      const body = await parseBody(req);
      const result = updateBasePath(appContext, body.basePath);
      return sendJson(res, 200, result);
    }

    if (req.method === 'POST' && pathname === '/login') {
      const body = await parseBody(req);
      const user = login(appContext, body.cpf, body.password);
      return sendJson(res, 200, user);
    }

    if (req.method === 'GET' && pathname === '/departments/list') {
      const departments = listDepartments(appContext);
      return sendJson(res, 200, departments);
    }

    if (req.method === 'POST' && pathname === '/departments/save') {
      const body = await parseBody(req);
      const dept = saveDepartment(appContext, body);
      return sendJson(res, 200, dept);
    }

    if (req.method === 'POST' && pathname === '/departments/toggle') {
      const body = await parseBody(req);
      const dept = toggleDepartmentStatus(appContext, body.id, body.active);
      return sendJson(res, 200, dept);
    }

    if (req.method === 'GET' && pathname === '/users/list') {
      const users = listUsers(appContext);
      return sendJson(res, 200, users);
    }

    if (req.method === 'POST' && pathname === '/users/save') {
      const body = await parseBody(req);
      const user = saveUser(appContext, normalizeUserPayload(body));
      return sendJson(res, 200, user);
    }

    if (req.method === 'POST' && pathname === '/users/toggle') {
      const body = await parseBody(req);
      const user = toggleUserStatus(appContext, body.id, body.active);
      return sendJson(res, 200, user);
    }

    if (req.method === 'POST' && pathname === '/permissions/get') {
      const body = await parseBody(req);
      const permissions = getUserPermissions(appContext, body.userId);
      return sendJson(res, 200, permissions);
    }

    if (req.method === 'POST' && pathname === '/permissions/save') {
      const body = await parseBody(req);
      const permissions = saveUserPermissions(appContext, body.userId, body.departmentIds || []);
      return sendJson(res, 200, permissions);
    }

    if (req.method === 'GET' && pathname === '/files/list') {
      const departmentId = url.searchParams.get('departmentId');
      const relativePath = url.searchParams.get('relativePath') || '';
      if (!departmentId) return sendJson(res, 400, { error: 'departmentId requerido' });
      const departments = listDepartments(appContext);
      const dept = departments.find((d) => d.id === departmentId);
      if (!dept) return sendJson(res, 404, { error: 'Departamento nao encontrado' });
      const files = listFiles(dept, relativePath);
      return sendJson(res, 200, files);
    }

    if (req.method === 'POST' && pathname === '/files/preview') {
      const body = await parseBody(req);
      const preview = buildPreview(body.fullPath, body.type);
      return sendJson(res, 200, preview);
    }

    if (req.method === 'GET' && pathname === '/files/download') {
      const fullPath = url.searchParams.get('fullPath');
      if (!fullPath || !fs.existsSync(fullPath)) {
        return sendJson(res, 404, { error: 'Arquivo nao encontrado' });
      }
      const stat = fs.statSync(fullPath);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      setCors(res);
      const stream = fs.createReadStream(fullPath);
      stream.on('error', (err) => {
        log('Falha ao ler arquivo', err);
        if (!res.headersSent) {
          sendJson(res, 500, { error: 'Falha ao ler arquivo' });
        } else {
          res.destroy(err);
        }
      });
      return stream.pipe(res);
    }

    return sendJson(res, 404, { error: 'Rota nao encontrada' });
  } catch (error) {
    log('Erro', error);
    return sendJson(res, 500, { error: error.message || 'Erro interno' });
  }
});

server.listen(PORT, () => {
  log(`Agente HTTP escutando em http://localhost:${PORT}`);
});
