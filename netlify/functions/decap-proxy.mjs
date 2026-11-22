import aboutData from '../../src/data/about.json' with { type: 'json' };
import disciplinesData from '../../src/data/disciplines.json' with { type: 'json' };
import settingsData from '../../src/data/settings.json' with { type: 'json' };
import { uploadToCloudinary, MAX_PHOTO_BYTES, MAX_PHOTO_MB_LABEL } from '../../src/lib/cloudinary.js';

// In-memory store for serverless session + pre-loaded repo config files
const memoryFiles = new Map([
  ['src/data/about.json', JSON.stringify(aboutData, null, 2)],
  ['src/data/disciplines.json', JSON.stringify(disciplinesData, null, 2)],
  ['src/data/settings.json', JSON.stringify(settingsData, null, 2)],
]);

const memoryMedia = new Map([
  [
    'public/uploads/divisions/muay-thai.jpg',
    {
      id: 'public/uploads/divisions/muay-thai.jpg',
      name: 'muay-thai.jpg',
      path: 'public/uploads/divisions/muay-thai.jpg',
      url: '/uploads/divisions/muay-thai.jpg',
      displayURL: '/uploads/divisions/muay-thai.jpg',
      size: 236544,
      isDirectory: false,
    },
  ],
  [
    'public/uploads/divisions/boxing.jpg',
    {
      id: 'public/uploads/divisions/boxing.jpg',
      name: 'boxing.jpg',
      path: 'public/uploads/divisions/boxing.jpg',
      url: '/uploads/divisions/boxing.jpg',
      displayURL: '/uploads/divisions/boxing.jpg',
      size: 186368,
      isDirectory: false,
    },
  ],
  [
    'public/uploads/divisions/tarung-derajat.jpg',
    {
      id: 'public/uploads/divisions/tarung-derajat.jpg',
      name: 'tarung-derajat.jpg',
      path: 'public/uploads/divisions/tarung-derajat.jpg',
      url: '/uploads/divisions/tarung-derajat.jpg',
      displayURL: '/uploads/divisions/tarung-derajat.jpg',
      size: 52224,
      isDirectory: false,
    },
  ],
  [
    'public/uploads/divisions/mma.jpg',
    {
      id: 'public/uploads/divisions/mma.jpg',
      name: 'mma.jpg',
      path: 'public/uploads/divisions/mma.jpg',
      url: '/uploads/divisions/mma.jpg',
      displayURL: '/uploads/divisions/mma.jpg',
      size: 244736,
      isDirectory: false,
    },
  ],
]);

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        repo: 'itpln-combat',
        publish_modes: ['simple'],
        type: 'local_fs',
      }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, params = {} } = body;

    if (action === 'info') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          repo: 'itpln-combat',
          publish_modes: ['simple'],
          type: 'local_fs',
        }),
      };
    }

    if (action === 'entriesByFolder') {
      const folder = String(params.folder || '').replace(/^\/+|\/+$/g, '');
      const ext = params.extension ? `.${params.extension.replace(/^\./, '')}` : '';
      const entries = [];
      for (const [filePath, content] of memoryFiles.entries()) {
        if (filePath.startsWith(folder + '/') && (!ext || filePath.endsWith(ext))) {
          const base = filePath.split('/').pop();
          entries.push({
            file: {
              path: filePath,
              label: base,
              id: filePath,
              author: 'Admin ITPLN COMBAT',
              updatedOn: new Date().toISOString(),
            },
            data: content,
          });
        }
      }
      return { statusCode: 200, headers, body: JSON.stringify(entries) };
    }

    if (action === 'entriesByFiles') {
      const files = Array.isArray(params.files) ? params.files : [];
      const res = files
        .map((f) => {
          const p = String(f.path || '').replace(/^\/+/, '');
          const data = memoryFiles.get(p);
          if (data === undefined) return null;
          return {
            file: {
              path: p,
              label: f.label || p.split('/').pop(),
              id: p,
              author: 'Admin ITPLN COMBAT',
              updatedOn: new Date().toISOString(),
            },
            data,
          };
        })
        .filter(Boolean);
      return { statusCode: 200, headers, body: JSON.stringify(res) };
    }

    if (action === 'getEntry') {
      const p = String(params.path || '').replace(/^\/+/, '');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          file: { path: p, id: p, author: 'Admin ITPLN COMBAT', updatedOn: new Date().toISOString() },
          data: memoryFiles.get(p) || '',
        }),
      };
    }

    if (action === 'persistEntry') {
      const dataFiles = Array.isArray(params.dataFiles)
        ? params.dataFiles
        : params.entry
        ? [params.entry]
        : [];
      for (const df of dataFiles) {
        const p = String(df.path || '').replace(/^\/+/, '');
        memoryFiles.set(p, String(df.raw ?? ''));
      }
      const assets = Array.isArray(params.assets) ? params.assets : [];
      for (const a of assets) {
        const buf = Buffer.from(a.content || '', 'base64');
        if (buf.length > MAX_PHOTO_BYTES) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: `Ukuran foto (${(buf.length / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal ${MAX_PHOTO_MB_LABEL}!`,
            }),
          };
        }
        const p = String(a.path || '').replace(/^\/+/, '');
        const subFolder = p.includes('/news/') ? 'news' : 'gallery';
        let finalUrl = `data:image/jpeg;base64,${a.content || ''}`;
        try {
          const cld = await uploadToCloudinary({
            base64Content: a.content || '',
            subFolder,
            publicId: p.split('/').pop().replace(/\.[^.]+$/, ''),
          });
          if (cld.uploadedToCloudinary && cld.url) finalUrl = cld.url;
        } catch {}

        memoryMedia.set(p, {
          id: p,
          name: p.split('/').pop(),
          path: p,
          url: finalUrl,
          displayURL: finalUrl,
          size: buf.length,
          isDirectory: false,
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ saved: true }) };
    }

    if (action === 'deleteFiles') {
      const paths = Array.isArray(params.paths) ? params.paths : [];
      for (const p of paths) {
        memoryFiles.delete(String(p).replace(/^\/+/, ''));
      }
      return { statusCode: 200, headers, body: JSON.stringify({ deleted: true }) };
    }

    if (action === 'getMedia') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(Array.from(memoryMedia.values())),
      };
    }

    if (action === 'getMediaFile') {
      const p = String(params.path || '').replace(/^\/+/, '');
      const found = memoryMedia.get(p) || {
        id: p,
        name: p.split('/').pop(),
        path: p,
        url: '/' + p.replace(/^public\/?/, ''),
        displayURL: '/' + p.replace(/^public\/?/, ''),
      };
      return { statusCode: 200, headers, body: JSON.stringify(found) };
    }

    if (action === 'persistMedia') {
      const a = params.asset || {};
      const buf = Buffer.from(a.content || '', 'base64');
      if (buf.length > MAX_PHOTO_BYTES) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: `Ukuran foto (${(buf.length / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal ${MAX_PHOTO_MB_LABEL}!`,
          }),
        };
      }
      const p = String(a.path || '').replace(/^\/+/, '');
      const subFolder = p.includes('/news/') ? 'news' : 'gallery';
      let finalUrl = `data:image/jpeg;base64,${a.content || ''}`;
      try {
        const cld = await uploadToCloudinary({
          base64Content: a.content || '',
          subFolder,
          publicId: p.split('/').pop().replace(/\.[^.]+$/, ''),
        });
        if (cld.uploadedToCloudinary && cld.url) finalUrl = cld.url;
      } catch {}

      const item = {
        id: p,
        name: p.split('/').pop(),
        path: p,
        url: finalUrl,
        displayURL: finalUrl,
        size: buf.length,
        isDirectory: false,
      };
      memoryMedia.set(p, item);
      return { statusCode: 200, headers, body: JSON.stringify(item) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({}) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
}
