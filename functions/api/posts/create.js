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
      let rewarded = false;
      try {
        // 1. Get today's rewards
        const todayQuery = await db.prepare(`
          SELECT COUNT(*) as count 
          FROM reward_logs 
          WHERE user_id = ? AND reward_type = 'post_creation' AND date(created_at) = date('now')
        `).bind(userId).first();
        const dailyCount = todayQuery ? todayQuery.count : 0;
        
        // 2. Get this week's rewards (rolling 7 days)
        const weeklyQuery = await db.prepare(`
          SELECT COUNT(*) as count 
          FROM reward_logs 
          WHERE user_id = ? AND reward_type = 'post_creation' AND created_at >= datetime('now', '-7 days')
        `).bind(userId).first();
        const weeklyCount = weeklyQuery ? weeklyQuery.count : 0;
        
        if (dailyCount < 1 && weeklyCount < 3) {
          // Give reward
          await db.prepare(`UPDATE users SET tickets_premium = tickets_premium + 1 WHERE id = ?`).bind(userId).run();
          await db.prepare(`
            INSERT INTO reward_logs (id, user_id, reward_type, amount, created_at) 
            VALUES (?, ?, 'post_creation', 1, ?)
          `).bind(crypto.randomUUID(), userId, now).run();
          rewarded = true;
        }
      } catch (rewardErr) {
        console.error('Reward error:', rewardErr);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: '게시글이 등록되었습니다.', 
        postId: id,
        rewarded 
      }), { 
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
