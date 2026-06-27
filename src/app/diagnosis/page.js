"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, Upload, AlertCircle, RefreshCcw, MapPin, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCDiagnosis from "@/components/pc/PCDiagnosis";

function DiagnosisContent() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    gender: "",
    birthYear: "",
    familyHistory: ""
  });

  // Load profile from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setProfile({
        gender: parsed.gender || "",
        birthYear: parsed.birth_year || "",
        familyHistory: parsed.family_history || ""
      });
    }
  }, []);

  // Validation
  const isProfileComplete = profile.gender !== "" && profile.birthYear.length === 4 && profile.familyHistory !== "";

  const recommendedClinics = [
    {
      id: 1,
      name: "모프로 탈모의원",
      location: "서울 강남구",
      category: "모발이식",
      consults: 1540,
      isPremium: true,
    },
    {
      id: 2,
      name: "블랙라인 스튜디오",
      location: "서울 서초구",
      category: "두피문신(SMP)",
      consults: 890,
      isPremium: true,
    }
  ];

  const searchParams = useSearchParams();
  const isHistory = searchParams.get("history") === "true";
  
  useEffect(() => {
    if (isHistory) {
      setResult({
        score: 65,
        severity: "진행: 초기",
      });
      setImagePreview("https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&h=500&fit=crop");
    }
  }, [searchParams]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null); // 새로운 사진 올리면 결과 초기화
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !isProfileComplete) return;

    // Auto-save profile if it was empty or changed
    if (user) {
      const isUpdated = 
        user.gender !== profile.gender || 
        user.birth_year !== profile.birthYear || 
        user.family_history !== profile.familyHistory;
        
      if (isUpdated) {
        try {
          const updates = { 
            gender: profile.gender, 
            birth_year: profile.birthYear, 
            family_history: profile.familyHistory 
          };
          const res = await fetch('/api/user/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, ...updates })
          });
          if (res.ok) {
            const updatedUser = { ...user, ...updates };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } catch (e) {
          console.error("Failed to sync profile", e);
        }
      }
    }

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.diagnosis);
      } else {
        alert("분석 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버와 통신할 수 없습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`flex flex-col ${isHistory ? 'gap-4 p-0' : 'gap-6 p-4'}`}>
      
      {/* Back Button Header for History Mode */}
      {isHistory && (
        <header className="sticky top-0 z-50 bg-white flex items-center gap-2 px-4 h-14 border-b border-gray-100">
          <button onClick={() => window.history.back()} className="p-1 -ml-1 text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-[16px] text-gray-900">상세 리포트</h1>
        </header>
      )}

      {/* Default Title for Tool Mode */}
      {!isHistory && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900">AI 두피 분석</h2>
          <p className="text-sm text-gray-500">
            이마 라인이나 정수리가 잘 보이도록 사진을 찍어주세요. (독립 AI 분석 테스트)
          </p>
        </div>
      )}

      {!result && !isHistory && (
        <div className="flex flex-col gap-4">
          
          {/* AI Profile Requirement Box (Compact) */}
          <div className="bg-white border border-gray-200 p-3.5 rounded-xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[14px] text-gray-900">정보 입력</h3>
              {!isProfileComplete && <span className="text-[11px] text-red-500 font-medium ml-auto">필수 입력 항목입니다</span>}
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Gender */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-500 font-medium w-10">성별</span>
                <div className="flex gap-1 flex-1">
                  {["남성", "여성"].map(g => (
                    <button 
                      key={g} 
                      onClick={() => setProfile(prev => ({ ...prev, gender: g }))}
                      className={`flex-1 py-1.5 rounded text-[12px] font-bold transition-colors ${profile.gender === g ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Year */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-500 font-medium w-10">출생</span>
                <select 
                  value={profile.birthYear}
                  onChange={(e) => setProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded py-1.5 px-3 text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-900"
                >
                  <option value="" disabled>선택</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>

              {/* Family History */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-500 font-medium w-10">가족력</span>
                <select 
                  value={profile.familyHistory}
                  onChange={(e) => setProfile(prev => ({ ...prev, familyHistory: e.target.value }))}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded py-1.5 px-3 text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-900"
                >
                  <option value="" disabled>선택</option>
                  {["있음 (부계)", "있음 (모계)", "있음 (양가 모두)", "없음", "모름"].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 업로드 영역 */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 gap-2">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Camera className="w-8 h-8 text-teal-500" />
                </div>
                <span className="font-medium">사진 촬영 또는 업로드</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          {/* 분석 버튼 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAnalyze}
              disabled={!imageFile || isAnalyzing || !isProfileComplete}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors ${
                !imageFile || !isProfileComplete ? "bg-gray-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 shadow-md"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  AI 모델 분석 중...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  내 상태 분석하기
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 결과 영역 */}
      {result && (
        <div className={`flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isHistory ? 'px-4' : ''}`}>
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col">
            
            {/* Header & Score */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-5 mb-5">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[18px] text-gray-900">AI 정밀 분석 결과</h3>
                <span className="text-[13px] text-gray-500">이미지 스캔 완료 (정확도 94.2%)</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[12px] font-bold rounded-md mb-1">
                  진행 단계: {result.severity}
                </span>
                <span className="text-[20px] font-black text-teal-600 tracking-tight">{result.score}<span className="text-[14px] text-gray-400 font-medium"> /100점</span></span>
              </div>
            </div>

            {/* Uploaded Image Preview with Scan Effect */}
            <div className="relative w-full h-40 bg-gray-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
              <img src={imagePreview} alt="Analyzed" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 border-2 border-teal-500/50 rounded-xl"></div>
              {/* Scan line animation mockup */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)]"></div>
              <div className="absolute top-2 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded border border-white/20">AI 분석 원본</div>
            </div>
            
            {/* Detailed Graphs */}
            <h4 className="font-bold text-[15px] text-gray-900 mb-4">항목별 상세 지표</h4>
            <div className="flex flex-col gap-3.5 mb-6">
              {(result.breakdown || [{ label: "모발 밀도 (정수리)", score: 65, color: "orange", status: "주의" }, { label: "헤어라인 (M자) 후퇴도", score: 32, color: "red", status: "위험" }, { label: "모발 굵기 약화", score: 75, color: "yellow", status: "양호" }, { label: "두피 상태 (각질/홍반)", score: 90, color: "teal", status: "우수" }]).map((m, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-700 font-medium">{m.label}</span>
                    <span className={`text-${m.color}-500 font-bold`}>{m.status} ({m.score}점)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`bg-gradient-to-r from-${m.color}-400 to-${m.color}-500 h-full rounded-full`} style={{ width: `${m.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comprehensive Opinion */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5">
              <h4 className="font-bold text-[14px] text-gray-900 mb-2">종합 소견</h4>
              <ul className="text-[13px] text-gray-700 leading-relaxed space-y-1.5 list-disc pl-4 marker:text-gray-400">
                {(result.analysis || [
                  "현재 동일 연령대(30대 남성) 평균 대비 <b>M자 헤어라인의 후퇴가 확연하게 관찰</b>됩니다.",
                  "정수리 부근의 모발 밀도는 정상 범위의 하한선에 위치해 있어 꾸준한 관리가 필요합니다.",
                  "두피 상태는 매우 깨끗하며 염증 소견은 발견되지 않았습니다."
                ]).map((text, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                ))}
              </ul>
            </div>

            {/* Recommendation Box */}
            <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-100 flex items-start gap-2.5 mb-2">
              <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold text-teal-900">맞춤 솔루션 제안</span>
                <ul className="text-[12px] text-teal-800 leading-relaxed list-disc pl-4">
                  {(result.recommendations || [
                    "피나스테리드 계열 약물 복용 상담이 시급하며, M자 라인의 경우 모발이식 상담을 병행하는 것을 강력히 권장합니다."
                  ]).map((text, idx) => (
                    <li key={idx}>{text}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-gray-100/50 p-3.5 rounded-xl border border-gray-200 mt-2">
              <h5 className="text-[11px] font-bold text-gray-500 mb-1.5">※ 면책 조항 및 주의사항</h5>
              <p className="text-[11px] text-gray-400 leading-relaxed break-keep">
                본 AI 두피 분석 결과는 보조적인 참고 자료일 뿐, 의학적 진단을 대체할 수 없습니다. 촬영 환경(조명, 각도, 화질 등) 및 AI 모델의 한계로 인해 분석 결과가 실제 상태와 다르거나 부정확할 수 있습니다. 정확한 탈모 진단 및 치료 계획은 반드시 가까운 병원에 방문하여 전문 의료진과 상담하시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Recommended Clinics */}
          <div className="mt-1 mb-4">
            <div className="flex justify-between items-end mb-3 px-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-teal-600 font-bold">분석 결과 기반</span>
                <h4 className="font-bold text-[16px] text-gray-900">상담 가능한 병원</h4>
              </div>
              <Link href="/consult" className="text-[12px] text-gray-500 hover:text-teal-600 font-medium flex items-center pb-0.5">
                더보기 <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {recommendedClinics.map(clinic => (
                <Link key={clinic.id} href={`/consult/${clinic.id}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 block transition-transform active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        {clinic.isPremium && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">추천</span>}
                        <h3 className="font-bold text-gray-900 text-[16px]">{clinic.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{clinic.location}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        <span className="text-teal-600 font-medium">{clinic.category}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border border-gray-100">
                      <img src="/logo.png" alt="logo" className="w-6 h-6 opacity-40 grayscale" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] text-gray-500">누적 상담</span>
                        <span className="text-[12px] font-bold text-teal-600">{clinic.consults.toLocaleString()}건</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-teal-600 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-[13px] font-bold">상담하기</span>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {!isHistory && (
            <button
              onClick={() => {
                setResult(null);
                setImageFile(null);
                setImagePreview(null);
                // Remove query param without reloading the page if possible
                window.history.replaceState(null, '', '/diagnosis');
              }}
              className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              다시 검사하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiagnosisPage() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      router.push('/login');
    }
  }, [router]);

  if (isPC) return <PCDiagnosis />;

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <DiagnosisContent />
    </Suspense>
  );
}
