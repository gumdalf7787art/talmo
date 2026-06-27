export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return new Response(JSON.stringify({ error: '이미지가 없습니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // AI API Call Mock
    // In production, this would call Cloudflare Workers AI or an external AI provider
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI Response
    const mockResponse = {
      score: Math.floor(Math.random() * 40) + 40, // 40~80 random score
      status: '진행중', // 양호, 주의, 진행중, 심각
      analysis: [
        'M자형 탈모 초기 증상이 관찰됩니다.',
        '전두부 모발 밀도가 평균 대비 20% 감소했습니다.',
        '두피 홍조가 보이며 염증 소견이 있습니다.'
      ],
      recommendations: [
        '피부과 전문의 상담을 통한 정확한 진단 권장',
        '미노キシ딜 5% 국소 도포제 사용 고려',
        '스트레스 관리 및 충분한 수면'
      ]
    };

    if (mockResponse.score < 50) mockResponse.status = '심각';
    else if (mockResponse.score < 65) mockResponse.status = '주의';
    else if (mockResponse.score >= 80) mockResponse.status = '양호';

    // (Optional) Save to DB
    /*
    const db = env.DB;
    if (db) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const insertStmt = db.prepare(`
        INSERT INTO diagnostics (id, user_id, score, status, result_json, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, null, mockResponse.score, mockResponse.status, JSON.stringify(mockResponse), now);
      await insertStmt.run();
    }
    */

    return new Response(JSON.stringify(mockResponse), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
