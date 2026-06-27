export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    const db = env.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB Error' }), { status: 500 });

    const stmt = db.prepare(`UPDATE users SET role = ? WHERE id = ?`).bind(role, userId);
    await stmt.run();

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
