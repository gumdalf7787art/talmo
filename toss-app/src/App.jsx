import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import Home from "./Home";
import History from "./History";
import PostDetail from "./PostDetail";
import BoardList from "./BoardList";
import BottomNav from "./BottomNav";
import { ArrowLeft, Search, User, Bell, Scissors, X, Activity, AlertCircle, Pill, Home as HomeIcon, Heart, ChevronLeft, ChevronRight, RefreshCcw, HelpCircle } from "lucide-react";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';
import { compressImage, dataURLtoFile } from './imageUtils';
import RadarChart from './RadarChart';

const ASI_MAPPING = {
  "ASI-M1": { code: 'ASI-M1', level: 1, title: '솔리드 존 (Solid Zone)', sub: 'Base Profile', desc: '헤어라인과 정수리가 밀도 높고 단단하게 유지되는 안심 상태입니다.' },
  "ASI-M2": { code: 'ASI-M2', level: 2, title: '사인 패턴 (Sign Pattern)', sub: 'Initial Recede', desc: '양측 이마 끝(M자)이나 앞이마 라인 전체에 미세한 형태 변화의 신호가 감지되는 모니터링 단계입니다.' },
  "ASI-M3": { code: 'ASI-M3', level: 3, title: '앵글 브레이크 (Angle Break)', sub: 'Focal Thinning', desc: 'M자 굴곡이 각지게 깊어지거나 정수리 가마 부위 중 한 곳에 집중적인 공백이 인지되는 진입 단계입니다.' },
  "ASI-M4": { code: 'ASI-M4', level: 4, title: '커넥트 리스크 (Connect Risk)', sub: 'Active Shrink', desc: '헤어라인 후퇴와 정수리 약화가 동시에 진행되어 두 영역이 서로 연결될 리스크가 있는 활성 단계입니다.' },
  "ASI-M5": { code: 'ASI-M5', level: 5, title: '유니온 브릿지 (Union Bridge)', sub: 'Advanced Blend', desc: '앞머리와 정수리 사이의 모발 경계선(Bridge)이 좁아지며 두 영역이 결합되는 심화 단계입니다.' },
  "ASI-M6": { code: 'ASI-M6', level: 6, title: '와이드 코어 (Wide Core)', sub: 'Extensive Void', desc: '중심부 모발 영역이 광범위하게 축소되어 머리 윗부분 전체의 볼륨 복원에 집중해야 하는 단계입니다.' },
  "ASI-M7": { code: 'ASI-M7', level: 7, title: '인텐시브 솔루션 (Intensive)', sub: 'Clinical Matching', desc: '전반적인 모발 영역의 축소 양상으로, 정밀 스캔과 함께 집중적인 밸런스 케어 및 전문가 상담을 권장합니다.' },
  
  "ASI-F1": { code: 'ASI-F1', level: 1, title: '클리어 라인 (Clear Line)', sub: 'Stable Density', desc: '가르마선이 촘촘하고 정수리 모발 밀도가 정상 범위를 유지하고 있는 건강한 상태입니다.' },
  "ASI-F2": { code: 'ASI-F2', level: 2, title: '딤 라인 (Dim Line)', sub: 'Soft Diffusion', desc: '가르마 경계가 미세하게 흐려지며 주변 모발이 부드럽게 가늘어지기 시작하는 모니터링 단계입니다.' },
  "ASI-F3": { code: 'ASI-F3', level: 3, title: '스프레드 패턴 (Spread Pattern)', sub: 'Linear Extension', desc: '가르마 중심의 빈 곳이 크리스마스트리 형태로 외곽까지 확장되며 두피가 조금씩 들여다보이는 주의 단계입니다.' },
  "ASI-F4": { code: 'ASI-F4', level: 4, title: '포커스 케어 (Focus Care)', sub: 'Active Thinning', desc: '정수리 전반의 밀도 감소가 뚜렷하고 볼륨감이 크게 낮아져 본격적인 집중 케어가 필요한 활성 단계입니다.' },
  "ASI-F5": { code: 'ASI-F5', level: 5, title: '인텐시브 솔루션 (Intensive)', sub: 'Clinical Matching', desc: '정수리 광범위 구역의 밀도가 크게 낮아진 상태로, 정밀 스캔과 함께 집중적인 밸런스 케어 및 전문가 상담을 권장합니다.' }
};

const getAsiInfo = (summary) => {
  if (summary?.asiStage && ASI_MAPPING[summary.asiStage]) {
    return ASI_MAPPING[summary.asiStage];
  }
  const stageText = summary?.norwoodStage || "";
  
  if (stageText.includes("Ludwig") || stageText.includes("여성형")) {
    if (stageText.includes("Stage III") || stageText.includes("Scale III")) return ASI_MAPPING["ASI-F5"];
    if (stageText.includes("Stage II-2") || stageText.includes("Scale II-2")) return ASI_MAPPING["ASI-F4"];
    if (stageText.includes("Stage II-1") || stageText.includes("Scale II-1") || stageText.includes("Stage II") || stageText.includes("Scale II")) return ASI_MAPPING["ASI-F3"];
    if (stageText.includes("Stage I-3") || stageText.includes("Stage I-2") || stageText.includes("Scale I-3") || stageText.includes("Scale I-2")) return ASI_MAPPING["ASI-F2"];
    if (stageText.includes("Stage I-1") || stageText.includes("Scale I-1") || stageText.includes("Stage I") || stageText.includes("Scale I")) return ASI_MAPPING["ASI-F1"];
    return ASI_MAPPING["ASI-F1"];
  }

  if (stageText.includes("Stage 7") || stageText.includes("Scale VII")) return ASI_MAPPING["ASI-M7"];
  if (stageText.includes("Stage 6") || stageText.includes("Scale VI")) return ASI_MAPPING["ASI-M6"];
  if (stageText.includes("Stage 5") || stageText.includes("Scale V")) return ASI_MAPPING["ASI-M5"];
  if (stageText.includes("Stage 4") || stageText.includes("Scale IV")) return ASI_MAPPING["ASI-M4"];
  if (stageText.includes("Stage 3") || stageText.includes("Scale III")) return ASI_MAPPING["ASI-M3"];
  if (stageText.includes("Stage 2") || stageText.includes("Scale II")) return ASI_MAPPING["ASI-M2"];
  if (stageText.includes("Stage 1") || stageText.includes("Scale I")) return ASI_MAPPING["ASI-M1"];
  
  return ASI_MAPPING["ASI-M1"];
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [profile, setProfile] = useState({ birthYear: "", gender: "", familyHistory: "" });
  const [searchIndex, setSearchIndex] = useState(0);
  const searchTexts = ["탈모 상태 분석하기", "이식/치료 리얼후기", "전문가 칼럼"];
  const [userId, setUserId] = useState(null);
  const [showAsiModal, setShowAsiModal] = useState(false);
  const [showMypageModal, setShowMypageModal] = useState(false);
  useEffect(() => {
    // 임시 토스 사용자 로그인 프로세스 시뮬레이션
    const loginTossUser = async () => {
      let tossId = localStorage.getItem('toss_id');
      if (!tossId) {
        tossId = 'toss_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('toss_id', tossId);
      }
      try {
        const res = await fetch('https://talmotalk.com/api/auth/toss/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tossId })
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error("Toss Auth Error:", err);
      }
    };
    loginTossUser();

    const timer = setInterval(() => {
      setSearchIndex((prev) => (prev + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const [scanType, setScanType] = useState("이마/헤어라인");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Cropper states
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 2048, 0.9);
        setImagePreview(compressedBase64);
      } catch (err) {
        setImagePreview(URL.createObjectURL(file));
      }
      setIsCropping(true);
      setResult(null);
      e.target.value = null;
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropDone = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imagePreview, croppedAreaPixels);
      setImagePreview(croppedImageBase64);
      const file = dataURLtoFile(croppedImageBase64, "cropped.jpg");
      setImageFile(file);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      alert("크롭 처리 중 오류가 발생했습니다.");
      setIsCropping(false);
    }
  };
  const handleAnalyze = async () => {
    if (!imageFile || !profile.birthYear || !profile.gender || !profile.familyHistory) {
      alert("모든 정보와 사진을 입력해주세요.");
      return;
    }
    setIsAnalyzing(true);
    
    try {
      const payload = {
        userId: userId || null,
        scanType: scanType,
        gender: profile.gender,
        birthYear: profile.birthYear,
        familyHistory: profile.familyHistory,
        image: null
      };

      try {
        const optimizedBase64 = await compressImage(imageFile, 2048, 0.8);
        payload.image = optimizedBase64;
      } catch (err) {
        console.warn("Image optimization failed, sending original as base64...", err);
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(imageFile);
        });
        payload.image = await base64Promise;
      }

      const res = await fetch("https://talmotalk.com/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || "분석 실패");
        } else {
          const textError = await res.text();
          console.error("Non-JSON error response:", textError);
          throw new Error("서버와의 통신에 실패했습니다. (HTTP " + res.status + ")");
        }
      }

      const aiResult = await res.json();
      setResult(aiResult);
    } catch (err) {
      console.error(err);
      alert(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLinkToWeb = () => {
    window.open("https://talmotalk.com", "_blank");
  };

  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    if (view === 'post_detail') {
      setSelectedPostId(data);
    } else if (view === 'board_list') {
      setSelectedCategory(data);
    }
  };

  // 결과 화면
  if (result && result.diagnosis) {
    const diag = result.diagnosis;
    const summary = diag.summary || {};
    const breakdown = diag.breakdown || [];
    
    const renderStageText = (stageStr) => {
      if (!stageStr) return null;
      let title = stageStr;
      let sub = "";
      if (stageStr.includes('Norwood')) { title = '남성형 탈모'; sub = stageStr.replace('남성형 탈모 ', ''); }
      else if (stageStr.includes('Ludwig')) { title = '여성형 탈모'; sub = stageStr.replace('여성형 탈모 ', ''); }
      return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{title}</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#6B7280' }}>{sub}</span>
        </div>
      );
    };

    return (
      <div className="app-container" style={{ padding: 0, paddingBottom: '80px', backgroundColor: 'var(--card-bg)' }}>
        <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f3f4f6', backgroundColor: 'white', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            onClick={() => { setResult(null); handleNavigate('home'); }} 
            style={{ position: 'absolute', left: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={24} color="var(--text-main)" />
          </button>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>AI 탈모 분석 결과</h1>
        </header>
        
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>탈모 종합 점수</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                  {summary.score || 0}<span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>/100</span>
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>추정 두피 나이</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0d9488' }}>
                  {summary.scalpAge || "-"}<span style={{ fontSize: '12px', color: 'rgba(13, 148, 136, 0.6)', fontWeight: '500' }}>세</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>진행 단계 (AI Scalp Index)</span>
                <button onClick={() => setShowAsiModal(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                  <HelpCircle size={14} color="#94a3b8" />
                </button>
              </div>
              
              {(() => {
                const asi = getAsiInfo(summary);
                return (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>{asi.sub}</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626', margin: '2px 0' }}>{asi.code}</span>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>{asi.title}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%', marginTop: '12px', padding: '0 4px' }}>
                      {(asi.code.includes('F') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]).map((step) => {
                        const isActive = asi.level === step;
                        return (
                          <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ height: '6px', width: '100%', borderRadius: '999px', backgroundColor: isActive ? '#ef4444' : '#e2e8f0' }} />
                            <span style={{ fontSize: '9px', whiteSpace: 'nowrap', fontWeight: isActive ? 'bold' : '500', color: isActive ? '#dc2626' : '#94a3b8' }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {showAsiModal && (
                      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '320px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                            <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Activity size={16} color="#475569" /> 
                              AI Scalp Index 안내
                            </h4>
                            <button onClick={() => setShowAsiModal(false)} style={{ background: 'white', border: 'none', padding: '4px', borderRadius: '999px', display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                              <X size={16} color="#94a3b8" />
                            </button>
                          </div>
                          <div style={{ padding: '20px' }}>
                            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', marginBottom: '12px' }}>
                              {asi.code} : {asi.title}
                            </div>
                            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px 0', textAlign: 'left' }}>
                              {asi.desc}
                            </p>
                            <div style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', textAlign: 'left', lineHeight: '1.4' }}>
                              * AI Scalp Index(ASI)는 탈모 데이터를 기반으로 학습된 탈모톡만의 독자적인 인공지능 두피 분석 지표입니다.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '15px', color: '#111827', marginBottom: '16px' }}>항목별 상세 지표</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {breakdown.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>{m.label}</span>
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                        평균 {m.avgScore || 70}점
                      </span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: m.color === 'red' ? '#ef4444' : m.color === 'orange' ? '#f97316' : m.color === 'yellow' ? '#eab308' : '#14b8a6' }}>
                      {m.status} ({m.score}점)
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', backgroundColor: '#f3f4f6', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', backgroundColor: m.color === 'red' ? '#f87171' : m.color === 'orange' ? '#fb923c' : m.color === 'yellow' ? '#facc15' : '#2dd4bf', width: `${m.score}%` }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, width: '2px', backgroundColor: '#9ca3af', zIndex: 10, opacity: 0.7, left: `${m.avgScore || 70}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h5 style={{ fontWeight: 'bold', fontSize: '14px', color: '#1f2937', marginBottom: '16px' }}>항목별 종합 밸런스</h5>
              <RadarChart breakdown={breakdown} />
            </div>

            {diag.medicalAnalysis && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Activity size={16} color="#4b5563" /> 탈모톡 소견
                  </h3>
                </div>
                <div style={{ padding: '16px', fontSize: '13px', color: '#374151', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {diag.medicalAnalysis.finding && (
                    <div>
                      <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>특징 분석:</strong>
                      <p dangerouslySetInnerHTML={{ __html: diag.medicalAnalysis.finding }} style={{ margin: 0 }} />
                    </div>
                  )}
                  {diag.medicalAnalysis.cause && (
                    <div>
                      <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>추정 요인:</strong>
                      <p dangerouslySetInnerHTML={{ __html: diag.medicalAnalysis.cause }} style={{ margin: 0 }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {diag.treatmentPlan && (
              <div style={{ border: '1px solid #99f6e4', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ backgroundColor: '#0f766e', padding: '12px', borderBottom: '1px solid #115e59' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <AlertCircle size={16} color="#99f6e4" /> 맞춤 관리 가이드
                  </h3>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'rgba(240, 253, 250, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {diag.treatmentPlan.medical?.length > 0 && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#115e59', marginBottom: '6px', margin: 0 }}>
                        <Pill size={14} /> 권고사항
                      </h4>
                      <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#134e4a', margin: 0, lineHeight: '1.5' }}>
                        {diag.treatmentPlan.medical.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                      </ul>
                    </div>
                  )}

                  {diag.treatmentPlan.homeCare?.length > 0 && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8', marginBottom: '6px', margin: 0 }}>
                        <HomeIcon size={14} /> 자가 관리
                      </h4>
                      <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#1e3a8a', margin: 0, lineHeight: '1.5' }}>
                        {diag.treatmentPlan.homeCare.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                      </ul>
                    </div>
                  )}

                  {diag.treatmentPlan.lifestyle?.length > 0 && (
                    <div>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#c2410c', marginBottom: '6px', margin: 0 }}>
                        <Heart size={14} /> 생활 습관
                      </h4>
                      <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#7c2d12', margin: 0, lineHeight: '1.5' }}>
                        {diag.treatmentPlan.lifestyle.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#111827', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imagePreview} alt="Analyzed" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
              <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(20, 184, 166, 0.5)', borderRadius: '12px' }}></div>
              <div style={{ position: 'absolute', top: '8px', left: '12px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>AI 분석 원본</div>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px', paddingBottom: '16px' }}>
              * 본 AI 리포트는 통계적 데이터 분석 결과이며, 의학적 진단을 대체하는 진단서가 아닙니다.
            </div>

            <div className="bottom-actions" style={{ padding: '0 0 24px 0', marginTop: '16px' }}>
              <button className="primary-btn green-btn" onClick={handleLinkToWeb} style={{ padding: '14px', borderRadius: '12px', fontSize: '15px' }}>
                탈모톡 가입하고 무료티켓 더 받기
              </button>
            </div>
          </div>
        </div>
        <BottomNav currentView="analysis" onNavigate={handleNavigate} />
      </div>
    );
  }

  // 홈 화면
  if (currentView === 'home') {
    return <Home onNavigate={handleNavigate} />;
  }

  // 진단 기록 화면
  if (currentView === 'history') {
    return <History onNavigate={handleNavigate} />;
  }

  // 전체 게시판 화면
  if (currentView === 'board_list') {
    return <BoardList initialTab={selectedCategory} onNavigate={handleNavigate} />;
  }

  // 게시글 상세 화면
  if (currentView === 'post_detail' && selectedPostId) {
    return <PostDetail postId={selectedPostId} onNavigate={handleNavigate} />;
  }

  // 기본 입력 화면 (AI 분석)
  return (
    <div className="app-container" style={{ padding: 0, paddingBottom: '65px', position: 'relative', backgroundColor: 'var(--card-bg)' }}>
      
      {/* Crop Modal */}
      {isCropping && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 110,
          backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scissors size={16} color="var(--talmo-green)" />
                얼굴이 보이지 않게 크롭해주세요
              </h3>
              <button onClick={() => setIsCropping(false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <X size={20} color="#9ca3af" />
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: '50vh', backgroundColor: 'black' }}>
              <Cropper
                image={imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ padding: '16px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>확대/축소</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button onClick={handleCropDone} className="primary-btn green-btn" style={{ padding: '12px', fontSize: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', color: 'white', cursor: 'pointer' }}>
                이대로 자르고 업로드하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 글로벌 헤더 */}
      <header className="home-header" style={{
        position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'white', 
        borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '60px', gap: '10px' }}>
          <div className="logo" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleNavigate('home')}>
            <img src="https://talmotalk.pages.dev/logo-mobile.png?v=2" alt="탈모톡 로고" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="search-bar" style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', 
            border: '2px solid var(--talmo-green)', borderRadius: '25px', padding: '0 12px',
            overflow: 'hidden', height: '34px'
          }}>
            <Search size={16} color="var(--talmo-green)" />
            <div style={{ height: '18px', overflow: 'hidden', flex: 1, position: 'relative' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', transition: 'transform 0.5s ease-in-out',
                position: 'absolute', width: '100%', top: 0, left: 0,
                transform: `translateY(-${searchIndex * 18}px)`
              }}>
                {searchTexts.map((text, idx) => (
                  <span key={idx} style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Bell size={22} color="#4b5563" />
            <div onClick={() => setShowMypageModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <User size={22} color="#4b5563" />
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
          AI 탈모 분석
        </h1>
        
        <div style={{ backgroundColor: '#fff1f2', borderRadius: '8px', padding: '8px 12px', border: '1px solid #ffe4e6', display: 'flex', gap: '8px', margin: '12px 0', alignItems: 'flex-start' }}>
          <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold', lineHeight: '1.4' }}>ⓘ</span>
          <p style={{ fontSize: '12px', color: '#ef4444', margin: 0, lineHeight: '1.4', fontWeight: '600' }}>
            ※ 개인정보 보호를 위해 얼굴이 나오지 않도록, 이마와 두피 부위만 보이게 지정해 주세요.
          </p>
        </div>

        <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 16px 0', fontWeight: '400', lineHeight: '1.4' }}>
          이마 라인이나 정수리가 잘 보이도록 사진을 1장 선택해 주세요.
        </p>
      </div>

      <div className="form-section" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* 정보 입력 카드 */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px 16px', border: '1px solid #d1d5db', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 12px 0' }}>정보 입력</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* 성별 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '50px', color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>성별</span>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                {["남성", "여성"].map(g => (
                  <button 
                    key={g} 
                    onClick={() => setProfile({...profile, gender: g})}
                    style={{ 
                      flex: 1, padding: '6px 0', borderRadius: '8px', cursor: 'pointer',
                      border: profile.gender === g ? 'none' : '1px solid #d1d5db', 
                      backgroundColor: profile.gender === g ? 'var(--talmo-green)' : '#f3f4f6', 
                      color: profile.gender === g ? 'white' : '#6b7280', 
                      fontWeight: profile.gender === g ? 'bold' : '500', 
                      fontSize: '13px' 
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 출생연도 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '50px', color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>출생</span>
              <select 
                value={profile.birthYear} 
                onChange={(e) => setProfile({...profile, birthYear: e.target.value})}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}
              >
                <option value="">선택해주세요</option>
                {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
            </div>

            {/* 가족력 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '50px', color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>가족력</span>
              <select 
                value={profile.familyHistory} 
                onChange={(e) => setProfile({...profile, familyHistory: e.target.value})}
                style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}
              >
                <option value="">선택해주세요</option>
                {["있음 (부계)", "있음 (모계)", "있음 (양가 모두)", "없음", "모름"].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 사진 업로드 카드 */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px' }}>📷</span>
              <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>정확도를 높이는 촬영 팁</h2>
            </div>
            
            <div className="btn-group scan-type-group" style={{ marginBottom: '16px' }}>
               <button 
                 onClick={() => setScanType('이마/헤어라인')} 
                 className={`toggle-btn ${scanType === '이마/헤어라인' ? 'active' : ''}`}
               >
                 이마/헤어라인
               </button>
               <button 
                 onClick={() => setScanType('정수리/가르마')} 
                 className={`toggle-btn ${scanType === '정수리/가르마' ? 'active' : ''}`}
               >
                 정수리/가르마
               </button>
            </div>

            <div className="image-upload-box" onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <span className="camera-icon">📷</span>
                  <span>여기를 눌러 사진을 올려주세요</span>
                </div>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} hidden />
            </div>
            
            <div className="tips-section" style={{ marginTop: '24px' }}>
              <div className="tips-grid">
                <div className="tip-card" style={{ backgroundColor: 'white' }}>
                  <div className="tip-img-wrapper">
                    <img src="/tip_m_hairline.jpg" alt="M자 헤어라인" />
                  </div>
                  <strong>M자 / 헤어라인</strong>
                  <p>정면에서<br/>라인이 잘 보이도록</p>
                </div>
                <div className="tip-card" style={{ backgroundColor: 'white' }}>
                  <div className="tip-img-wrapper">
                    <img src="/tip_crown_part.jpg" alt="정수리 가르마" />
                  </div>
                  <strong>정수리 / 가르마</strong>
                  <p>고개를 숙이고<br/>전체가 잘 보이도록</p>
                </div>
              </div>
              <div className="tips-warning" style={{ backgroundColor: 'white' }}>
                <div className="warning-top">
                  <span className="warning-icon">❕</span>
                  <span>밝은 조명 아래에서 흔들림 없이 찍어야 <strong>모발 밀도와 두피 상태(홍반 등)</strong>를 AI가 가장 정확히 판독합니다.</span>
                </div>
                <ul className="warning-list">
                  <li>Ai 판독은 각도와 조명 그리고 촬영 이미지에 따라 다르게 나올 수 있습니다.</li>
                  <li>확대경으로 찍은 사진이 아니므로 참고용으로만 사용해주시기 바랍니다.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="bottom-actions" style={{ padding: '0 20px 24px' }}>
        <button 
          className={`primary-btn ${isAnalyzing ? 'loading' : ''}`} 
          onClick={handleAnalyze}
          disabled={!imageFile || !profile.birthYear || !profile.gender || !profile.familyHistory || isAnalyzing}
        >
          {isAnalyzing ? "AI 분석 중..." : "AI 탈모 분석"}
        </button>
        <p className="disclaimer">본 진단은 의료용이 아니며, 피부과 전문의 상담을 권장합니다.</p>
      </div>
      
      <BottomNav currentView="analysis" onNavigate={handleNavigate} />

      {/* 마이페이지 이동 확인 모달 */}
      {showMypageModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '320px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>탈모톡 본 페이지로 이동</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '24px' }}>
              마이페이지 기능은 <strong style={{ color: 'var(--talmo-green)' }}>탈모톡</strong>에서 가능합니다.<br/>
              탈모톡으로 옮겨집니다.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowMypageModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                그냥 있기
              </button>
              <button 
                onClick={() => {
                  setShowMypageModal(false);
                  window.open('https://talmotalk.com/my-page', '_blank');
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--talmo-green)', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                탈모톡 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
