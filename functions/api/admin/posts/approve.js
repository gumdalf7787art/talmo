export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    const body = await request.json();
    const { postId, title, content, category, adminUserId } = body;

    // 1. 필수 파라미터 체크 및 관리자 인증
    if (!postId || !adminUserId) {
      return new Response(JSON.stringify({ error: "필수 파라미터(postId, adminUserId)가 누락되었습니다." }), { 
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

    // 2. 게시글 상세정보 조회 (존재 여부 및 pending 확인)
    const postCheck = await db.prepare("SELECT status, title, content, category FROM posts WHERE id = ?").bind(postId).first();
    if (!postCheck) {
      return new Response(JSON.stringify({ error: "게시글을 찾을 수 없습니다." }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (postCheck.status !== "pending") {
      return new Response(JSON.stringify({ error: "이미 승인되었거나 승인 대기 중인 상태가 아닙니다." }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. 최종 승인 업데이트 (제목/본문/카테고리 수정 가능, 발행시간은 현재로 갱신)
    const finalTitle = title || postCheck.title;
    const finalContent = content || postCheck.content;
    const finalCategory = category || postCheck.category;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE posts 
      SET title = ?, content = ?, category = ?, status = 'published', created_at = ?
      WHERE id = ?
    `).bind(finalTitle, finalContent, finalCategory, now, postId);

    const result = await stmt.run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: "게시글이 성공적으로 승인 및 발행되었습니다." }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      throw new Error("Failed to approve post");
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
