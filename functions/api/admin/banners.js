export async function onRequestGet(context) {
  const { env } = context;
  try {
    const db = env.DB;
    const stmt = db.prepare(`SELECT * FROM banners ORDER BY created_at DESC`);
    const { results } = await stmt.all();
    return new Response(JSON.stringify({ success: true, banners: results || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { title, image_url, link_url } = await request.json();
    const db = env.DB;
    const id = crypto.randomUUID();
    const stmt = db.prepare(`INSERT INTO banners (id, title, image_url, link_url, is_active) VALUES (?, ?, ?, ?, 1)`).bind(id, title, image_url, link_url || null);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const { id, is_active } = await request.json();
    const db = env.DB;
    const stmt = db.prepare(`UPDATE banners SET is_active = ? WHERE id = ?`).bind(is_active, id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const db = env.DB;
    const stmt = db.prepare(`DELETE FROM banners WHERE id = ?`).bind(id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
