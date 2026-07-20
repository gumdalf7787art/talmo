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
    // Get baseDate from query or default to current KST date
    let baseDate = url.searchParams.get('baseDate');
    if (!baseDate) {
      const now = new Date();
      now.setHours(now.getHours() + 9); // Convert to KST
      baseDate = now.toISOString().split('T')[0];
    }

    let periodExpr;
    let timeModifier;

    if (period === 'daily') {
      periodExpr = "date(visited_at, '+9 hours')"; // Group by KST date
      timeModifier = "'-30 days'";
    } else if (period === 'weekly') {
      periodExpr = "strftime('%Y-%W', visited_at, '+9 hours')";
      timeModifier = "'-84 days'"; // 12 weeks
    } else if (period === 'monthly') {
      periodExpr = "strftime('%Y-%m', visited_at, '+9 hours')";
      timeModifier = "'-12 months'";
    } else {
      return new Response(JSON.stringify({ error: '잘못된 기간 설정입니다.' }), { status: 400 });
    }

    const query = `
      SELECT 
        ${periodExpr} as label,
        COUNT(*) as total,
        SUM(CASE WHEN user_type = 'member' THEN 1 ELSE 0 END) as member,
        SUM(CASE WHEN user_type = 'non_member' THEN 1 ELSE 0 END) as non_member,
        SUM(CASE WHEN user_type NOT IN ('member', 'non_member') OR user_type IS NULL THEN 1 ELSE 0 END) as other
      FROM site_visits
      WHERE visited_at >= date(?, ${timeModifier})
        AND date(visited_at, '+9 hours') <= date(?)
      GROUP BY label
      ORDER BY label ASC
    `;

    const { results } = await db.prepare(query).bind(baseDate, baseDate).all();

    return new Response(JSON.stringify({ success: true, data: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
