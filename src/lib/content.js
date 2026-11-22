import { getCollection } from 'astro:content';
import settings from '../data/settings.json';
import about from '../data/about.json';
import disciplines from '../data/disciplines.json';
import {
  computeNewsStatus,
  getStatusBadgeMeta,
  parseJakartaDate,
  formatJakartaDate,
  formatShortJakartaDate,
} from './dateStatus.js';
import { resolveCloudinaryUrl } from './cloudinary.js';

/**
 * Mengambil seluruh item News dari Astro Content Collection (src/content/news/*.md)
 * beserta perhitungan otomatis status tanggal (Active, Upcoming, Expired, Draft) dalam timezone Asia/Jakarta.
 *
 * @param {Object} [options]
 * @param {boolean} [options.includeDrafts=false] - Jika false, berita berstatus Draft tidak disertakan untuk publik
 * @param {number | Date | string} [options.referenceNow] - Opsional: waktu acuan
 */
export async function getAllNews(options = {}) {
  const { includeDrafts = false, referenceNow = Date.now() } = options;
  const entries = await getCollection('news');

  const mapped = entries.map((entry) => {
    const data = entry.data;
    const slug = data.customSlug || entry.slug;
    const computedStatus = computeNewsStatus(data, referenceNow);
    const badge = getStatusBadgeMeta(computedStatus);
    const sortMs =
      parseJakartaDate(data.publishDate || data.startDate, 'start') || 0;

    return {
      id: entry.id,
      slug,
      entrySlug: entry.slug,
      title: data.title,
      description: data.description,
      body: entry.body,
      render: () => entry.render(),
      featuredImage: resolveCloudinaryUrl(data.featuredImage, 1200),
      imageAlt: data.imageAlt || data.title,
      category: data.category,
      author: data.author || 'Tim Humas ITPLN COMBAT',
      startDate: String(data.startDate),
      endDate: data.endDate ? String(data.endDate) : '',
      publishDate: data.publishDate ? String(data.publishDate) : String(data.startDate),
      publicationStatus: data.status,
      computedStatus,
      badge,
      featured: Boolean(data.featured),
      formattedStart: formatJakartaDate(data.startDate, true),
      formattedEnd: data.endDate ? formatJakartaDate(data.endDate, true) : 'Tanpa Batas Waktu',
      formattedPublishShort: formatShortJakartaDate(data.publishDate || data.startDate),
      sortMs,
    };
  });

  // Urutkan berdasarkan tanggal publikasi terbaru
  mapped.sort((a, b) => b.sortMs - a.sortMs);

  if (!includeDrafts) {
    return mapped.filter((item) => item.computedStatus !== 'Draft');
  }

  return mapped;
}

/**
 * Mengambil seluruh item Gallery dari Astro Content Collection (src/content/gallery/*.json)
 *
 * @param {Object} [options]
 * @param {boolean} [options.includeDrafts=false]
 */
export async function getAllGallery(options = {}) {
  const { includeDrafts = false } = options;
  const entries = await getCollection('gallery');

  const mapped = entries.map((entry) => {
    const data = entry.data;
    const dateMs = parseJakartaDate(data.date, 'start') || 0;
    return {
      id: entry.id,
      title: data.title,
      description: data.description,
      image: resolveCloudinaryUrl(data.image, 1200),
      alt: data.alt || data.title,
      category: data.category,
      date: String(data.date),
      formattedDate: formatShortJakartaDate(data.date),
      featured: Boolean(data.featured),
      order: typeof data.order === 'number' ? data.order : 99,
      status: data.status || 'Published',
      dateMs,
    };
  });

  // Urutkan berdasarkan order (ascending), kemudian tanggal terbaru
  mapped.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return b.dateMs - a.dateMs;
  });

  if (!includeDrafts) {
    return mapped.filter((item) => String(item.status).toLowerCase() !== 'draft');
  }

  return mapped;
}

/**
 * Menghitung ringkasan statistik nyata dari Content Collection untuk Admin Dashboard
 */
export async function getCmsDashboardStats(referenceNow = Date.now()) {
  const allNews = await getAllNews({ includeDrafts: true, referenceNow });
  const allGallery = await getAllGallery({ includeDrafts: true });

  const publishedNews = allNews.filter((n) => n.publicationStatus === 'Published');
  const draftNews = allNews.filter((n) => n.computedStatus === 'Draft');
  const activeNews = allNews.filter((n) => n.computedStatus === 'Active');
  const upcomingNews = allNews.filter((n) => n.computedStatus === 'Upcoming');
  const expiredNews = allNews.filter((n) => n.computedStatus === 'Expired');
  const publishedGallery = allGallery.filter((g) => g.status === 'Published');

  return {
    totalNews: allNews.length,
    publishedNews: publishedNews.length,
    draftNews: draftNews.length,
    activeNews: activeNews.length,
    upcomingNews: upcomingNews.length,
    expiredNews: expiredNews.length,
    totalGallery: allGallery.length,
    publishedGallery: publishedGallery.length,
    totalDivisions: (disciplines.items || []).length,
    newsItems: allNews.map((n) => ({
      slug: n.slug,
      title: n.title,
      category: n.category,
      author: n.author,
      startDate: n.startDate,
      endDate: n.endDate,
      publicationStatus: n.publicationStatus,
      computedStatus: n.computedStatus,
      featured: n.featured,
    })),
    galleryItems: allGallery.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      date: g.date,
      status: g.status,
      featured: g.featured,
      order: g.order,
    })),
  };
}

export const content = {
  settings,
  about,
  disciplines: disciplines.items || [],
};

export default content;
