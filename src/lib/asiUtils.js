export const ASI_MAPPING = {
  // Male (Norwood)
  "ASI-M1": { code: 'ASI-M1', level: 1, title: '솔리드 존 (Solid Zone)', sub: 'Base Profile', desc: '헤어라인과 정수리가 밀도 높고 단단하게 유지되는 안심 상태입니다.' },
  "ASI-M2": { code: 'ASI-M2', level: 2, title: '사인 패턴 (Sign Pattern)', sub: 'Initial Recede', desc: '양측 이마 끝(M자)이나 앞이마 라인 전체에 미세한 형태 변화의 신호가 감지되는 모니터링 단계입니다.' },
  "ASI-M3": { code: 'ASI-M3', level: 3, title: '앵글 브레이크 (Angle Break)', sub: 'Focal Thinning', desc: 'M자 굴곡이 각지게 깊어지거나 정수리 가마 부위 중 한 곳에 집중적인 공백이 인지되는 진입 단계입니다.' },
  "ASI-M4": { code: 'ASI-M4', level: 4, title: '커넥트 리스크 (Connect Risk)', sub: 'Active Shrink', desc: '헤어라인 후퇴와 정수리 약화가 동시에 진행되어 두 영역이 서로 연결될 리스크가 있는 활성 단계입니다.' },
  "ASI-M5": { code: 'ASI-M5', level: 5, title: '유니온 브릿지 (Union Bridge)', sub: 'Advanced Blend', desc: '앞머리와 정수리 사이의 모발 경계선(Bridge)이 좁아지며 두 영역이 결합되는 심화 단계입니다.' },
  "ASI-M6": { code: 'ASI-M6', level: 6, title: '와이드 코어 (Wide Core)', sub: 'Extensive Void', desc: '중심부 모발 영역이 광범위하게 축소되어 머리 윗부분 전체의 볼륨 복원에 집중해야 하는 단계입니다.' },
  "ASI-M7": { code: 'ASI-M7', level: 7, title: '인텐시브 솔루션 (Intensive)', sub: 'Clinical Matching', desc: '전반적인 모발 영역의 축소 양상으로, 정밀 스캔과 함께 집중적인 밸런스 케어 및 전문가 상담을 권장합니다.' },
  
  // Female (Ludwig/Savin)
  "ASI-F1": { code: 'ASI-F1', level: 1, title: '클리어 라인 (Clear Line)', sub: 'Stable Density', desc: '가르마선이 촘촘하고 정수리 모발 밀도가 정상 범위를 유지하고 있는 건강한 상태입니다.' },
  "ASI-F2": { code: 'ASI-F2', level: 2, title: '딤 라인 (Dim Line)', sub: 'Soft Diffusion', desc: '가르마 경계가 미세하게 흐려지며 주변 모발이 부드럽게 가늘어지기 시작하는 모니터링 단계입니다.' },
  "ASI-F3": { code: 'ASI-F3', level: 3, title: '스프레드 패턴 (Spread Pattern)', sub: 'Linear Extension', desc: '가르마 중심의 빈 곳이 크리스마스트리 형태로 외곽까지 확장되며 두피가 조금씩 들여다보이는 주의 단계입니다.' },
  "ASI-F4": { code: 'ASI-F4', level: 4, title: '포커스 케어 (Focus Care)', sub: 'Active Thinning', desc: '정수리 전반의 밀도 감소가 뚜렷하고 볼륨감이 크게 낮아져 본격적인 집중 케어가 필요한 활성 단계입니다.' },
  "ASI-F5": { code: 'ASI-F5', level: 5, title: '인텐시브 솔루션 (Intensive)', sub: 'Clinical Matching', desc: '정수리 광범위 구역의 밀도가 크게 낮아진 상태로, 정밀 스캔과 함께 집중적인 밸런스 케어 및 전문가 상담을 권장합니다.' }
};

export const getAsiInfo = (report) => {
  if (!report) return ASI_MAPPING["ASI-M1"];
  
  // Extract summary and breakdown (handles both nested report and flat summary objects)
  const summary = report.summary || report;
  const breakdown = report.breakdown || report.metrics || [];

  const isFemale = (summary.gender && (summary.gender === 'female' || summary.gender === '여성')) || 
                   (summary.norwoodStage?.includes("Ludwig") || summary.norwoodStage?.includes("여성형")) ||
                   (summary.asiStage?.includes('ASI-F'));

  const overallScore = summary.score || 0;

  // Default to 100 so missing metrics don't trigger penalties
  let densityScore = 100;
  let hairlineScore = 100;
  let thicknessScore = 100;

  if (breakdown && breakdown.length > 0) {
    const densityMetric = breakdown.find(m => m.id === 'density' || m.label?.includes('밀도'));
    if (densityMetric) densityScore = densityMetric.score;

    const hairlineMetric = breakdown.find(m => m.id === 'hairline' || m.label?.includes('헤어라인') || m.label?.includes('M자'));
    if (hairlineMetric) hairlineScore = hairlineMetric.score;

    const thicknessMetric = breakdown.find(m => m.id === 'thickness' || m.label?.includes('굵기'));
    if (thicknessMetric) thicknessScore = thicknessMetric.score;
  }

  if (isFemale) {
    let baseLevel = 1;
    if (overallScore >= 80) baseLevel = 1;
    else if (overallScore >= 60) baseLevel = 2;
    else if (overallScore >= 40) baseLevel = 3;
    else if (overallScore >= 20) baseLevel = 4;
    else baseLevel = 5;

    let overrideLevel = 1;
    if (densityScore < 20) overrideLevel = 5;
    else if (densityScore < 40) overrideLevel = 4;
    else if (densityScore < 60) overrideLevel = 3;
    else if (densityScore < 80) overrideLevel = 2;

    let finalLevel = Math.max(baseLevel, overrideLevel);

    if (densityScore < 60 && thicknessScore < 40) {
      finalLevel += 1;
    }
    finalLevel = Math.min(finalLevel, 5);

    return ASI_MAPPING[`ASI-F${finalLevel}`] || ASI_MAPPING["ASI-F1"];
  } else {
    let baseLevel = 1;
    if (overallScore >= 85) baseLevel = 1;
    else if (overallScore >= 70) baseLevel = 2;
    else if (overallScore >= 55) baseLevel = 3;
    else if (overallScore >= 40) baseLevel = 4;
    else if (overallScore >= 25) baseLevel = 5;
    else if (overallScore >= 10) baseLevel = 6;
    else baseLevel = 7;

    let overrideLevel = 1;
    if (hairlineScore < 20 && densityScore < 20) overrideLevel = 6;
    else if (hairlineScore < 20 || densityScore < 20) overrideLevel = 5;
    else if (hairlineScore < 40 || densityScore < 40) overrideLevel = 4;
    else if (hairlineScore < 60 || densityScore < 60) overrideLevel = 3;
    else if (hairlineScore < 80 || densityScore < 80) overrideLevel = 2;

    let finalLevel = Math.max(baseLevel, overrideLevel);

    if (densityScore < 60 && thicknessScore < 40) {
      finalLevel += 1;
    }
    finalLevel = Math.min(finalLevel, 7);

    return ASI_MAPPING[`ASI-M${finalLevel}`] || ASI_MAPPING["ASI-M1"];
  }
};

export const getAsiSeverityIndex = (asi) => {
  if (!asi) return 0;
  if (asi.code.includes('F')) {
    if (asi.level === 1) return 0; // 양호
    if (asi.level === 2) return 1; // 주의
    if (asi.level <= 4) return 2; // 위험
    return 3; // 심각
  } else {
    if (asi.level === 1) return 0; // 양호
    if (asi.level <= 3) return 1; // 주의
    if (asi.level <= 5) return 2; // 위험
    return 3; // 심각
  }
};
