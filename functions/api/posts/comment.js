export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { postId, userId, content } = body;

    if (!postId || !userId || !content) {
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

    // Generate a unique ID for the comment
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert comment into the database
    const stmt = db.prepare(`
      INSERT INTO comments (id, post_id, user_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, postId, userId, content, now);

    const result = await stmt.run();

    if (result.success) {
      // Increment comments_count in posts table
      context.waitUntil(
        db.prepare(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?`).bind(postId).run()
      );

      // Fetch the newly created comment with author info to return
      const newCommentStmt = db.prepare(`
        SELECT 
          c.id, 
          c.content, 
          c.created_at, 
          c.user_id,
          u.nickname as author
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `).bind(id);

      const newComment = await newCommentStmt.first();

      return new Response(JSON.stringify({ success: true, message: '댓글이 등록되었습니다.', comment: newComment }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to insert comment');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
