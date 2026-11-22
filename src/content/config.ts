import { defineCollection, z } from 'astro:content';

/**
 * Collection: News (src/content/news/*.md)
 * Dikelola melalui Decap CMS dengan Markdown editor & perhitungan status tanggal otomatis (Asia/Jakarta).
 */
const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1, 'Judul berita wajib diisi'),
    customSlug: z.string().optional(),
    description: z.string().min(1, 'Deskripsi singkat wajib diisi'),
    featuredImage: z.string().min(1, 'Gambar utama berita wajib diisi'),
    imageAlt: z.string().default('Dokumentasi Berita ITPLN COMBAT'),
    category: z.enum(['Kegiatan', 'Pertandingan', 'Latihan', 'Pengumuman', 'Prestasi']),
    author: z.string().default('Tim Humas ITPLN COMBAT'),
    startDate: z.union([z.string(), z.date()]),
    endDate: z.union([z.string(), z.date()]).optional().nullable(),
    publishDate: z.union([z.string(), z.date()]).optional(),
    status: z.enum(['Published', 'Draft']).default('Published'),
    featured: z.boolean().default(false),
  }),
});

/**
 * Collection: Gallery (src/content/gallery/*.json)
 * Dikelola melalui Decap CMS dengan kategori bela diri & kegiatan.
 */
const galleryCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string().min(1, 'Judul foto wajib diisi'),
    description: z.string().min(1, 'Deskripsi foto wajib diisi'),
    image: z.string().min(1, 'Path atau URL gambar wajib diisi'),
    alt: z.string().min(1, 'Alt text gambar wajib diisi'),
    category: z.enum([
      'Muay Thai',
      'Boxing',
      'Tarung Derajat',
      'MMA',
      'Training',
      'Competition',
      'Events',
    ]),
    date: z.union([z.string(), z.date()]),
    featured: z.boolean().default(false),
    order: z.number().default(1),
    status: z.enum(['Published', 'Draft']).default('Published'),
  }),
});

export const collections = {
  news: newsCollection,
  gallery: galleryCollection,
};
