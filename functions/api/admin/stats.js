export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { status: 500 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Daily active visitors (Today)
    const dauStmt = db.prepare(`SELECT COUNT(DISTINCT ip_address) as count FROM site_visits WHERE date(visited_at) = date('now')`);
    // Weekly active visitors
    const wauStmt = db.prepare(`SELECT COUNT(DISTINCT ip_address) as count FROM site_visits WHERE visited_at >= date('now', '-7 days')`);
    // Monthly active visitors
    const mauStmt = db.prepare(`SELECT COUNT(DISTINCT ip_address) as count FROM site_visits WHERE visited_at >= date('now', '-30 days')`);
    
    const totalUsersStmt = db.prepare(`SELECT COUNT(*) as count FROM users`);
    const totalPostsStmt = db.prepare(`SELECT COUNT(*) as count FROM posts`);
    const totalChatsStmt = db.prepare(`SELECT COUNT(*) as count FROM chat_rooms`);

    const batch = await db.batch([dauStmt, wauStmt, mauStmt, totalUsersStmt, totalPostsStmt, totalChatsStmt]);

    const stats = {
      dau: batch[0].results[0].count,
      wau: batch[1].results[0].count,
      mau: batch[2].results[0].count,
      totalUsers: batch[3].results[0].count,
      totalPosts: batch[4].results[0].count,
      totalChats: batch[5].results[0].count
    };

    return new Response(JSON.stringify({ success: true, stats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
