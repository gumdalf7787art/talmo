import { verifyPassword, hashPassword } from '../../../src/lib/crypto.js';

export async function onRequestPut(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { id, currentPassword, newPassword } = body;

    if (!id || !currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: '모든 필드를 입력해주세요.' }), { 
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
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?').bind(id);
    const user = await stmt.first();

    if (!user) {
      return new Response(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: '현재 비밀번호가 일치하지 않습니다.' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    const now = new Date().toISOString();

    // Update password
    const updateStmt = db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = ?
      WHERE id = ?
    `).bind(hashedPassword, now, id);

    const result = await updateStmt.run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to update password');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
