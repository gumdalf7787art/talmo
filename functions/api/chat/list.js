export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId 파라미터가 필요합니다.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const db = env.DB;
    if (!db) throw new Error('DB 연결 설정이 누락되었습니다.');

    // Fetch chat rooms where the user is either the patient (user_id) or the hospital (clinic_id)
    // We also want to get the name of the OTHER party.
    const stmt = db.prepare(`
      SELECT 
        cr.id as room_id,
        cr.user_id,
        cr.clinic_id,
        cr.updated_at,
        u_patient.nickname as patient_name,
        u_clinic.nickname as clinic_name,
        (SELECT content FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE room_id = cr.id AND sender_id != ? AND is_read = 0) as unread_count
      FROM chat_rooms cr
      LEFT JOIN users u_patient ON cr.user_id = u_patient.id
      LEFT JOIN users u_clinic ON cr.clinic_id = u_clinic.id
      WHERE cr.user_id = ? OR cr.clinic_id = ?
      ORDER BY cr.updated_at DESC
    `).bind(userId, userId, userId);

    const { results } = await stmt.all();

    // Map results to a friendlier format for frontend
    const rooms = results.map(row => {
      const isClinic = row.clinic_id === userId; // if true, the requester is the hospital
      const otherPartyId = isClinic ? row.user_id : row.clinic_id;
      const otherPartyName = isClinic ? row.patient_name : row.clinic_name;

      return {
        id: row.room_id,
        clinicId: row.clinic_id, // useful for linking
        patientId: row.user_id,
        otherPartyId,
        otherPartyName: otherPartyName || '알 수 없음',
        lastMessage: row.last_message || '',
        time: row.last_message_time || row.updated_at,
        unreadCount: row.unread_count,
        isClinic // informs the frontend if the current user is acting as the clinic here
      };
    });

    return new Response(JSON.stringify({ success: true, rooms }), {
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
