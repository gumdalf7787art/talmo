import { hashPassword } from '../../../src/lib/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password, nickname } = body;

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

    // Insert into DB
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password, nickname, role, created_at, updated_at) 
      VALUES (?, ?, ?, ?, 'user', ?, ?)
    `).bind(id, email, hashedPassword, finalNickname, now, now);

    await insertStmt.run();

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
