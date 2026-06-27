export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { userId, clinicId, senderId, content, imageUrl } = body;

    if (!userId || !clinicId || (!content && !imageUrl)) {
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

    // 1. Check if chat room exists between userId and clinicId
    let stmt = db.prepare('SELECT id FROM chat_rooms WHERE user_id = ? AND clinic_id = ?').bind(userId, clinicId);
    let room = await stmt.first();
    let roomId;

    if (!room) {
      // Create new room
      roomId = crypto.randomUUID();
      const insertRoomStmt = db.prepare(`
        INSERT INTO chat_rooms (id, user_id, clinic_id) 
        VALUES (?, ?, ?)
      `).bind(roomId, userId, clinicId);
      await insertRoomStmt.run();
    } else {
      roomId = room.id;
      // Update the updated_at timestamp of the room
      const updateRoomStmt = db.prepare(`
        UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(roomId);
      await updateRoomStmt.run();
    }

    // 2. Insert message
    const messageId = crypto.randomUUID();
    const insertMsgStmt = db.prepare(`
      INSERT INTO messages (id, room_id, sender_id, content, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `).bind(messageId, roomId, senderId || userId, content || null, imageUrl || null);
    
    await insertMsgStmt.run();

    return new Response(JSON.stringify({ success: true, messageId, roomId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
