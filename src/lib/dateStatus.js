/**
 * Utilitas Perhitungan Status Berita & Format Tanggal (Timezone: Asia/Jakarta / WIB UTC+07:00)
 *
 * Ketentuan Status:
 * - Draft    : status publikasi diset 'Draft' oleh admin (tidak tampil di publik)
 * - Upcoming : waktu sekarang belum mencapai startDate (now < startDate)
 * - Active   : waktu sekarang berada dalam rentang startDate s/d endDate (startDate <= now <= endDate)
 * - Expired  : waktu sekarang sudah melewati endDate (now > endDate)
 */

export const JAKARTA_TZ = 'Asia/Jakarta';
export const JAKARTA_OFFSET = '+07:00';

/**
 * Mengonversi input tanggal (Date, ISO string, atau YYYY-MM-DD) menjadi timestamp epoch (ms)
 * dengan asumsi timezone Asia/Jakarta (+07:00) bila string tidak memiliki offset eksplisit.
 *
 * @param {string | Date | null | undefined} input
 * @param {'start' | 'end'} [boundary='start'] - Jika hanya YYYY-MM-DD, 'start' = 00:00:00+07:00, 'end' = 23:59:59.999+07:00
 * @returns {number | null}
 */
export function parseJakartaDate(input, boundary = 'start') {
  if (!input) return null;
  if (input instanceof Date) {
    const t = input.getTime();
    return Number.isNaN(t) ? null : t;
  }

  const raw = String(input).trim();
  if (!raw) return null;

  // Jika hanya format tanggal YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const timePart = boundary === 'end' ? 'T23:59:59.999' : 'T00:00:00.000';
    const ms = Date.parse(`${raw}${timePart}${JAKARTA_OFFSET}`);
    return Number.isNaN(ms) ? null : ms;
  }

  // Jika format YYYY-MM-DD HH:mm(:ss) dengan spasi, ganti spasi menjadi T
  const normalized = raw.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/, '$1T$2');

  // Cek apakah sudah memiliki informasi timezone (Z atau +HH:mm / -HH:mm di akhir)
  const hasTz = /([Zz]|[+-]\d{2}:?\d{2})$/.test(normalized);
  const isoWithTz = hasTz ? normalized : `${normalized}${JAKARTA_OFFSET}`;

  const ms = Date.parse(isoWithTz);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Menghitung status berita secara otomatis berdasarkan startDate, endDate, dan status publikasi.
 *
 * @param {Object} item
 * @param {string | Date} [item.startDate]
 * @param {string | Date} [item.endDate]
 * @param {string} [item.status] - 'Published' | 'Draft'
 * @param {string | Date | number} [referenceNow] - Opsional: waktu acuan untuk pengujian (default: Date.now())
 * @returns {'Draft' | 'Upcoming' | 'Active' | 'Expired'}
 */
export function computeNewsStatus(item = {}, referenceNow = Date.now()) {
  const pubStatus = String(item.status || 'Published').trim().toLowerCase();
  if (pubStatus === 'draft') {
    return 'Draft';
  }

  const nowMs =
    typeof referenceNow === 'number'
      ? referenceNow
      : parseJakartaDate(referenceNow, 'start') ?? Date.now();

  const startRaw = item.startDate || item.tanggal_mulai || item.publishDate || item.tanggal;
  const endRaw = item.endDate || item.tanggal_selesai;

  const startMs = parseJakartaDate(startRaw, 'start');
  const endMs = parseJakartaDate(endRaw, 'end');

  if (startMs !== null && nowMs < startMs) {
    return 'Upcoming';
  }

  if (endMs !== null && nowMs > endMs) {
    return 'Expired';
  }

  return 'Active';
}

/**
 * Mengembalikan metadata visual badge untuk masing-masing status berita.
 *
 * @param {'Draft' | 'Upcoming' | 'Active' | 'Expired'} status
 */
export function getStatusBadgeMeta(status) {
  switch (status) {
    case 'Draft':
      return {
        code: 'Draft',
        label: 'DRAFT',
        dotLabel: '● DRAFT',
        cssClass: 'status-draft',
        description: 'Berita masih berstatus draf dan belum dipublikasikan.',
      };
    case 'Upcoming':
      return {
        code: 'Upcoming',
        label: 'UPCOMING',
        dotLabel: '● UPCOMING',
        cssClass: 'status-scheduled',
        description: 'Agenda/berita akan mulai berlaku sesuai jadwal mulai.',
      };
    case 'Expired':
      return {
        code: 'Expired',
        label: 'EXPIRED',
        dotLabel: '● EXPIRED',
        cssClass: 'status-expired',
        description: 'Masa berlaku berita ini telah berakhir dan disimpan sebagai arsip.',
      };
    case 'Active':
    default:
      return {
        code: 'Active',
        label: 'ACTIVE',
        dotLabel: '● ACTIVE',
        cssClass: 'status-active',
        description: 'Berita sedang aktif tayang.',
      };
  }
}

/**
 * Memformat tanggal ke bahasa Indonesia dengan timezone Asia/Jakarta
 *
 * @param {string | Date | null | undefined} input
 * @param {boolean} [includeTime=true]
 * @returns {string}
 */
export function formatJakartaDate(input, includeTime = true) {
  const ms = parseJakartaDate(input, 'start');
  if (ms === null) return '-';

  const date = new Date(ms);
  const options = {
    timeZone: JAKARTA_TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  if (includeTime) {
    options.weekday = 'long';
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('id-ID', options).format(date) + (includeTime ? ' WIB' : '');
}

/**
 * Memformat tanggal singkat untuk kartu (misal: 1 Nov 2026)
 */
export function formatShortJakartaDate(input) {
  const ms = parseJakartaDate(input, 'start');
  if (ms === null) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: JAKARTA_TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms));
}
