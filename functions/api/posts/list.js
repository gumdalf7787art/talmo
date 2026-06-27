export async function onRequestGet(context) {
  const { request, env } = context;

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
    // We will select id, title, category, content, created_at, user nickname, email, views, comments_count
    const url = new URL(request.url);
    const sort = url.searchParams.get('sort') || 'recent';
    const category = url.searchParams.get('category') || 'all';
    const limitStr = url.searchParams.get('limit');
    const q = url.searchParams.get('q');
    const author = url.searchParams.get('author');
    const bookmarkedBy = url.searchParams.get('bookmarkedBy');
    const limit = limitStr ? parseInt(limitStr) : 100;

    let query = `
      SELECT 
        p.id, 
        p.title, 
        p.category, 
        p.content, 
        p.created_at, 
        p.views,
        p.comments_count,
        u.nickname as author,
        u.email as email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ${bookmarkedBy ? 'INNER JOIN bookmarks b ON p.id = b.post_id INNER JOIN users bu ON b.user_id = bu.id' : ''}
      WHERE 1=1
    `;

    const params = [];

    if (category !== 'all') {
      query += ` AND p.category = ? `;
      params.push(category);
    }

    if (q) {
      query += ` AND (p.title LIKE ? OR p.content LIKE ?) `;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (author) {
      query += ` AND u.email = ? `;
      params.push(author);
    }

    if (bookmarkedBy) {
      query += ` AND bu.email = ? `;
      params.push(bookmarkedBy);
    }

    if (sort === 'popular') {
      // Time-decay popular algorithm: (views + comments * 2) / ((hours_since_created) + 2)
      // julianday('now') - julianday(created_at) gives the difference in days. Multiply by 24 for hours.
      query += ` ORDER BY ((COALESCE(p.views, 0) + (COALESCE(p.comments_count, 0) * 2)) / ((julianday('now') - julianday(p.created_at)) * 24 + 2)) DESC, p.created_at DESC `;
    } else {
      query += ` ORDER BY p.created_at DESC `;
    }

    query += ` LIMIT ?`;
    params.push(limit);

    const stmt = db.prepare(query).bind(...params);

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

        const fallbackAuthor = "익명 사용자";

        return {
          id: post.id,
          title: post.title,
          category: post.category,
          author: post.author || fallbackAuthor,
          time: timeStr,
          comments: post.comments_count || 0,
          views: post.views || 0,
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
