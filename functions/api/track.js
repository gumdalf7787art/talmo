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
               request.headers.get('x-real-ip') ||
               crypto.randomUUID(); // Fallback to avoid all 'unknown' being treated as same user
    
    // Parse user_type and inflow_source from body if available
    let userType = 'non_member';
    let inflowSource = '직접 유입 및 기타';
    try {
      if (request.method === 'POST' && request.headers.get('Content-Type')?.includes('application/json')) {
        const body = await request.clone().json();
        if (body.user_type) userType = body.user_type;
        if (body.inflow_source) inflowSource = body.inflow_source;
      }
    } catch (e) {
      // ignore
    }

    // Check if we already logged this IP today (KST)
    const checkStmt = db.prepare(`
      SELECT id FROM site_visits 
      WHERE ip_address = ? 
      AND date(visited_at, '+9 hours') = date('now', '+9 hours')
    `).bind(ip);
    
    const { results } = await checkStmt.all();
    
    // If not logged today, insert it
    if (!results || results.length === 0) {
      const id = crypto.randomUUID();
      const userAgent = request.headers.get('user-agent') || '';
      
      const insertStmt = db.prepare(`
        INSERT INTO site_visits (id, ip_address, user_agent, user_type, inflow_source) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, ip, userAgent, userType, inflowSource);
      
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
