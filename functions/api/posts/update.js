export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { postId, userId, title, category, content } = data;

    if (!postId || !userId || !title || !category || !content) {
      return new Response(JSON.stringify({ error: '필수 정보가 누락되었습니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify ownership
    const post = await db.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
    
    if (!post) {
      return new Response(JSON.stringify({ error: '게시글을 찾을 수 없습니다.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (post.user_id !== userId) {
      return new Response(JSON.stringify({ error: '권한이 없습니다.' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update post
    const result = await db.prepare(`
      UPDATE posts 
      SET title = ?, category = ?, content = ? 
      WHERE id = ?
    `).bind(title, category, content, postId).run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, postId }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to update post');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
