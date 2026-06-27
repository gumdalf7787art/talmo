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

    const overallScore = Math.floor(Math.random() * 40) + 40; // 40~80
    let severity = '진행: 중기';
    if (overallScore < 50) severity = '진행: 심각';
    else if (overallScore < 65) severity = '진행: 초기';
    else if (overallScore >= 80) severity = '양호';

    // Generate random breakdown scores that average to somewhat near overallScore
    const densityScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 20 - 10)));
    const hairlineScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 20 - 15)));
    const thicknessScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 20 - 5)));
    const scalpScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 30 - 10)));

    const getStatus = (score) => {
      if (score < 40) return { status: '위험', color: 'red' };
      if (score < 60) return { status: '주의', color: 'orange' };
      if (score < 80) return { status: '양호', color: 'yellow' };
      return { status: '우수', color: 'teal' };
    };

    const mockResponse = {
      diagnosis: {
        score: overallScore,
        severity: severity,
        breakdown: [
          { label: "모발 밀도 (정수리)", score: Math.round(densityScore), avgScore: 68, ...getStatus(densityScore) },
          { label: "헤어라인 (M자) 후퇴도", score: Math.round(hairlineScore), avgScore: 72, ...getStatus(hairlineScore) },
          { label: "모발 굵기 약화", score: Math.round(thicknessScore), avgScore: 75, ...getStatus(thicknessScore) },
          { label: "두피 상태 (각질/홍반)", score: Math.round(scalpScore), avgScore: 80, ...getStatus(scalpScore) }
        ],
        analysis: [
          '동일 연령대 평균 대비 모발 밀도가 다소 감소했습니다.',
          '헤어라인 주변 모낭의 활성도가 떨어지는 양상이 관찰됩니다.',
          '두피 표면에 미세한 유분과 각질이 확인됩니다.'
        ],
        recommendations: [
          '피부과 전문의 상담을 통한 정확한 진단 권장',
          '현재 상태 유지 및 개선을 위한 국소 도포제 사용 고려',
          '주기적인 두피 스케일링 및 스트레스 관리'
        ]
      }
    };

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
