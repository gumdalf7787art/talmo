export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const nickname = url.searchParams.get('nickname');

  if (!nickname) {
    return new Response(JSON.stringify({ error: '닉네임이 제공되지 않았습니다.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const checkStmt = db.prepare('SELECT id FROM users WHERE nickname = ?').bind(nickname);
    const { results } = await checkStmt.all();

    if (results && results.length > 0) {
      return new Response(JSON.stringify({ available: false, message: '이미 사용 중인 닉네임입니다.' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ available: true, message: '사용 가능한 닉네임입니다.' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
