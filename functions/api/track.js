export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { status: 500 });
    }

    // Get IP address from headers
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for') || 
               'unknown';
    
    // Parse user_type from body if available
    let userType = 'non_member';
    try {
      if (request.method === 'POST' && request.headers.get('Content-Type')?.includes('application/json')) {
        const body = await request.clone().json();
        if (body.user_type) userType = body.user_type;
      }
    } catch (e) {
      // ignore
    }

    // Check if we already logged this IP today
    const checkStmt = db.prepare(`
      SELECT id FROM site_visits 
      WHERE ip_address = ? 
      AND date(visited_at) = date('now')
    `).bind(ip);
    
    const { results } = await checkStmt.all();
    
    // If not logged today, insert it
    if (!results || results.length === 0) {
      const id = crypto.randomUUID();
      const userAgent = request.headers.get('user-agent') || '';
      
      const insertStmt = db.prepare(`
        INSERT INTO site_visits (id, ip_address, user_agent, user_type) 
        VALUES (?, ?, ?, ?)
      `).bind(id, ip, userAgent, userType);
      
      await insertStmt.run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
