export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const db = env.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB Error' }), { status: 500 });

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const stmt = db.prepare(`SELECT id, email, nickname, role, created_at FROM users ORDER BY created_at DESC`);
    const { results } = await stmt.all();

    return new Response(JSON.stringify({ success: true, users: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
