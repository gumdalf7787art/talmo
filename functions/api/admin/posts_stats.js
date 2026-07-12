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

    const period = url.searchParams.get('period') || 'daily';
    const sort = url.searchParams.get('sort') || 'recent';

    let timeModifier;
    if (period === 'daily') timeModifier = "'-1 days'";
    else if (period === 'weekly') timeModifier = "'-7 days'";
    else if (period === 'monthly') timeModifier = "'-30 days'";
    else return new Response(JSON.stringify({ error: '잘못된 기간 설정입니다.' }), { status: 400 });

    let orderBy;
    if (sort === 'recent') orderBy = 'p.created_at DESC';
    else if (sort === 'popular') orderBy = 'p.views DESC, p.created_at DESC';
    else if (sort === 'comments') orderBy = 'p.comments_count DESC, p.created_at DESC';
    else return new Response(JSON.stringify({ error: '잘못된 정렬 설정입니다.' }), { status: 400 });

    // Summary counts
    const todayQuery = await db.prepare(`SELECT COUNT(*) as count FROM posts WHERE date(created_at) = date('now')`).first();
    const totalQuery = await db.prepare(`SELECT COUNT(*) as count FROM posts`).first();

    const query = `
      SELECT p.id, p.title, p.category, p.views, p.comments_count, p.created_at, u.nickname as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.created_at >= datetime('now', ${timeModifier})
      ORDER BY ${orderBy}
      LIMIT 50
    `;

    const { results } = await db.prepare(query).all();

    return new Response(JSON.stringify({
      success: true,
      summary: {
        today_posts: todayQuery ? todayQuery.count : 0,
        total_posts: totalQuery ? totalQuery.count : 0
      },
      posts: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
