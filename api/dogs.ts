import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const userKey = url.searchParams.get('userKey');
    if (!userKey) return json({ error: 'userKey required' }, 400);
    const rows = await sql`SELECT data FROM dogs WHERE user_key = ${userKey}` as { data: unknown }[];
    return json({ dogs: rows[0]?.data ?? [] });
  }

  if (req.method === 'PUT') {
    const body = await req.json().catch(() => null) as { userKey?: string; dogs?: unknown } | null;
    if (!body?.userKey || !Array.isArray(body.dogs)) return json({ error: 'invalid body' }, 400);
    await sql`
      INSERT INTO dogs (user_key, data, updated_at)
      VALUES (${body.userKey}, ${JSON.stringify(body.dogs)}::jsonb, NOW())
      ON CONFLICT (user_key) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW()
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
