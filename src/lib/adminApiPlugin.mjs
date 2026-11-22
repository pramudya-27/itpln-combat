import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'itplncombat713';
const SESSION_SECRET = process.env.ADMIN_SECRET || 'itpln-combat-session-secret-2026';

const ROOT_DIR = process.cwd();
const NEWS_DIR = path.join(ROOT_DIR, 'src', 'content', 'news');
const GALLERY_DIR = path.join(ROOT_DIR, 'src', 'content', 'gallery');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');

function ensureDirs() {
  [
    NEWS_DIR,
    GALLERY_DIR,
    DATA_DIR,
    path.join(UPLOADS_DIR, 'news'),
    path.join(UPLOADS_DIR, 'gallery'),
    path.join(UPLOADS_DIR, 'divisions'),
  ].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
}

function makeToken(username) {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${username}:${ADMIN_PASS}`)
    .digest('hex');
}

function safeRepoPath(relPath) {
  const clean = String(relPath || '').replace(/^\/+/, '');
  const resolved = path.resolve(ROOT_DIR, clean);
  if (!resolved.startsWith(ROOT_DIR)) {
    throw new Error('Invalid path outside repository');
  }
  return { clean: clean.replace(/\\/g, '/'), resolved };
}

function listMediaRecursive(dir, basePublicFolder = '/uploads') {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMediaRecursive(full, `${basePublicFolder}/${entry.name}`));
    } else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(entry.name)) {
      const relFromRoot = path.relative(ROOT_DIR, full).replace(/\\/g, '/');
      const publicUrl = `${basePublicFolder}/${entry.name}`;
      const stat = fs.statSync(full);
      results.push({
        id: relFromRoot,
        name: entry.name,
        path: relFromRoot,
        url: publicUrl,
        displayURL: publicUrl,
        size: stat.size,
        isDirectory: false,
      });
    }
  }
  return results;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 20 * 1024 * 1024) {
        reject(new Error('Payload terlalu besar'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('JSON tidak valid'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

function handleDecapProxyAction(body) {
  ensureDirs();
  const { action, params = {} } = body;

  if (action === 'info') {
    return {
      repo: 'itpln-combat',
      publish_modes: ['simple'],
      type: 'local_fs',
    };
  }

  if (action === 'entriesByFolder') {
    const { clean, resolved } = safeRepoPath(params.folder);
    const ext = params.extension ? `.${params.extension.replace(/^\./, '')}` : '';
    if (!fs.existsSync(resolved)) return [];
    const files = fs
      .readdirSync(resolved)
      .filter((f) => !f.startsWith('.') && (!ext || f.endsWith(ext)));
    return files.map((file) => {
      const full = path.join(resolved, file);
      const rel = `${clean}/${file}`;
      const stat = fs.statSync(full);
      return {
        file: {
          path: rel,
          label: file,
          id: rel,
          author: 'Admin ITPLN COMBAT',
          updatedOn: stat.mtime.toISOString(),
        },
        data: fs.readFileSync(full, 'utf8'),
      };
    });
  }

  if (action === 'entriesByFiles') {
    const files = Array.isArray(params.files) ? params.files : [];
    return files
      .map((f) => {
        const { clean, resolved } = safeRepoPath(f.path);
        if (!fs.existsSync(resolved)) return null;
        const stat = fs.statSync(resolved);
        return {
          file: {
            path: clean,
            label: f.label || path.basename(clean),
            id: clean,
            author: 'Admin ITPLN COMBAT',
            updatedOn: stat.mtime.toISOString(),
          },
          data: fs.readFileSync(resolved, 'utf8'),
        };
      })
      .filter(Boolean);
  }

  if (action === 'getEntry') {
    const { clean, resolved } = safeRepoPath(params.path);
    if (!fs.existsSync(resolved)) {
      return { file: { path: clean, id: clean }, data: '' };
    }
    const stat = fs.statSync(resolved);
    return {
      file: {
        path: clean,
        id: clean,
        author: 'Admin ITPLN COMBAT',
        updatedOn: stat.mtime.toISOString(),
      },
      data: fs.readFileSync(resolved, 'utf8'),
    };
  }

  if (action === 'persistEntry') {
    const dataFiles = Array.isArray(params.dataFiles)
      ? params.dataFiles
      : params.entry
      ? [params.entry]
      : [];
    const assets = Array.isArray(params.assets) ? params.assets : [];

    for (const df of dataFiles) {
      const { resolved } = safeRepoPath(df.path);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, String(df.raw ?? ''), 'utf8');
    }

    for (const asset of assets) {
      const { resolved } = safeRepoPath(asset.path);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      const buf = Buffer.from(asset.content || '', asset.encoding || 'base64');
      fs.writeFileSync(resolved, buf);
    }

    return { saved: true };
  }

  if (action === 'deleteFiles') {
    const paths = Array.isArray(params.paths) ? params.paths : [];
    for (const p of paths) {
      const { resolved } = safeRepoPath(p);
      if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
    }
    return { deleted: true };
  }

  if (action === 'getMedia') {
    const mediaFolder = params.mediaFolder || 'public/uploads';
    const { clean, resolved } = safeRepoPath(mediaFolder);
    const pubPrefix = '/' + clean.replace(/^public\/?/, '');
    return listMediaRecursive(resolved, pubPrefix);
  }

  if (action === 'getMediaFile') {
    const { clean, resolved } = safeRepoPath(params.path);
    const publicUrl = '/' + clean.replace(/^public\/?/, '');
    const size = fs.existsSync(resolved) ? fs.statSync(resolved).size : 0;
    return {
      id: clean,
      name: path.basename(clean),
      path: clean,
      url: publicUrl,
      displayURL: publicUrl,
      size,
    };
  }

  if (action === 'persistMedia') {
    const asset = params.asset || {};
    const { clean, resolved } = safeRepoPath(asset.path);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    const buf = Buffer.from(asset.content || '', asset.encoding || 'base64');
    fs.writeFileSync(resolved, buf);
    const publicUrl = '/' + clean.replace(/^public\/?/, '');
    return {
      id: clean,
      name: path.basename(clean),
      path: clean,
      url: publicUrl,
      displayURL: publicUrl,
      size: buf.length,
    };
  }

  return {};
}

function attachAdminMiddleware(server) {
  server.middlewares.use(async (req, res, next) => {
    const urlPath = (req.url || '').split('?')[0];

    try {
      // A. DECAP CMS LOCAL PROXY PROTOCOL (/api/v1)
      if (urlPath === '/api/v1') {
        if (req.method === 'GET') {
          return sendJson(res, 200, {
            repo: 'itpln-combat',
            publish_modes: ['simple'],
            type: 'local_fs',
          });
        }
        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          const result = handleDecapProxyAction(body);
          return sendJson(res, 200, result);
        }
      }

      // B. LOGIN VERIFICATION (/api/admin/login)
      if (req.method === 'POST' && urlPath === '/api/admin/login') {
        const body = await readJsonBody(req);
        const u = String(body.username || '').trim();
        const p = String(body.password || '');
        if (u === ADMIN_USER && p === ADMIN_PASS) {
          return sendJson(res, 200, {
            success: true,
            username: u,
            token: makeToken(u),
          });
        }
        return sendJson(res, 401, {
          success: false,
          error: 'Username atau password salah.',
        });
      }

      return next();
    } catch (err) {
      return sendJson(res, 500, { error: err.message || 'Server error' });
    }
  });
}

export function combatAdminApiPlugin() {
  return {
    name: 'combat-admin-api',
    configureServer(server) {
      attachAdminMiddleware(server);
    },
    configurePreviewServer(server) {
      attachAdminMiddleware(server);
    },
  };
}
