export async function onRequestGet(context) {
  const { env } = context;
  try {
    const db = env.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB Error' }), { status: 500 });

    const stmt = db.prepare(`SELECT id, email, nickname, role, created_at FROM users ORDER BY created_at DESC`);
    const { results } = await stmt.all();

    return new Response(JSON.stringify({ success: true, users: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
