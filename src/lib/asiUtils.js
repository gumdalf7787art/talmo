export const ASI_MAPPING = {
  "ASI-M1": { code: 'ASI-M1', level: 1, title: '솔리드 존 (Solid Zone)', sub: 'Base Profile', desc: '헤어라인과 정수리가 밀도 높고 단단하게 유지되는 안심 상태입니다.' },
  "ASI-M2": { code: 'ASI-M2', level: 2, title: '사인 패턴 (Sign Pattern)', sub: 'Initial Recede', desc: '양측 이마 끝(M자)이나 앞이마 라인 전체에 미세한 형태 변화의 신호가 감지되는 모니터링 단계입니다.' },
  "ASI-M3": { code: 'ASI-M3', level: 3, title: '앵글 브레이크 (Angle Break)', sub: 'Focal Thinning', desc: 'M자 굴곡이 각지게 깊어지거나 정수리 가마 부위 중 한 곳에 집중적인 공백이 인지되는 진입 단계입니다.' },
  "ASI-M4": { code: 'ASI-M4', level: 4, title: '커넥트 리스크 (Connect Risk)', sub: 'Active Shrink', desc: '헤어라인 후퇴와 정수리 약화가 동시에 진행되어 두 영역이 서로 연결될 리스크가 있는 활성 단계입니다.' },
  "ASI-M5": { code: 'ASI-M5', level: 5, title: '유니온 브릿지 (Union Bridge)', sub: 'Advanced Blend', desc: '앞머리와 정수리 사이의 모발 경계선(Bridge)이 좁아지며 두 영역이 결합되는 심화 단계입니다.' },
  "ASI-M6": { code: 'ASI-M6', level: 6, title: '와이드 코어 (Wide Core)', sub: 'Extensive Void', desc: '중심부 모발 영역이 광범위하게 축소되어 머리 윗부분 전체의 볼륨 복원에 집중해야 하는 단계입니다.' },
  "ASI-M7": { code: 'ASI-M7', level: 7, title: '인텐시브 솔루션 (Intensive)', sub: 'Clinical Matching', desc: '전반적인 모발 영역의 축소 양상으로, 정밀 스캔과 함께 집중적인 밸런스 케어 및 전문가 상담을 권장합니다.' }
};

export const getAsiInfo = (report) => {
  if (report?.summary?.asiStage && ASI_MAPPING[report.summary.asiStage]) {
    return ASI_MAPPING[report.summary.asiStage];
  }
  // Fallback parsing from norwoodStage for older reports
  const stageText = report?.summary?.norwoodStage || "";
  if (stageText.includes("Stage 7") || stageText.includes("Scale VII")) return ASI_MAPPING["ASI-M7"];
  if (stageText.includes("Stage 6") || stageText.includes("Scale VI")) return ASI_MAPPING["ASI-M6"];
  if (stageText.includes("Stage 5") || stageText.includes("Scale V")) return ASI_MAPPING["ASI-M5"];
  if (stageText.includes("Stage 4") || stageText.includes("Scale IV")) return ASI_MAPPING["ASI-M4"];
  if (stageText.includes("Stage 3") || stageText.includes("Scale III")) return ASI_MAPPING["ASI-M3"];
  if (stageText.includes("Stage 2") || stageText.includes("Scale II")) return ASI_MAPPING["ASI-M2"];
  if (stageText.includes("Stage 1") || stageText.includes("Scale I")) return ASI_MAPPING["ASI-M1"];
  
  return ASI_MAPPING["ASI-M1"]; // Default safe fallback
};
