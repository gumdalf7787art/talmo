import { hashPassword } from '../../../src/lib/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password, nickname, referredByCode } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
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

    // Check if email already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?').bind(email);
    const { results } = await checkStmt.all();
    if (results && results.length > 0) {
      return new Response(JSON.stringify({ error: '이미 가입된 이메일입니다.' }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let finalNickname = nickname;
    if (!finalNickname) {
      // Generate a random nickname like user_1a2b3c
      finalNickname = 'user_' + Math.random().toString(36).substring(2, 8);
      
      // Basic check to ensure the generated nickname doesn't exist
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const nickCheck = await db.prepare('SELECT id FROM users WHERE nickname = ?').bind(finalNickname).all();
        if (nickCheck.results && nickCheck.results.length > 0) {
          finalNickname = 'user_' + Math.random().toString(36).substring(2, 8);
          attempts++;
        } else {
          isUnique = true;
        }
      }
    } else {
      // If user provided a nickname, ensure it is unique
      const nickCheckStmt = db.prepare('SELECT id FROM users WHERE nickname = ?').bind(finalNickname);
      const nickCheckResult = await nickCheckStmt.all();
      if (nickCheckResult.results && nickCheckResult.results.length > 0) {
        return new Response(JSON.stringify({ error: '이미 사용 중인 닉네임입니다.' }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Hash password with Web Crypto API PBKDF2
    const hashedPassword = await hashPassword(password);
    
    // Generate UUID v4 for id
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
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

    let ticketsPremium = 0;
    let referredById = null;

    // Process referral code if provided
    if (referredByCode) {
      const upperReferredCode = referredByCode.toUpperCase();
      const referrerResult = await db.prepare('SELECT id, tickets_premium FROM users WHERE referral_code = ?').bind(upperReferredCode).first();
      
      if (referrerResult) {
        referredById = referrerResult.id;
        ticketsPremium = 2; // Bonus for joining via referral
        
        // Reward referrer (+2 tickets)
        await db.prepare('UPDATE users SET tickets_premium = tickets_premium + 2 WHERE id = ?').bind(referredById).run();
      }
    }

    // Insert into DB
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password, nickname, role, referral_code, referred_by, tickets_basic, tickets_premium, last_ticket_reset, created_at, updated_at) 
      VALUES (?, ?, ?, ?, 'user', ?, ?, 2, ?, ?, ?, ?)
    `).bind(id, email, hashedPassword, finalNickname, referralCode, referredById, ticketsPremium, now, now, now);

    await insertStmt.run();

    // Migrate Toss data if link_toss_id is present in cookies
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const tossMatch = cookieHeader.match(/(?:^|;\s*)link_toss_id=([^;]*)/);
      if (tossMatch && tossMatch[1]) {
        const linkTossId = tossMatch[1];
        await db.prepare(`
          UPDATE diagnosis_history 
          SET user_id = ? 
          WHERE user_id = (SELECT id FROM users WHERE provider_id = ? AND provider = 'toss' LIMIT 1)
        `).bind(id, linkTossId).run();
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'User created successfully' }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
