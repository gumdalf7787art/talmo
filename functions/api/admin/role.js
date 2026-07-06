export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { userId, role, adminUserId } = await request.json();
    if (!userId || !role) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    const db = env.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB Error' }), { status: 500 });

    if (!adminUserId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(adminUserId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const stmt = db.prepare(`UPDATE users SET role = ? WHERE id = ?`).bind(role, userId);
    await stmt.run();

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
