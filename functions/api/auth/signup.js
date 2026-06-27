import { hashPassword } from '../../../src/lib/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password, nickname } = body;

    if (!email || !password || !nickname) {
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

    // Hash password with Web Crypto API PBKDF2
    const hashedPassword = await hashPassword(password);
    
    // Generate UUID v4 for id
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert into DB
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
      VALUES (?, ?, ?, ?, 'user', ?, ?)
    `).bind(id, email, hashedPassword, nickname, now, now);

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
