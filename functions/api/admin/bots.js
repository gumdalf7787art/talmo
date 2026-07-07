export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    const url = new URL(request.url);
    const adminUserId = url.searchParams.get("adminUserId");

    // 1. 관리자 권한 체크
    if (!adminUserId) {
      return new Response(JSON.stringify({ error: "권한 확인을 위한 관리자 ID가 필요합니다." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const adminCheck = await db.prepare("SELECT role FROM users WHERE id = ?").bind(adminUserId).first();
    if (!adminCheck || adminCheck.role !== "admin") {
      return new Response(JSON.stringify({ error: "관리자 권한이 없습니다." }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. 봇 목록 조회
    const stmt = db.prepare(`
      SELECT 
        u.id, 
        u.nickname, 
        u.email, 
        u.profile_image, 
        bp.concept, 
        bp.prompt_instruction, 
        bp.is_active
      FROM users u
      INNER JOIN bot_personas bp ON u.id = bp.user_id
      ORDER BY bp.created_at DESC
    `);

    const { results } = await stmt.all();

    return new Response(JSON.stringify({ success: true, bots: results }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    const body = await request.json();
    const { id, nickname, concept, promptInstruction, isActive, adminUserId } = body;

    // 1. 필수 값 체크 및 관리자 인증
    if (!nickname || !concept || !promptInstruction || !adminUserId) {
      return new Response(JSON.stringify({ error: "필수 항목이 누락되었습니다." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const adminCheck = await db.prepare("SELECT role FROM users WHERE id = ?").bind(adminUserId).first();
    if (!adminCheck || adminCheck.role !== "admin") {
      return new Response(JSON.stringify({ error: "관리자 권한이 없습니다." }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = new Date().toISOString();

    if (id) {
      // 2. 기존 봇 수정
      // users 테이블 닉네임 수정
      await db.prepare("UPDATE users SET nickname = ?, updated_at = ? WHERE id = ?").bind(nickname, now, id).run();
      
      // bot_personas 테이블 정보 수정
      const activeVal = isActive === false ? 0 : 1;
      await db.prepare(`
        UPDATE bot_personas 
        SET concept = ?, prompt_instruction = ?, is_active = ? 
        WHERE user_id = ?
      `).bind(concept, promptInstruction, activeVal, id).run();

      return new Response(JSON.stringify({ success: true, message: "봇 정보가 수정되었습니다." }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } else {
      // 3. 신규 봇 생성
      const botId = crypto.randomUUID();
      const botEmail = `${nickname.replace(/\s+/g, '')}_${botId.substring(0, 8)}@bot.talmotalk.com`;
      const dummyPassword = crypto.randomUUID(); // 사용자가 직접 로그인하지 않는 가상 계정

      // users에 생성
      await db.prepare(`
        INSERT INTO users (id, email, password, nickname, role, created_at)
        VALUES (?, ?, ?, ?, 'bot', ?)
      `).bind(botId, botEmail, dummyPassword, nickname, now).run();

      // bot_personas에 생성
      await db.prepare(`
        INSERT INTO bot_personas (user_id, concept, prompt_instruction, is_active)
        VALUES (?, ?, ?, 1)
      `).bind(botId, concept, promptInstruction).run();

      return new Response(JSON.stringify({ success: true, message: "신규 봇 페르소나가 등록되었습니다.", botId }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    const url = new URL(request.url);
    const botUserId = url.searchParams.get("id");
    const adminUserId = url.searchParams.get("adminUserId");

    if (!botUserId || !adminUserId) {
      return new Response(JSON.stringify({ error: "필수 파라미터가 누락되었습니다." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. 관리자 권한 인증
    const adminCheck = await db.prepare("SELECT role FROM users WHERE id = ?").bind(adminUserId).first();
    if (!adminCheck || adminCheck.role !== "admin") {
      return new Response(JSON.stringify({ error: "관리자 권한이 없습니다." }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. 봇 삭제 (ON DELETE CASCADE에 의해 bot_personas도 자동 제거됨)
    const result = await db.prepare("DELETE FROM users WHERE id = ? AND role = 'bot'").bind(botUserId).run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: "봇 계정이 정상 삭제되었습니다." }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      throw new Error("Failed to delete bot");
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
