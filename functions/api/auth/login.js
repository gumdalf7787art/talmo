import { verifyPassword } from '../../../src/lib/crypto.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: '이메일과 비밀번호를 입력해주세요.' }), { 
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

    // Check if user exists
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?').bind(email);
    const user = await stmt.first();

    if (!user) {
      return new Response(JSON.stringify({ error: '가입되지 않은 이메일입니다.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: '비밀번호가 일치하지 않습니다.' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove password from user object before sending to client
    const { password: _, ...userWithoutPassword } = user;

    return new Response(JSON.stringify({ 
      success: true, 
      user: userWithoutPassword 
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
