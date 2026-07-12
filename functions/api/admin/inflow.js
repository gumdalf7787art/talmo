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

    const period = url.searchParams.get('period') || 'daily'; // daily, weekly, monthly

    let timeModifier;

    if (period === 'daily') {
      timeModifier = "'-1 days'"; // Today and yesterday? Wait, 'daily' usually means last 30 days in chart, but for rank maybe "today" or "recent 30 days"? Let's do last 30 days.
      timeModifier = "'-30 days'";
    } else if (period === 'weekly') {
      timeModifier = "'-84 days'"; // 12 weeks
    } else if (period === 'monthly') {
      timeModifier = "'-12 months'";
    } else {
      return new Response(JSON.stringify({ error: '잘못된 기간 설정입니다.' }), { status: 400 });
    }

    const query = `
      SELECT 
        COALESCE(inflow_source, '직접 유입 및 기타') as source,
        COUNT(*) as count
      FROM site_visits
      WHERE visited_at >= date('now', ${timeModifier})
      GROUP BY source
      ORDER BY count DESC
    `;

    const { results } = await db.prepare(query).all();

    return new Response(JSON.stringify({ success: true, data: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
