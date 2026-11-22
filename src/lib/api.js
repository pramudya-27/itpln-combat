import content from './content.js';

// Base API URL
const API_BASE = '/api';

/**
 * Mengambil semua data secara dinamis dari database MySQL.
 * Jika koneksi MySQL / API backend tersedia, gunakan data dari DB.
 * Jika offline / belum terhubung, gunakan data statis JSON sebagai fallback.
 */
export async function fetchAllCombatData() {
  try {
    const res = await fetch(`${API_BASE}/all`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      return {
        isLive: true,
        data: json.data,
      };
    }
  } catch (err) {
    // Fallback otomatis ke data JSON
    console.info('[Combat Data] Backend offline, menggunakan data JSON fallback.', err.message);
  }

  return {
    isLive: false,
    data: {
      settings: content.settings,
      about: content.about,
      jadwal: content.about.jadwal?.items || [],
      disciplines: content.disciplines,
      news: content.news,
      gallery: content.gallery,
      merchandise: content.merchandise,
    },
  };
}

/**
 * Cek status koneksi MySQL
 */
export async function checkDbStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) return { connected: false };
    const json = await res.json();
    return { connected: json.success && json.status === 'connected', details: json };
  } catch {
    return { connected: false };
  }
}

/**
 * Tambah Berita Baru ke MySQL
 */
export async function createNewsItem(item) {
  const res = await fetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
}

/**
 * Update Berita di MySQL
 */
export async function updateNewsItem(id, item) {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
}

/**
 * Hapus Berita dari MySQL
 */
export async function deleteNewsItem(id) {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

/**
 * Update Jadwal Latihan di MySQL
 */
export async function updateJadwalItem(id, item) {
  const res = await fetch(`${API_BASE}/jadwal/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
}

/**
 * Sinkronisasi data MySQL ke file JSON CMS
 */
export async function syncDbToJson() {
  const res = await fetch(`${API_BASE}/sync-to-json`, {
    method: 'POST',
  });
  return res.json();
}
