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
    const { postId, userId } = data;

    if (!postId || !userId) {
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

    // Check if requester is admin
    let isAdmin = false;
    if (userId) {
      const userCheck = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
      if (userCheck && userCheck.role === 'admin') {
        isAdmin = true;
      }
    }

    if (post.user_id !== userId && !isAdmin) {
      return new Response(JSON.stringify({ error: '권한이 없습니다.' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete comments first
    await db.prepare('DELETE FROM comments WHERE post_id = ?').bind(postId).run();
    
    // Delete post
    const result = await db.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to delete post');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
