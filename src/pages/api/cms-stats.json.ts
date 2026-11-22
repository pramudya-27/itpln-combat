import type { APIRoute } from 'astro';
import { getCmsDashboardStats } from '../../lib/content.js';

export const GET: APIRoute = async () => {
  const stats = await getCmsDashboardStats();
  return new Response(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        timezone: 'Asia/Jakarta',
        ...stats,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
};
