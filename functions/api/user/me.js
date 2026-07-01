export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { 
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

    // Get user info
    const userStmt = db.prepare('SELECT id, email, nickname, profile_image, gender, birth_year, family_history, role, provider, referral_code, tickets_basic, tickets_premium, last_ticket_reset, created_at FROM users WHERE id = ?').bind(userId);
    const userResult = await userStmt.first();

    if (!userResult) {
      return new Response(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if we need to reset basic tickets (monthly)
    const now = new Date();
    let needReset = false;
    let ticketsBasic = userResult.tickets_basic !== null ? userResult.tickets_basic : 2;

    if (!userResult.last_ticket_reset) {
      needReset = true;
    } else {
      const lastReset = new Date(userResult.last_ticket_reset);
      // If current month/year is different from last reset month/year
      if (now.getFullYear() > lastReset.getFullYear() || now.getMonth() > lastReset.getMonth()) {
        needReset = true;
      }
    }

    if (needReset) {
      ticketsBasic = 2; // Reset to 2
      const nowIso = now.toISOString();
      await db.prepare('UPDATE users SET tickets_basic = ?, last_ticket_reset = ? WHERE id = ?')
              .bind(ticketsBasic, nowIso, userId)
              .run();
      userResult.last_ticket_reset = nowIso;
      userResult.tickets_basic = ticketsBasic;
    }

    // Handle legacy users who might not have a referral code yet
    if (!userResult.referral_code) {
      let newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      let isCodeUnique = false;
      let codeAttempts = 0;
      while (!isCodeUnique && codeAttempts < 5) {
        const codeCheck = await db.prepare('SELECT id FROM users WHERE referral_code = ?').bind(newReferralCode).all();
        if (codeCheck.results && codeCheck.results.length > 0) {
          newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          codeAttempts++;
        } else {
          isCodeUnique = true;
        }
      }
      await db.prepare('UPDATE users SET referral_code = ? WHERE id = ?')
              .bind(newReferralCode, userId)
              .run();
      userResult.referral_code = newReferralCode;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: userResult.id,
        email: userResult.email,
        nickname: userResult.nickname,
        profile_image: userResult.profile_image,
        gender: userResult.gender,
        birth_year: userResult.birth_year,
        family_history: userResult.family_history,
        role: userResult.role,
        provider: userResult.provider,
        referral_code: userResult.referral_code,
        tickets_basic: userResult.tickets_basic,
        tickets_premium: userResult.tickets_premium,
        created_at: userResult.created_at
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
