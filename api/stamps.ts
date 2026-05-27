import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const userKey = url.searchParams.get('userKey');
    const yearMonth = url.searchParams.get('yearMonth');
    if (!userKey || !yearMonth) return json({ error: 'userKey and yearMonth required' }, 400);
    const rows = await sql`
      SELECT days FROM walk_stamps WHERE user_key = ${userKey} AND year_month = ${yearMonth}
    ` as { days: number[] }[];
    return json({ days: rows[0]?.days ?? [] });
  }

  if (req.method === 'PUT') {
    const body = await req.json().catch(() => null) as { userKey?: string; yearMonth?: string; days?: unknown } | null;
    if (!body?.userKey || !body?.yearMonth || !Array.isArray(body.days)) {
      return json({ error: 'invalid body' }, 400);
    }
    await sql`
      INSERT INTO walk_stamps (user_key, year_month, days, updated_at)
      VALUES (${body.userKey}, ${body.yearMonth}, ${body.days as number[]}, NOW())
      ON CONFLICT (user_key, year_month) DO UPDATE
        SET days = EXCLUDED.days, updated_at = NOW()
    `;
    return json({ ok: true });
  }

  return json({ error: 'method not allowed' }, 405);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
