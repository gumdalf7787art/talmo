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

    const updateStmt = db.prepare(`
      UPDATE users 
      SET nickname = ?, profile_image = ?, gender = ?, birth_year = ?, family_history = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      nickname || null, 
      profile_image || null, 
      gender || null, 
      birth_year || null, 
      family_history || null, 
      now, 
      id
    );

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
