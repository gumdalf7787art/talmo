export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const clinicId = url.searchParams.get('clinicId');
  const viewerId = url.searchParams.get('viewerId') || userId;

  if (!userId || !clinicId) {
    return new Response(JSON.stringify({ error: 'userId와 clinicId 파라미터가 모두 필요합니다.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const db = env.DB;
    if (!db) throw new Error('DB 연결 설정이 누락되었습니다.');

    // Find the room first
    const roomStmt = db.prepare('SELECT id FROM chat_rooms WHERE user_id = ? AND clinic_id = ?').bind(userId, clinicId);
    const room = await roomStmt.first();

    if (!room) {
      // If room doesn't exist, return empty messages
      return new Response(JSON.stringify({ success: true, messages: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const roomId = room.id;

    // Mark all unread messages sent by the OTHER party as read
    const markReadStmt = db.prepare(`
      UPDATE messages SET is_read = 1 
      WHERE room_id = ? AND sender_id != ? AND is_read = 0
    `).bind(roomId, viewerId); 
    await markReadStmt.run();

    // Fetch messages
    const msgStmt = db.prepare(`
      SELECT 
        id, sender_id, content, image_url, is_read, created_at 
      FROM messages 
      WHERE room_id = ? 
      ORDER BY created_at ASC
    `).bind(roomId);

    const { results } = await msgStmt.all();

    return new Response(JSON.stringify({ success: true, messages: results }), {
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
