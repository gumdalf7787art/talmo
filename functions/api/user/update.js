export async function onRequestPut(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { id, nickname, profile_image, gender, birth_year, family_history } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { 
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

    const now = new Date().toISOString();

    // Check nickname uniqueness
    if (nickname !== undefined && nickname !== null) {
      const nickCheckStmt = db.prepare('SELECT id FROM users WHERE nickname = ? AND id != ?').bind(nickname, id);
      const nickCheckResult = await nickCheckStmt.all();
      if (nickCheckResult.results && nickCheckResult.results.length > 0) {
        return new Response(JSON.stringify({ error: '이미 사용 중인 닉네임입니다.' }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const updates = [];
    const params = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(nickname);
    }
    if (profile_image !== undefined) {
      updates.push('profile_image = ?');
      params.push(profile_image);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (birth_year !== undefined) {
      updates.push('birth_year = ?');
      params.push(birth_year);
    }
    if (family_history !== undefined) {
      updates.push('family_history = ?');
      params.push(family_history);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No changes provided' }), { status: 200 });
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const updateStmt = db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params);

    const result = await updateStmt.run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: 'Profile updated successfully' }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Failed to update profile');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
