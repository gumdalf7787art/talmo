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
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401 });
    }

    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403 });
    }

    const filter = url.searchParams.get('filter') || 'all';

    let baseQuery = `
      SELECT 
        d.id, d.score, d.severity, d.image_url, d.details, d.created_at,
        u.nickname, u.email, json_extract(d.details, '$.patientInfo.gender') as gender_from_details, u.gender as user_gender
      FROM diagnostics d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    let params = [];

    if (filter === 'today') {
      baseQuery += ` AND date(d.created_at) = date('now')`;
    } else if (filter === 'forehead') {
      baseQuery += ` AND json_extract(d.details, '$.scanType') = '이마'`;
    } else if (filter === 'crown') {
      baseQuery += ` AND json_extract(d.details, '$.scanType') = '정수리'`;
    } else if (filter === 'male') {
      baseQuery += ` AND json_extract(d.details, '$.patientInfo.gender') = '남성'`;
    } else if (filter === 'female') {
      baseQuery += ` AND json_extract(d.details, '$.patientInfo.gender') = '여성'`;
    }

    baseQuery += ` ORDER BY d.created_at DESC LIMIT 500`; // Limit to avoid massive load

    const { results } = await db.prepare(baseQuery).bind(...params).all();

    return new Response(JSON.stringify({
      success: true,
      data: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
