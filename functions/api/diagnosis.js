export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const userId = formData.get('userId');
    const gender = formData.get('gender') || '정보없음';
    const birthYear = formData.get('birthYear') || '정보없음';
    const familyHistory = formData.get('familyHistory') || '정보없음';

    const currentYear = new Date().getFullYear();
    const age = birthYear !== '정보없음' ? currentYear - parseInt(birthYear, 10) : '정보없음';

    if (!image) {
      return new Response(JSON.stringify({ error: '이미지가 없습니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. 이미지를 Base64로 변환
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = arrayBufferToBase64(arrayBuffer);
    const mimeType = image.type || 'image/jpeg';

    // 2. 환경 변수에서 Gemini API Key 가져오기
    const apiKey = env.GEMINI_API_KEY || "YOUR_DUMMY_API_KEY_HERE";

    let aiDiagnosisResult;

    if (apiKey === "YOUR_DUMMY_API_KEY_HERE") {
      aiDiagnosisResult = generateMockData(gender, age, familyHistory);
    } else {
      // 3. 실제 Gemini API 호출 (최신 모델 폴백 지원: 3.5-flash -> 2.5-flash -> 2.0-flash)
      const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
      let geminiResponse;
      let rawText = null;

      for (const model of modelsToTry) {
        const promptText = `
당신은 20년 경력의 세계적인 피부과 전문의이자 모발 이식 권위자입니다.
환자의 기본 정보: [성별: ${gender}, 나이: ${age}세, 탈모 가족력: ${familyHistory}]

첨부된 두피/모발 사진과 환자의 컨텍스트를 종합하여, 실제 의사가 발급하는 **'임상 정밀 진단 리포트'**를 작성해 주세요.
반드시 아래의 엄격한 JSON 형식으로만 응답해야 합니다. 다른 말은 절대 추가하지 마세요.

{
  "diagnosis": {
    "patientInfo": { "age": "${age}", "gender": "${gender}", "familyHistory": "${familyHistory}" },
    "summary": {
      "score": [종합 점수 0~100 정수],
      "severity": "[양호, 진행: 초기, 진행: 중기, 진행: 심각 중 하나]",
      "norwoodStage": "[예: Norwood Stage II, Ludwig Scale I 등 전문적인 단계 표기 (해당 없으면 '해당 없음')]",
      "scalpAge": [실제 나이보다 몇 살 더 들어보이거나 젊어보이는지 추정한 두피 나이 정수값]
    },
    "breakdown": [
      { "id": "density", "label": "모발 밀도 (정수리)", "score": [0~100], "clinicalNote": "[의학적 소견 1문장. 예: '정상 밀도(120/cm2) 대비 20% 감소']" },
      { "id": "hairline", "label": "헤어라인 (M자)", "score": [0~100], "clinicalNote": "[예: '양측두부 연모화 진행 중']" },
      { "id": "thickness", "label": "모발 굵기", "score": [0~100], "clinicalNote": "[예: '모낭 소형화(Miniaturization) 30% 관찰']" },
      { "id": "scalp", "label": "두피 상태", "score": [0~100], "clinicalNote": "[예: '경미한 지루성 두피염 및 각질 관찰']" }
    ],
    "medicalAnalysis": {
      "finding": "[전문의의 객관적 관찰 소견. 중요한 키워드는 반드시 HTML <b> 태그로 굵게 강조할 것. 예: '환자의 사진을 분석한 결과, <b>전두부의 연모화</b>가 특징적으로...']",
      "cause": "[현재 상태의 원인 분석. 환자의 나이, 성별, 가족력을 연관 지어 전문적으로 설명. 중요 키워드 <b>태그 사용]"
    },
    "treatmentPlan": {
      "medical": [
        "[의학적 권고사항 1. 예: '피나스테리드 1mg 1일 1회 복용 권장 (치료제라는 단어는 사용하지 말 것)']",
        "[의학적 권고사항 2]"
      ],
      "homeCare": [
        "[홈케어 제안 1. 예: '살리실산 함유 샴푸 주 2회 사용']",
        "[홈케어 제안 2]"
      ],
      "lifestyle": [
        "[생활습관 교정 1. 예: '코르티솔 수치 관리를 위한 7시간 이상 수면']",
        "[생활습관 교정 2]"
      ]
    }
  }
}
        `;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Image
                    }
                  }
                ]
              }
            ],
            // gemini-pro-vision does not strictly support responseMimeType in some regions, but we will pass it anyway or remove it.
            // Actually, we'll just let it return JSON text.
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          rawText = geminiData.candidates[0].content.parts[0].text;
          rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          break; // 성공하면 루프 탈출
        } else {
          const errorData = await geminiResponse.json().catch(() => ({}));
          const errCode = errorData.error?.code;
          const errMsg = errorData.error?.message || '';
          
          // 404(Not Found) 거나 503(Overloaded) 등 일시적/모델 권한 에러인 경우 다음 모델로 넘어감
          if (errCode === 404 || errCode === 503 || errMsg.includes('not found') || errMsg.includes('high demand') || errMsg.includes('overloaded')) {
            console.log(`[Gemini API] Model ${model} failed (${errCode}), trying next model...`);
            continue;
          } else {
            // 그 외의 치명적 에러(API Key 오류 등)는 즉시 중단
            throw new Error(`Gemini API 오류 (${model}): ${errMsg || '알 수 없는 오류'}`);
          }
        }
      }

      if (!rawText) {
        throw new Error("모든 Gemini 모델(1.5-flash, 1.5-pro, pro-vision) 호출에 실패했거나 사용 가능한 모델이 없습니다. API 키 권한을 확인해주세요.");
      }
      
      try {
        aiDiagnosisResult = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error("AI가 JSON 형식을 반환하지 않았습니다. 내용: " + rawText);
      }
    }

    // 4. 점수에 따른 상태 객체 매핑 (프론트엔드 UI를 위해 color 추가)
    const getStatus = (score) => {
      if (score < 40) return { status: '위험', color: 'red' };
      if (score < 60) return { status: '주의', color: 'orange' };
      if (score < 80) return { status: '양호', color: 'yellow' };
      return { status: '우수', color: 'teal' };
    };

    // breakdown에 색상/상태 정보 및 avgScore 주입 (RadarChart 등 호환성)
    const finalBreakdown = aiDiagnosisResult.diagnosis.breakdown.map((item) => {
      const avgScoreMap = {
        "density": 68,
        "hairline": 72,
        "thickness": 75,
        "scalp": 80
      };
      return {
        ...item,
        avgScore: avgScoreMap[item.id] || 70,
        ...getStatus(item.score)
      };
    });

    aiDiagnosisResult.diagnosis.breakdown = finalBreakdown;

    // 5. 결과 DB 저장
    const db = env.DB;
    if (db && userId) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const dbScore = aiDiagnosisResult?.diagnosis?.summary?.score || 0;
      const dbSeverity = aiDiagnosisResult?.diagnosis?.summary?.severity || '알 수 없음';
      const dbDetails = JSON.stringify(aiDiagnosisResult?.diagnosis || {});
      const thumbnailBase64 = formData.get('thumbnail') || "processed_by_gemini";

      const insertStmt = db.prepare(`
        INSERT INTO diagnostics (id, user_id, score, severity, image_url, details, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, userId, dbScore, dbSeverity, thumbnailBase64, dbDetails, now);
      await insertStmt.run();
    }

    return new Response(JSON.stringify(aiDiagnosisResult), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ArrayBuffer -> Base64 변환 유틸 함수 (대용량 이미지 최적화)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // 청크 단위로 처리하여 콜스택 초과 방지 및 속도 향상
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// 환경 변수 누락 시 작동할 Mock 생성 함수 (새로운 구조 반영)
function generateMockData(gender, age, familyHistory) {
  const overallScore = Math.floor(Math.random() * 40) + 40; // 40~80
  let severity = '진행: 중기';
  if (overallScore < 50) severity = '진행: 심각';
  else if (overallScore < 65) severity = '진행: 초기';
  else if (overallScore >= 80) severity = '양호';

  const densityScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 20 - 10)));
  const hairlineScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 20 - 15)));
  const thicknessScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 20 - 5)));
  const scalpScore = Math.min(100, Math.max(0, overallScore + (Math.random() * 30 - 10)));
  
  const estimatedAge = age !== '정보없음' ? parseInt(age) + (80 - overallScore) / 5 : 35;

  return {
    diagnosis: {
      patientInfo: { age, gender, familyHistory },
      summary: {
        score: overallScore,
        severity: severity,
        norwoodStage: gender === '여성' ? 'Ludwig Scale I' : 'Norwood Stage III',
        scalpAge: Math.round(estimatedAge)
      },
      breakdown: [
        { id: "density", label: "모발 밀도 (정수리)", score: Math.round(densityScore), clinicalNote: "정상 대비 모낭 밀도 다소 감소" },
        { id: "hairline", label: "헤어라인 (M자)", score: Math.round(hairlineScore), clinicalNote: "양측두부 연모화 현상 뚜렷함" },
        { id: "thickness", label: "모발 굵기", score: Math.round(thicknessScore), clinicalNote: "전체적인 모낭 소형화(Miniaturization) 관찰됨" },
        { id: "scalp", label: "두피 상태", score: Math.round(scalpScore), clinicalNote: "미세한 각질 및 피지선 과다 분비" }
      ],
      medicalAnalysis: {
        finding: `제출된 이미지를 분석한 결과, 전반적으로 <b>모낭의 소형화</b>가 관찰되며, 특히 정수리 부근의 밀도가 저하되어 있습니다. 두피 표면에는 <b>미세한 홍반과 유분</b>이 확인됩니다.`,
        cause: `환자분의 컨텍스트(${age}세 ${gender}, 가족력 ${familyHistory})를 고려할 때, 이는 <b>유전적 안드로겐성 탈모(AGA)</b>의 전형적인 초기 양상으로 강하게 추정됩니다.`
      },
      treatmentPlan: {
        medical: [
          "피나스테리드 또는 두타스테리드 계열 약물 복용을 위한 피부과 상담 권장",
          "미녹시딜 5% 국소 도포제 1일 1~2회 사용"
        ],
        homeCare: [
          "약산성 샴푸(pH 5.5)를 이용한 저자극 세정",
          "주 1회 BHA 성분이 포함된 두피 스케일러 사용으로 모공 정화"
        ],
        lifestyle: [
          "모낭 성장을 위한 충분한 단백질(비오틴, 맥주효모) 섭취",
          "두피열을 내리기 위한 자정 이전 수면 습관 형성"
        ]
      }
    }
  };
}
