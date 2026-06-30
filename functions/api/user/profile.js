export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');

    if (!nickname) {
      return new Response(JSON.stringify({ error: 'Nickname is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB connection error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Get user info
    const userStmt = db.prepare('SELECT id, nickname, created_at FROM users WHERE nickname = ?').bind(nickname);
    const userResult = await userStmt.first();

    if (!userResult) {
      return new Response(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = userResult.id;

    // 2. Get post count and total likes received
    const statsStmt = db.prepare('SELECT COUNT(*) as postCount, SUM(likes) as totalLikes FROM posts WHERE user_id = ?').bind(userId);
    const statsResult = await statsStmt.first();
    
    // 3. Get comment count (if comments table exists, assume post_comments)
    // If it fails due to table not existing, we'll catch and default to 0
    let commentCount = 0;
    try {
      const commentStmt = db.prepare('SELECT COUNT(*) as commentCount FROM post_comments WHERE user_id = ?').bind(userId);
      const commentResult = await commentStmt.first();
      commentCount = commentResult ? commentResult.commentCount : 0;
    } catch (e) {
      console.log('Comments table might not exist or error fetching comments', e);
    }

    const createdAt = userResult.created_at ? new Date(userResult.created_at).toISOString().split('T')[0] : '알 수 없음';
    
    return new Response(JSON.stringify({ 
      success: true, 
      profile: {
        nickname: userResult.nickname,
        posts_count: statsResult ? statsResult.postCount : 0,
        comments_count: commentCount,
        likes_received: statsResult && statsResult.totalLikes ? statsResult.totalLikes : 0,
        created_at: createdAt,
        last_login: createdAt // Fallback for last login
      }
    }), { 
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
