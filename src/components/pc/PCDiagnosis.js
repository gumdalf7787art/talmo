"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, AlertCircle, RefreshCcw, MapPin, MessageCircle, ChevronRight } from "lucide-react";

function PCDiagnosisContent() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ gender: "", birthYear: "", familyHistory: "" });

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

  const isProfileComplete = profile.gender !== "" && profile.birthYear.length === 4 && profile.familyHistory !== "";
  const searchParams = useSearchParams();
  const isHistory = searchParams.get("history") === "true";

  useEffect(() => {
    if (isHistory) {
      setResult({ score: 65, severity: "진행: 초기" });
      setImagePreview("https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&h=500&fit=crop");
    }
  }, [searchParams]);

  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); setResult(null); } };

  const handleAnalyze = async () => {
    if (!imageFile || !isProfileComplete) return;

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

    setIsAnalyzing(true); setResult(null);
    const formData = new FormData(); formData.append("image", imageFile);
    try {
      const response = await fetch("/api/diagnosis", { method: "POST", body: formData });
      if (response.ok) { const data = await response.json(); setResult(data.diagnosis); } else { alert("분석 중 오류가 발생했습니다."); }
    } catch (error) { alert("서버와 통신할 수 없습니다."); }
    finally { setIsAnalyzing(false); }
  };

  return (
    <div className="max-w-[900px] mx-auto">
      {!result && !isHistory ? (
        /* 입력 모드: 좌우 2분할 */
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Info + Upload */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 두피 분석</h2>
              <p className="text-sm text-gray-500">이마 라인이나 정수리가 잘 보이도록 사진을 찍어주세요.</p>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-80 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors">
              {imagePreview ? (<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />) : (
                <div className="flex flex-col items-center text-gray-400 gap-3">
                  <div className="p-4 bg-white rounded-full shadow-sm"><Camera className="w-10 h-10 text-teal-500" /></div>
                  <span className="font-medium text-lg">사진 촬영 또는 업로드</span>
                  <span className="text-sm text-gray-400">클릭하여 파일을 선택하세요</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>
          </div>

          {/* Right: Profile + Analyze */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-gray-900">정보 입력</h3>
                {!isProfileComplete && <span className="text-[12px] text-red-500 font-medium ml-auto">필수 입력 항목입니다</span>}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">성별</span>
                  <div className="flex gap-2 flex-1">
                    {["남성", "여성"].map(g => (<button key={g} onClick={() => setProfile(prev => ({ ...prev, gender: g }))} className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${profile.gender === g ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{g}</button>))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">출생</span>
                  <select 
                    value={profile.birthYear}
                    onChange={(e) => setProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="" disabled>선택</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">가족력</span>
                  <select 
                    value={profile.familyHistory}
                    onChange={(e) => setProfile(prev => ({ ...prev, familyHistory: e.target.value }))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="" disabled>선택</option>
                    {["있음 (부계)", "있음 (모계)", "있음 (양가 모두)", "없음", "모름"].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
              <h4 className="font-bold text-teal-900 text-sm mb-2">📋 분석 안내</h4>
              <ul className="text-[13px] text-teal-800 space-y-1.5 list-disc pl-4">
                <li>이마 라인이나 정수리가 잘 보이는 사진을 올려주세요</li>
                <li>밝은 조명 아래에서 촬영하면 정확도가 올라갑니다</li>
                <li>분석 결과는 참고용이며 의학적 진단을 대체하지 않습니다</li>
              </ul>
            </div>

            <button onClick={handleAnalyze} disabled={!imageFile || isAnalyzing || !isProfileComplete} className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-lg transition-colors ${!imageFile || !isProfileComplete ? "bg-gray-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 shadow-md"}`}>
              {isAnalyzing ? (<><RefreshCcw className="w-5 h-5 animate-spin" /> AI 모델 분석 중...</>) : (<><Upload className="w-5 h-5" /> 내 상태 분석하기</>)}
            </button>
          </div>
        </div>
      ) : result ? (
        /* 결과 모드 */
        <div className="flex flex-col gap-6">
          {isHistory && (
            <button onClick={() => window.history.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-medium w-fit">← 목록으로</button>
          )}
          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
              <div><h3 className="font-bold text-xl text-gray-900">AI 정밀 분석 결과</h3><span className="text-[14px] text-gray-500">이미지 스캔 완료 (정확도 94.2%)</span></div>
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[13px] font-bold rounded-lg mb-1">진행 단계: {result.severity}</span>
                <span className="text-2xl font-black text-teal-600">{result.score}<span className="text-[15px] text-gray-400 font-medium"> /100점</span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left: Image + Metrics */}
              <div>
                <div className="relative w-full h-48 bg-gray-900 rounded-xl overflow-hidden mb-6">
                  <img src={imagePreview} alt="Analyzed" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 border-2 border-teal-500/50 rounded-xl" />
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)]" />
                  <div className="absolute top-2 left-3 bg-black/50 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded border border-white/20">AI 분석 원본</div>
                </div>
                <h4 className="font-bold text-[15px] text-gray-900 mb-4">항목별 상세 지표</h4>
                <div className="flex flex-col gap-4">
                  {(result.breakdown || [{ label: "모발 밀도 (정수리)", score: 65, color: "orange", status: "주의" }, { label: "헤어라인 (M자) 후퇴도", score: 32, color: "red", status: "위험" }, { label: "모발 굵기 약화", score: 75, color: "yellow", status: "양호" }, { label: "두피 상태 (각질/홍반)", score: 90, color: "teal", status: "우수" }]).map((m) => (
                    <div key={m.label} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-700 font-medium">{m.label}</span>
                        <span className={`text-${m.color}-500 font-bold`}>{m.status} ({m.score}점)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`bg-gradient-to-r from-${m.color}-400 to-${m.color}-500 h-full rounded-full`} style={{ width: `${m.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Opinion + Recommendation */}
              <div className="flex flex-col gap-5">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-[15px] text-gray-900 mb-3">종합 소견</h4>
                  <ul className="text-[13px] text-gray-700 leading-relaxed space-y-2 list-disc pl-4 marker:text-gray-400">
                    {(result.analysis || [
                      "현재 동일 연령대(30대 남성) 평균 대비 <b>M자 헤어라인의 후퇴가 확연하게 관찰</b>됩니다.",
                      "정수리 부근의 모발 밀도는 정상 범위의 하한선에 위치해 있어 꾸준한 관리가 필요합니다.",
                      "두피 상태는 매우 깨끗하며 염증 소견은 발견되지 않았습니다."
                    ]).map((text, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                    ))}
                  </ul>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[14px] font-bold text-teal-900">맞춤 솔루션 제안</span>
                    <ul className="text-[13px] text-teal-800 leading-relaxed mt-1 list-disc pl-4">
                      {(result.recommendations || [
                        "피나스테리드 계열 약물 복용 상담이 시급하며, M자 라인의 경우 모발이식 상담을 병행하는 것을 강력히 권장합니다."
                      ]).map((text, idx) => (
                        <li key={idx}>{text}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-200">
                  <h5 className="text-[12px] font-bold text-gray-500 mb-1.5">※ 면책 조항</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed">본 AI 분석 결과는 참고 자료이며 의학적 진단을 대체할 수 없습니다. 정확한 진단은 전문 의료진과 상담하시기 바랍니다.</p>
                </div>
                {!isHistory && (
                  <button onClick={() => { setResult(null); setImageFile(null); setImagePreview(null); window.history.replaceState(null, '', '/diagnosis'); }} className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">다시 검사하기</button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PCDiagnosis() {
  return (<Suspense fallback={<div className="p-4">Loading...</div>}><PCDiagnosisContent /></Suspense>);
}
