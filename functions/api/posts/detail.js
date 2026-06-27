export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: '게시글 ID가 필요합니다.' }), { 
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

    // Increment views asynchronously
    context.waitUntil(
      db.prepare(`UPDATE posts SET views = views + 1 WHERE id = ?`).bind(id).run()
    );

    // Fetch the post details with author info
    const stmt = db.prepare(`
      SELECT 
        p.id, 
        p.title, 
        p.category, 
        p.content, 
        p.created_at, 
        p.views,
        p.comments_count,
        u.nickname as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).bind(id);

    const post = await stmt.first();

    if (!post) {
      return new Response(JSON.stringify({ error: '게시글을 찾을 수 없습니다.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format time
    const postDate = new Date(post.created_at);
    const now = new Date();
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeStr = "";
    if (diffMins < 60) {
      timeStr = `${diffMins || 1}분 전`;
    } else if (diffHours < 24) {
      timeStr = `${diffHours}시간 전`;
    } else {
      timeStr = `${diffDays}일 전`;
    }

    const processedPost = {
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content, // HTML content
      author: post.author || "익명 사용자",
      time: timeStr,
      views: (post.views || 0) + 1, // Include the incremented view
      comments: post.comments_count || 0,
      likes: 0 // Mocking likes as we haven't implemented it yet
    };

    return new Response(JSON.stringify({ success: true, post: processedPost }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
