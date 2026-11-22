import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../src/data');
const newsContentDir = path.resolve(__dirname, '../src/content/news');
const galleryContentDir = path.resolve(__dirname, '../src/content/gallery');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =====================================================================
// 1. GITHUB OAUTH PROXY UNTUK DECAP CMS (NON-NETLIFY HOSTING)
// Menggunakan Environment Variables (GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET)
// =====================================================================
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

app.get('/auth', (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).send('GITHUB_CLIENT_ID belum dikonfigurasi pada environment variable server.');
  }
  const scope = req.query.scope || 'repo,user';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    GITHUB_CLIENT_ID
  )}&scope=${encodeURIComponent(String(scope))}`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(400).send('Parameter OAuth code atau kredensial environment belum lengkap.');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    const status = tokenData.access_token ? 'success' : 'error';
    const content = tokenData.access_token
      ? { token: tokenData.access_token, provider: 'github' }
      : tokenData;

    // PostMessage handshake standar Decap CMS OAuth
    res.send(`<!DOCTYPE html><html><body><script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:${status}:${JSON.stringify(content)}',
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script></body></html>`);
  } catch (err) {
    res.status(500).send('OAuth callback gagal: ' + err.message);
  }
});

// =====================================================================
// 2. KONEKSI DATABASE MYSQL LOKAL (LARAGON) & SINKRONISASI CMS
// =====================================================================
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'itpln_combat',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;
try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.error('[MySQL Error] Gagal membuat connection pool:', err.message);
}

app.get('/api/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() as server_time');
    res.json({
      success: true,
      status: 'connected',
      database: dbConfig.database,
      timezone: 'Asia/Jakarta',
      server_time: rows[0].server_time,
    });
  } catch (error) {
    res.status(500).json({ success: false, status: 'disconnected', error: error.message });
  }
});

app.get('/api/all', async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
    const [about] = await pool.query('SELECT * FROM about LIMIT 1');
    const [jadwal] = await pool.query('SELECT * FROM jadwal ORDER BY urutan ASC, id ASC');
    const [disciplines] = await pool.query('SELECT * FROM disciplines ORDER BY urutan ASC, id ASC');
    const [news] = await pool.query('SELECT * FROM news ORDER BY id DESC');
    const [gallery] = await pool.query('SELECT * FROM gallery ORDER BY tanggal DESC, id DESC');
    const [merchandise] = await pool.query('SELECT * FROM merchandise ORDER BY id ASC');

    res.json({
      success: true,
      data: {
        settings: settings[0] || {},
        about: { ...(about[0] || {}), jadwal: { items: jadwal } },
        jadwal,
        disciplines,
        news,
        gallery,
        merchandise,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sync-to-cms', async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
    const [about] = await pool.query('SELECT * FROM about LIMIT 1');
    const [jadwal] = await pool.query('SELECT * FROM jadwal ORDER BY urutan ASC, id ASC');

    if (settings[0]) {
      const { id, updated_at, ...cleanSettings } = settings[0];
      fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(cleanSettings, null, 2));
    }

    if (about[0]) {
      const { id, updated_at, ...cleanAbout } = about[0];
      cleanAbout.jadwal = { items: jadwal.map(({ id, urutan, ...j }) => j) };
      fs.writeFileSync(path.join(dataDir, 'about.json'), JSON.stringify(cleanAbout, null, 2));
    }

    res.json({
      success: true,
      message: 'Sinkronisasi ke struktur Astro Content Collections & Decap CMS selesai.',
      directories: { dataDir, newsContentDir, galleryContentDir },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ITPLN COMBAT Server] Berjalan di http://localhost:${PORT}`);
});
