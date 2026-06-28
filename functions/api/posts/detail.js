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
        p.user_id as post_author_id,
        u.nickname as author,
        u.profile_image as authorImage
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

    // Fetch comments
    const commentsStmt = db.prepare(`
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.user_id,
        u.nickname as author,
        u.profile_image as authorImage
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).bind(id);

    const commentsResult = await commentsStmt.all();
    const rawComments = commentsResult.results || [];

    // Format time for comments
    const formatTime = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 60) return `${diffMins || 1}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      return `${diffDays}일 전`;
    };

    const processedComments = rawComments.map(c => ({
      id: c.id,
      author: c.author || "익명 사용자",
      authorImage: c.authorImage,
      time: formatTime(c.created_at),
      content: c.content,
      isAuthor: c.user_id === post.post_author_id
    }));

    // Format time for post
    const timeStr = formatTime(post.created_at);

    const processedPost = {
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content, // HTML content
      author: post.author || "익명 사용자",
      authorImage: post.authorImage,
      authorId: post.post_author_id,
      time: timeStr,
      views: (post.views || 0) + 1, // Include the incremented view
      comments: processedComments.length,
      likes: 0 // Mocking likes as we haven't implemented it yet
    };

    return new Response(JSON.stringify({ success: true, post: processedPost, comments: processedComments }), { 
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
