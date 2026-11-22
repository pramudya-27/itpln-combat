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

function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  return token === makeToken(ADMIN_USER);
}

function slugify(str) {
  return (
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 72) || `item-${Date.now()}`
  );
}

function yamlEscape(val) {
  return String(val ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, ' ');
}

function parseFrontmatterMd(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };
  const fmLines = match[1].split(/\r?\n/);
  const data = {};
  for (const line of fmLines) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (val === 'null' || val === '""' || val === "''") val = '';
    else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    data[key] = val;
  }
  return { data, body: match[2].trim() };
}

function readAllContent() {
  ensureDirs();

  // 1. News (*.md)
  const newsFiles = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('.md'));
  const news = newsFiles.map((file) => {
    const raw = fs.readFileSync(path.join(NEWS_DIR, file), 'utf8');
    const { data, body } = parseFrontmatterMd(raw);
    const fileSlug = file.replace(/\.md$/, '');
    return {
      fileSlug,
      slug: data.customSlug || fileSlug,
      title: data.title || fileSlug,
      description: data.description || '',
      featuredImage: data.featuredImage || '',
      imageAlt: data.imageAlt || data.title || '',
      category: data.category || 'Kegiatan',
      author: data.author || 'Admin ITPLN COMBAT',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      publishDate: data.publishDate || data.startDate || '',
      status: data.status || 'Published',
      featured: Boolean(data.featured),
      body,
    };
  });
  news.sort((a, b) => Date.parse(b.publishDate || b.startDate || 0) - Date.parse(a.publishDate || a.startDate || 0));

  // 2. Gallery (*.json)
  const galleryFiles = fs.readdirSync(GALLERY_DIR).filter((f) => f.endsWith('.json'));
  const gallery = galleryFiles.map((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, file), 'utf8'));
    const id = file.replace(/\.json$/, '');
    return {
      id,
      title: data.title || id,
      description: data.description || '',
      image: data.image || '',
      alt: data.alt || data.title || '',
      category: data.category || 'Training',
      date: data.date || '',
      featured: Boolean(data.featured),
      order: typeof data.order === 'number' ? data.order : 1,
      status: data.status || 'Published',
    };
  });
  gallery.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return Date.parse(b.date || 0) - Date.parse(a.date || 0);
  });

  // 3. Static config JSONs
  const readJson = (name, fallback) => {
    const p = path.join(DATA_DIR, name);
    if (!fs.existsSync(p)) return fallback;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
      return fallback;
    }
  };

  return {
    news,
    gallery,
    about: readJson('about.json', {}),
    settings: readJson('settings.json', {}),
    disciplines: readJson('disciplines.json', { items: [] }).items || [],
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 15 * 1024 * 1024) {
        reject(new Error('Payload terlalu besar (maksimal 15MB)'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
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

function attachAdminMiddleware(server) {
  server.middlewares.use(async (req, res, next) => {
    const urlPath = (req.url || '').split('?')[0];
    if (!urlPath.startsWith('/api/admin')) {
      return next();
    }

    try {
      // 1. POST /api/admin/login
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

      // 2. GET /api/admin/content (publicly readable so frontend stays 100% live in dev)
      if (req.method === 'GET' && urlPath === '/api/admin/content') {
        const data = readAllContent();
        return sendJson(res, 200, { success: true, data });
      }

      // Semua route write/delete wajib terautentikasi
      if (!isAuthorized(req)) {
        return sendJson(res, 401, {
          success: false,
          error: 'Sesi login tidak valid. Silakan login ulang.',
        });
      }

      // 3. POST /api/admin/upload (simpan file gambar ke public/uploads/{folder}/)
      if (req.method === 'POST' && urlPath === '/api/admin/upload') {
        ensureDirs();
        const body = await readJsonBody(req);
        const folder = ['news', 'gallery', 'divisions'].includes(body.folder)
          ? body.folder
          : 'gallery';
        const dataUrl = String(body.dataUrl || '');
        const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
        if (!match) {
          return sendJson(res, 400, {
            success: false,
            error: 'Format gambar tidak didukung (gunakan JPG, PNG, atau WEBP).',
          });
        }
        const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
        const baseName = slugify(String(body.filename || 'upload').replace(/\.[^.]+$/, ''));
        const finalName = `${baseName}-${Date.now()}.${ext}`;
        const destPath = path.join(UPLOADS_DIR, folder, finalName);
        fs.writeFileSync(destPath, Buffer.from(match[2], 'base64'));
        return sendJson(res, 200, {
          success: true,
          url: `/uploads/${folder}/${finalName}`,
        });
      }

      // 4. POST /api/admin/news (Create / Update src/content/news/*.md)
      if (req.method === 'POST' && urlPath === '/api/admin/news') {
        ensureDirs();
        const b = await readJsonBody(req);
        if (!b.title || !b.description || !b.startDate) {
          return sendJson(res, 400, {
            success: false,
            error: 'Judul, deskripsi singkat, dan tanggal mulai wajib diisi.',
          });
        }

        const slug = slugify(b.customSlug || b.fileSlug || b.title);
        const oldFileSlug = b.oldFileSlug ? slugify(b.oldFileSlug) : null;
        if (oldFileSlug && oldFileSlug !== slug) {
          const oldPath = path.join(NEWS_DIR, `${oldFileSlug}.md`);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const mdContent = [
          '---',
          `title: "${yamlEscape(b.title)}"`,
          `customSlug: "${yamlEscape(slug)}"`,
          `description: "${yamlEscape(b.description)}"`,
          `featuredImage: "${yamlEscape(b.featuredImage || '/logo.webp')}"`,
          `imageAlt: "${yamlEscape(b.imageAlt || b.title)}"`,
          `category: "${yamlEscape(b.category || 'Kegiatan')}"`,
          `author: "${yamlEscape(b.author || 'Admin ITPLN COMBAT')}"`,
          `startDate: "${yamlEscape(b.startDate)}"`,
          ...(b.endDate ? [`endDate: "${yamlEscape(b.endDate)}"`] : []),
          `publishDate: "${yamlEscape(b.publishDate || b.startDate)}"`,
          `status: "${yamlEscape(b.status || 'Published')}"`,
          `featured: ${Boolean(b.featured)}`,
          '---',
          '',
          String(b.body || b.description).trim(),
          '',
        ].join('\n');

        fs.writeFileSync(path.join(NEWS_DIR, `${slug}.md`), mdContent, 'utf8');
        return sendJson(res, 200, { success: true, slug, message: 'Berita berhasil disimpan.' });
      }

      // 5. DELETE /api/admin/news/:slug
      if (req.method === 'DELETE' && urlPath.startsWith('/api/admin/news/')) {
        const slug = slugify(decodeURIComponent(urlPath.replace('/api/admin/news/', '')));
        const target = path.join(NEWS_DIR, `${slug}.md`);
        if (fs.existsSync(target)) fs.unlinkSync(target);
        return sendJson(res, 200, { success: true, message: 'Berita berhasil dihapus.' });
      }

      // 6. POST /api/admin/gallery (Create / Update src/content/gallery/*.json)
      if (req.method === 'POST' && urlPath === '/api/admin/gallery') {
        ensureDirs();
        const b = await readJsonBody(req);
        if (!b.title || !b.image) {
          return sendJson(res, 400, {
            success: false,
            error: 'Judul foto dan gambar wajib diisi.',
          });
        }

        const id = slugify(b.id || b.title);
        const oldId = b.oldId ? slugify(b.oldId) : null;
        if (oldId && oldId !== id) {
          const oldPath = path.join(GALLERY_DIR, `${oldId}.json`);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const jsonObj = {
          title: String(b.title).trim(),
          description: String(b.description || b.title).trim(),
          image: String(b.image).trim(),
          alt: String(b.alt || b.title).trim(),
          category: String(b.category || 'Training'),
          date: String(b.date || new Date().toISOString().slice(0, 10)),
          featured: Boolean(b.featured),
          order: Number.isFinite(Number(b.order)) ? Number(b.order) : 1,
          status: String(b.status || 'Published'),
        };

        fs.writeFileSync(
          path.join(GALLERY_DIR, `${id}.json`),
          JSON.stringify(jsonObj, null, 2) + '\n',
          'utf8'
        );
        return sendJson(res, 200, { success: true, id, message: 'Foto galeri berhasil disimpan.' });
      }

      // 7. DELETE /api/admin/gallery/:id
      if (req.method === 'DELETE' && urlPath.startsWith('/api/admin/gallery/')) {
        const id = slugify(decodeURIComponent(urlPath.replace('/api/admin/gallery/', '')));
        const target = path.join(GALLERY_DIR, `${id}.json`);
        if (fs.existsSync(target)) fs.unlinkSync(target);
        return sendJson(res, 200, { success: true, message: 'Foto galeri berhasil dihapus.' });
      }

      // 8. POST /api/admin/about
      if (req.method === 'POST' && urlPath === '/api/admin/about') {
        const b = await readJsonBody(req);
        fs.writeFileSync(path.join(DATA_DIR, 'about.json'), JSON.stringify(b, null, 2) + '\n', 'utf8');
        return sendJson(res, 200, { success: true, message: 'Profil & jadwal berhasil diperbarui.' });
      }

      // 9. POST /api/admin/settings
      if (req.method === 'POST' && urlPath === '/api/admin/settings') {
        const b = await readJsonBody(req);
        fs.writeFileSync(path.join(DATA_DIR, 'settings.json'), JSON.stringify(b, null, 2) + '\n', 'utf8');
        return sendJson(res, 200, { success: true, message: 'Pengaturan berhasil diperbarui.' });
      }

      return sendJson(res, 404, { success: false, error: 'Endpoint tidak ditemukan.' });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || 'Server error' });
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
