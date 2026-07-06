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
    const { id, title, image_url, link_url, userId } = await request.json();
    if (!id) throw new Error("Slot ID is required");
    const db = env.DB;
    if (!userId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const stmt = db.prepare(`
      INSERT INTO banners (id, title, image_url, link_url, is_active) 
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET 
        title=excluded.title, 
        image_url=excluded.image_url, 
        link_url=excluded.link_url,
        is_active=1
    `).bind(id, title, image_url, link_url || null);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const { id, is_active, userId } = await request.json();
    const db = env.DB;
    if (!userId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

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
    const userId = url.searchParams.get('userId');
    const db = env.DB;
    if (!userId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const stmt = db.prepare(`DELETE FROM banners WHERE id = ?`).bind(id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
