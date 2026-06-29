"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, AlertCircle, RefreshCcw, MapPin, MessageCircle, ChevronRight, FileText, Calendar, User, Activity, Pill, Heart, Home, CheckSquare, Square } from "lucide-react";
import RadarChart from "../RadarChart";
import { compressImage } from "@/lib/imageUtils";

function PCDiagnosisContent() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);
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
    const fetchHistoryDetail = async () => {
      const id = searchParams.get("id");
      if (isHistory && id) {
        try {
          const res = await fetch(`/api/diagnosis-detail?id=${id}`);
          if (res.ok) {
            const data = await res.json();
            const details = JSON.parse(data.details);
            setResult(details);
            setImagePreview(data.image_url && data.image_url !== 'placeholder_url' ? data.image_url : "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&h=500&fit=crop");
          }
        } catch (e) {
          console.error("Failed to fetch diagnosis detail", e);
        }
      }
    };
    fetchHistoryDetail();
  }, [searchParams, isHistory]);

  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); setResult(null); } };

  const handleAnalyze = async () => {
    if (!imageFile || !isProfileComplete || !consentAgreed) return;

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
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      // 백엔드 AI 고도화를 위한 환자 정보 추가 전달
      formData.append("gender", profile.gender);
      formData.append("birthYear", profile.birthYear);
      formData.append("familyHistory", profile.familyHistory);
      
      if (user && user.id) {
        formData.append("userId", user.id);
      }

      // 서버 용량 최적화를 위해 초소형 썸네일(Base64) 생성 후 함께 전송
      try {
        const thumbnailBase64 = await compressImage(imageFile, 150, 0.5); // 가로 150px, 품질 50%
        formData.append("thumbnail", thumbnailBase64);
      } catch (err) {
        console.warn("Thumbnail generation failed, skipping...", err);
      }

      const response = await fetch("/api/diagnosis", { method: "POST", body: formData });
      if (response.ok) { 
        const data = await response.json(); 
        setResult(data.diagnosis); 
      } else { 
        const errData = await response.json().catch(() => ({}));
        alert(`분석 중 오류가 발생했습니다: ${errData.error || response.statusText || '서버 에러'}`); 
        console.error("API Error Response:", errData);
      }
    } catch (error) { 
      alert(`서버와 통신할 수 없습니다: ${error.message}`); 
      console.error("Fetch Error:", error);
    }
    finally { setIsAnalyzing(false); }
  };

  // 구버전 방어코드 제거 - 항상 새로운 Medical Report 스키마를 따른다고 가정
  const report = result || {};

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      {!result && !isHistory ? (
        /* 입력 모드: 좌우 2분할 (기존 유지) */
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Info + Upload */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 정밀 두피 진단</h2>
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
                <h3 className="font-bold text-[16px] text-gray-900">환자 정보 (초개인화 분석용)</h3>
                {!isProfileComplete && <span className="text-[12px] text-red-500 font-medium ml-auto">필수 입력 항목입니다</span>}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">성별</span>
                  <div className="flex gap-2 flex-1">
                    {["남성", "여성"].map(g => (<button key={g} onClick={() => setProfile(prev => ({ ...prev, gender: g }))} className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${profile.gender === g ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{g}</button>))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">출생</span>
                  <select 
                    value={profile.birthYear}
                    onChange={(e) => setProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-slate-500 text-gray-900"
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
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-slate-500 text-gray-900"
                  >
                    <option value="" disabled>선택</option>
                    {["있음 (부계)", "있음 (모계)", "있음 (양가 모두)", "없음", "모름"].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5"><Camera className="w-4 h-4 text-teal-600"/> 정확도를 높이는 촬영 팁</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">👱‍♂️</div>
                    <span className="text-[12px] font-bold text-slate-800">M자 / 헤어라인</span>
                    <span className="text-[11px] text-slate-500 leading-tight">정면 45도에서<br/>이마 라인이 보이게</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">🙇‍♂️</div>
                    <span className="text-[12px] font-bold text-slate-800">정수리 / 가르마</span>
                    <span className="text-[11px] text-slate-500 leading-tight">고개를 숙여<br/>위에서 아래로</span>
                  </div>
                </div>
                <p className="text-[12px] text-slate-600 mt-3 bg-white p-2 rounded border border-slate-200 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>밝은 조명 아래에서 흔들림 없이 찍어야 <strong>모발 밀도와 두피 상태(홍반 등)</strong>를 AI가 가장 정확히 판독합니다.</span>
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-600"/> 임상 스캔 안내</h4>
                <ul className="text-[12px] text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>입력된 환자 정보(나이/성별/가족력)를 바탕으로 초개인화 분석을 진행합니다.</li>
                  <li>AI의 분석 결과는 참고용이며, 의학적 진단을 완전 대체할 수 없습니다.</li>
                </ul>
              </div>
            </div>
            
            <div 
              onClick={() => setConsentAgreed(!consentAgreed)}
              className="flex items-start gap-3 cursor-pointer p-1"
            >
              <div className="mt-0.5 text-teal-600">
                {consentAgreed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-400" />}
              </div>
              <span className="text-[13px] text-gray-600 leading-snug">
                (필수) 초개인화 진단을 위해 업로드한 <strong>두피 사진</strong>과 입력하신 <strong>환자 정보(나이, 성별, 가족력)</strong>를 AI 분석에 사용하는 것에 동의합니다.
              </span>
            </div>

            <button onClick={handleAnalyze} disabled={!imageFile || isAnalyzing || !isProfileComplete || !consentAgreed} className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 text-lg transition-colors ${!imageFile || !isProfileComplete || !consentAgreed ? "bg-gray-300 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900 shadow-md"}`}>
              {isAnalyzing ? (<><RefreshCcw className="w-5 h-5 animate-spin" /> 임상 리포트 생성 중...</>) : (<><FileText className="w-5 h-5" /> 전문 진단서 발급받기</>)}
            </button>
          </div>
        </div>
      ) : result ? (
        /* 결과 모드: 전문 리포트 UI (Medical Report Style) */
        <div className="flex flex-col items-center">
          {isHistory && (
            <div className="w-full mb-4">
              <button onClick={() => window.history.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-medium w-fit">← 목록으로</button>
            </div>
          )}
          
          <div className="w-full bg-white border border-gray-300 shadow-lg rounded-sm overflow-hidden text-slate-800">
            {/* 리포트 헤더 */}
            <div className="border-b-[3px] border-slate-800 p-8 flex justify-between items-end bg-slate-50">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">탈모톡 분석 결과지</h1>
                <p className="text-sm font-medium text-slate-500">TalmoTalk Precision AI Assessment Report</p>
              </div>
              <div className="text-right text-[13px] text-slate-600 space-y-1">
                <p className="flex items-center justify-end gap-2"><Calendar className="w-4 h-4" /> 발급일: {new Date().toLocaleDateString()}</p>
                <p className="flex items-center justify-end gap-2"><User className="w-4 h-4" /> 환자 정보: {report?.patientInfo?.age}세 / {report?.patientInfo?.gender} / 가족력 {report?.patientInfo?.familyHistory}</p>
              </div>
            </div>

            <div className="p-8">
              {/* 핵심 요약 대시보드 */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center">
                  <span className="text-[13px] font-bold text-slate-500 mb-1">두피 종합 점수</span>
                  <div className="text-4xl font-black text-slate-900">{report?.summary?.score}<span className="text-lg text-slate-400 font-medium">/100</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center">
                  <span className="text-[13px] font-bold text-slate-500 mb-1">추정 두피 나이</span>
                  <div className="text-4xl font-black text-teal-600">{report?.summary?.scalpAge}<span className="text-lg text-teal-600/60 font-medium">세</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center">
                  <span className="text-[13px] font-bold text-slate-500 mb-1">진행 단계 (Norwood/Ludwig)</span>
                  <div className="text-2xl font-black text-red-600 mt-1">{report?.summary?.norwoodStage}</div>
                  
                  {/* 진행 심각도 시각화 스텝퍼 */}
                  <div className="flex items-center gap-1 mt-3 w-full max-w-[200px]">
                    {['양호', '진행: 초기', '진행: 중기', '진행: 심각'].map((stage, idx) => {
                      const isActive = report?.summary?.severity === stage;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-red-500' : 'bg-slate-200'}`} />
                          <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold text-red-600' : 'text-slate-400 font-medium'}`}>
                            {stage.replace('진행: ', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* 좌측: 임상 지표 및 레이더 차트 */}
                <div className="col-span-5 flex flex-col gap-6">
                  <div className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-[15px] font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Activity className="w-5 h-5 text-slate-600" /> 임상 지표 분석 (Clinical Metrics)</h3>
                    <div className="flex justify-center mb-4">
                      {report?.breakdown && <RadarChart breakdown={report.breakdown} />}
                    </div>
                    <div className="space-y-4">
                      {report?.breakdown?.map((m) => (
                        <div key={m.label} className="bg-slate-50 rounded p-3 text-[13px]">
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-slate-800">{m.label}</span>
                            <span className={`text-${m.color || 'slate'}-600`}>{m.score}점</span>
                          </div>
                          {m.clinicalNote && <p className="text-slate-500 leading-snug" dangerouslySetInnerHTML={{ __html: m.clinicalNote }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Analyzed" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded font-medium">스캔 원본 이미지</div>
                  </div>
                </div>

                {/* 우측: 전문의 소견 및 처방 가이드라인 */}
                <div className="col-span-7 flex flex-col gap-6">
                  {/* 탈모톡 소견 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200">
                      <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> 탈모톡 소견</h3>
                    </div>
                    <div className="p-5 text-[14px] text-slate-700 leading-relaxed space-y-4">
                      {report?.medicalAnalysis?.finding && (
                        <div>
                          <strong className="text-slate-900 block mb-1">관찰 소견 (Finding):</strong>
                          <p dangerouslySetInnerHTML={{ __html: report.medicalAnalysis.finding }} />
                        </div>
                      )}
                      {report?.medicalAnalysis?.cause && (
                        <div>
                          <strong className="text-slate-900 block mb-1">원인 분석 (Cause):</strong>
                          <p dangerouslySetInnerHTML={{ __html: report.medicalAnalysis.cause }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 맞춤 솔루션 (가이드라인) */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 p-3 border-b border-slate-900">
                      <h3 className="text-[15px] font-bold text-white flex items-center gap-2"><AlertCircle className="w-4 h-4 text-slate-300" /> 맞춤 관리 가이드 (Management Plan)</h3>
                    </div>
                    <div className="p-5 space-y-5">
                      
                      {report?.treatmentPlan?.medical?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-teal-700 mb-2"><Pill className="w-4 h-4" /> 권고사항</h4>
                          <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-teal-500">
                            {report.treatmentPlan.medical.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                          </ul>
                        </div>
                      )}

                      {report?.treatmentPlan?.homeCare?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-blue-700 mb-2"><Home className="w-4 h-4" /> 자가 관리 (Home Care)</h4>
                          <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-blue-500">
                            {report.treatmentPlan.homeCare.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                          </ul>
                        </div>
                      )}

                      {report?.treatmentPlan?.lifestyle?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-orange-600 mb-2"><Heart className="w-4 h-4" /> 생활 습관 (Lifestyle)</h4>
                          <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-orange-400">
                            {report.treatmentPlan.lifestyle.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  <div className="text-[11px] text-slate-400 text-center mt-2">
                    * AI의 분석 결과는 참고용이며, 의학적 진단을 대체하는것은 아닙니다.
                  </div>
                  
                  {!isHistory && (
                    <button onClick={() => { setResult(null); setImageFile(null); setImagePreview(null); window.history.replaceState(null, '', '/diagnosis'); }} className="w-full mt-4 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold hover:bg-slate-200 transition-colors">다시 진단하기</button>
                  )}
                </div>
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

