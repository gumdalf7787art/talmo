export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Basic Auth 검증
    const authHeader = request.headers.get('Authorization');
    const EXPECTED_AUTH = env.TOSS_DISCONNECT_AUTH || 'Basic dGFsbW90YWxrOnRvc3Nfc2VjcmV0X2tleQ=='; // talmotalk:toss_secret_key (Base64)

    if (authHeader !== EXPECTED_AUTH) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    
    // 토스 측에서 보내주는 유저 식별자 (Toss API 문서에 따라 필드명은 다를 수 있음, 보통 userToken 혹은 id)
    const tossId = body.userToken || body.tossId || body.id;

    if (!tossId) {
      return new Response(JSON.stringify({ error: 'Missing Toss user ID in request' }), { status: 400 });
    }

    const db = env.DB;
    if (db) {
      // 해당 토스 ID를 가진 유저의 연결 정보 제거 혹은 계정 탈퇴 처리
      // 탈모톡의 경우 계정 자체를 비활성화하거나 provider를 null로 변경할 수 있습니다.
      await db.prepare("UPDATE users SET provider = NULL, provider_id = NULL WHERE provider = 'toss' AND provider_id = ?").bind(tossId).run();
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Toss disconnect error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
