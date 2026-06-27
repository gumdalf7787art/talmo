export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { userId, category, title, content } = body;

    if (!userId || !category || !title || !content) {
      return new Response(JSON.stringify({ error: '필수 항목이 누락되었습니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate a unique ID for the post
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert post into the database
    const stmt = db.prepare(`
      INSERT INTO posts (id, user_id, category, title, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, userId, category, title, content, now);

    const result = await stmt.run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: '게시글이 등록되었습니다.', postId: id }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to insert post');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
