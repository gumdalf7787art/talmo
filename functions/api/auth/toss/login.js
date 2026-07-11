import { hashPassword } from '../../../../src/lib/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { tossId, nickname: providedNickname } = body;

    if (!tossId) {
      return new Response(JSON.stringify({ error: 'tossId가 누락되었습니다.' }), { 
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

    // 1. Check if user exists by Toss ID
    const stmt = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').bind('toss', tossId);
    let user = await stmt.first();

    // 2. If no user, create a new one
    if (!user) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const randomPassword = crypto.randomUUID(); // Dummy password
      const hashedPassword = await hashPassword(randomPassword);
      
      const email = `toss_${tossId}@talmotalk.com`;
      const nickname = providedNickname || `toss_${Math.random().toString(36).substring(2, 8)}`;

      // Ensure nickname uniqueness
      let finalNickname = nickname;
      let isNickUnique = false;
      let nickAttempts = 0;
      while (!isNickUnique && nickAttempts < 10) {
        const nickCheck = await db.prepare('SELECT id FROM users WHERE nickname = ?').bind(finalNickname).all();
        if (nickCheck.results && nickCheck.results.length > 0) {
          finalNickname = `${nickname}_${Math.random().toString(36).substring(2, 6)}`;
          nickAttempts++;
        } else {
          isNickUnique = true;
        }
      }

      // Generate 6-char referral code
      let referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      let isCodeUnique = false;
      let codeAttempts = 0;
      while (!isCodeUnique && codeAttempts < 5) {
        const codeCheck = await db.prepare('SELECT id FROM users WHERE referral_code = ?').bind(referralCode).all();
        if (codeCheck.results && codeCheck.results.length > 0) {
          referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          codeAttempts++;
        } else {
          isCodeUnique = true;
        }
      }

      const insertStmt = db.prepare(`
        INSERT INTO users (id, email, password, nickname, role, provider, provider_id, referral_code, tickets_basic, tickets_premium, created_at, updated_at) 
        VALUES (?, ?, ?, ?, 'user', 'toss', ?, ?, 999, 0, ?, ?)
      `).bind(id, email, hashedPassword, finalNickname, tossId, referralCode, now, now);

      await insertStmt.run();

      // Fetch the newly created user
      user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    } else {
      // For testing phase: refill tickets to 999 on login
      await db.prepare('UPDATE users SET tickets_basic = 999 WHERE id = ?').bind(user.id).run();
      user.tickets_basic = 999;
    }

    // Remove password from user object
    const { password: _, ...safeUser } = user;

    return new Response(JSON.stringify({ 
      success: true, 
      user: safeUser 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Toss login error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
