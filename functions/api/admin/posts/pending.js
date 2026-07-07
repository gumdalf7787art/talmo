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

    // 2. pending 상태의 게시글 가져오기
    const stmt = db.prepare(`
      SELECT 
        p.id, 
        p.title, 
        p.category, 
        p.content, 
        p.created_at, 
        p.views,
        u.nickname as author,
        u.id as authorId
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `);

    const { results } = await stmt.all();

    // 본문 내용에서 대표 이미지 경로 파싱
    const processedPosts = results.map(post => {
      const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
      const imageUrl = imgMatch ? imgMatch[1] : null;

      return {
        id: post.id,
        title: post.title,
        category: post.category,
        author: post.author || "봇 사용자",
        authorId: post.authorId,
        created_at: post.created_at,
        views: post.views || 0,
        imageUrl: imageUrl,
        content: post.content // 본문 전체
      };
    });

    return new Response(JSON.stringify({ success: true, posts: processedPosts }), { 
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
