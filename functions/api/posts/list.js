export async function onRequestGet(context) {
  const { env } = context;

  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch posts and join with users to get the author's nickname
    // Also parse a single image for thumbnail if available (from base64 content)
    // We will select id, title, category, content, created_at, user nickname
    const stmt = db.prepare(`
      SELECT 
        p.id, 
        p.title, 
        p.category, 
        p.content, 
        p.created_at, 
        u.nickname as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);

    const { results, success } = await stmt.all();

    if (success) {
      // Process results to add time string and extract an image thumbnail if available
      const processedPosts = results.map(post => {
        // Simple heuristic to extract the first image src from the HTML content
        const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : null;

        // Calculate time elapsed
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

        return {
          id: post.id,
          title: post.title,
          category: post.category,
          author: post.author || "탈퇴한 사용자",
          time: timeStr,
          comments: 0, // Mock for now until we have comments table
          views: Math.floor(Math.random() * 100), // Mock views
          imageUrl: imageUrl,
          content: post.content.replace(/<[^>]*>?/gm, '').substring(0, 50) + "..." // Strip HTML for summary
        };
      });

      return new Response(JSON.stringify({ success: true, posts: processedPosts }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to fetch posts');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
