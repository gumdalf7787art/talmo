import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // TODO: 향후 진짜 탈모 진단 모델(TensorFlow 등) 연동 포인트
    // 1. 이미지를 서버에 저장하거나 메모리에 로드
    // 2. Python 기반 AI 서버나 로컬 모델로 이미지 전송하여 추론 (Inference)
    // 3. 실제 분석 결과 반환

    // 임시(가짜) 분석 지연 시간 (AI가 분석하는 척)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // 임시(가짜) 분석 결과 반환 시나리오
    // 실제로는 모델의 output(ex: 탈모 확률 68%, M자 초기)을 파싱하여 반환합니다.
    const mockResult = {
      status: "success",
      diagnosis: {
        severity: "초기", // 정상, 초기, 중기, 심각
        description: "동일 연령대(30대 남성) 평균 대비 이마 라인(M자)이 살짝 더 올라간 상태입니다. 꾸준한 관리가 필요합니다.",
        score: 65, // 100점에 가까울수록 양호
        recommendation: "탈모 샴푸 사용 및 가까운 병원에서의 초기 상담을 권장합니다.",
      }
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
