export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { commentId, userId, content } = body;

    if (!commentId || !userId || !content) {
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

    // Verify ownership
    const commentOwner = await db.prepare('SELECT user_id FROM comments WHERE id = ?').bind(commentId).first();
    if (!commentOwner || commentOwner.user_id !== userId) {
      return new Response(JSON.stringify({ error: '권한이 없습니다.' }), { status: 403 });
    }

    // Update comment
    const stmt = db.prepare(`
      UPDATE comments SET content = ? WHERE id = ?
    `).bind(content, commentId);

    const result = await stmt.run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: '댓글이 수정되었습니다.' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to update comment');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
