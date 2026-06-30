"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, AlertCircle, RefreshCcw, MapPin, MessageCircle, ChevronRight, FileText, Calendar, User, Activity, Pill, Heart, Home, CheckSquare, Square, X, Scissors, Download } from "lucide-react";
import RadarChart from "../RadarChart";
import { compressImage } from "@/lib/imageUtils";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/cropUtils";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

function PCDiagnosisContent() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [termsModal, setTermsModal] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const consentAll = consent1 && consent2;
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ gender: "", birthYear: "", familyHistory: "" });
  const [scanType, setScanType] = useState("이마/헤어라인");

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

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-report-area");
    if (!element) return;
    
    try {
      const imgData = await toJpeg(element, { 
        quality: 0.9, 
        pixelRatio: 2, 
        backgroundColor: "#ffffff"
      });
      
      // Calculate height dynamically. Since we don't have canvas.width, 
      // we can load the image into an Image object to get its dimensions.
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => img.onload = resolve);
      
      const pdfWidth = 210; // Base width in mm (A4 width)
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      const fileName = `탈모톡_AI_리포트_${new Date().toISOString().slice(0,10)}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      alert("PDF 처리 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"));
    }
  };

  const handleImageChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      setImagePreview(URL.createObjectURL(file)); 
      setIsCropping(true); 
      setResult(null); 
      e.target.value = null;
    } 
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropDone = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imagePreview, croppedAreaPixels);
      setImagePreview(croppedImageBase64);
      const res = await fetch(croppedImageBase64);
      const blob = await res.blob();
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      setImageFile(file);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      alert("크롭 처리 중 오류가 발생했습니다.");
      setIsCropping(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !isProfileComplete || !consentAll) return;

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
      // 백엔드 AI 고도화를 위한 환자 정보 추가 전달
      formData.append("gender", profile.gender);
      formData.append("birthYear", profile.birthYear);
      formData.append("familyHistory", profile.familyHistory);
      formData.append("scanType", scanType);
      
      if (user && user.id) {
        formData.append("userId", user.id);
      }

      // 프론트엔드에서 2048px로 이미지 최적화 (유저 요청: 최적의 타협점 해상도 유지)
      try {
        const optimizedBase64 = await compressImage(imageFile, 1200, 0.8); 
        const res = await fetch(optimizedBase64);
        const blob = await res.blob();
        formData.append("image", blob, "optimized.jpg");
      } catch (err) {
        console.warn("Image optimization failed, sending original...", err);
        formData.append("image", imageFile);
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
    <div className="max-w-[1000px] mx-auto pb-10 relative">
      {/* Crop Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg w-full max-w-[600px] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-teal-600" />
                얼굴이 보이지 않게 크롭해주세요
              </h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative w-full h-[60vh] bg-black">
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
            <div className="p-4 bg-white flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">확대/축소</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-teal-600"
                />
              </div>
              <button onClick={handleCropDone} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors">
                이대로 자르고 업로드하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {termsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg w-full max-w-[400px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                {termsModal === 'service' ? '개인정보 수집 및 이용 동의' : '면책 조항 동의'}
              </h3>
              <button onClick={() => setTermsModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-[13px] text-gray-600 max-h-[60vh] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {termsModal === 'service' 
                ? "서비스 품질 향상 및 AI 초개인화 학습을 위해 회원님의 사진 및 입력하신 건강/신체 정보(나이, 성별, 가족력)를 수집합니다.\n\n수집된 데이터는 AI 모델 학습 및 서비스 개선 목적 외에는 사용되지 않으며, 얼굴 등 개인을 식별할 수 있는 민감 정보는 업로드 전 직접 제외(크롭)해 주셔야 합니다."
                : "탈모톡의 AI 분석 결과는 통계적 데이터와 이미지 분석에 기반한 '참고용 리포트'입니다.\n\n이는 의학적 진단이나 의료 행위를 대체할 수 없으며, 질병의 진단 및 치료를 위해서는 반드시 피부과 등 전문 의료기관을 방문하여 전문의의 상담을 받으셔야 합니다.\n\n본 리포트에 따른 행동 결과에 대해 탈모톡은 법적 책임을 지지 않습니다."
              }
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setTermsModal(null)} className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors">
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg w-full max-w-[480px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-teal-600 animate-spin" /> 
                AI 두피 분석 중
              </h3>
              <button onClick={() => alert("분석 중에는 창을 닫을 수 없습니다. 조금만 기다려주세요!")} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <p className="text-gray-800 font-bold text-[18px]">
                지금 분석중입니다.<br />
                창을 닫지 말고 기다리세요.
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-teal-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mb-2">초개인화 모델 스캔을 진행하고 있습니다...</p>
              
              {/* Ad Banner */}
              <a href="https://store.talmotalk.com" target="_blank" rel="noopener noreferrer" className="block w-full mt-2 rounded-md overflow-hidden border border-gray-200 hover:shadow-md transition-shadow relative group">
                <img src="/talmotalk_ad.png" alt="탈모톡 스토어 광고" className="w-full h-[120px] object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-[13px] font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1 transition-transform group-hover:scale-105">
                    맞춤형 케어 제품 구경하기 <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {!result && !isHistory ? (
        /* 입력 모드: 좌우 2분할 (기존 유지) */
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Info + Upload */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 정밀 두피 분석</h2>
              <p className="text-sm text-red-500 font-bold mb-1 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> ※ 개인정보 보호를 위해 얼굴이 나오지 않도록, 이마와 두피 부위만 보이게 지정해 주세요.</p>
              <p className="text-sm text-gray-500 mb-4">분석할 부위를 선택한 후, 선명하게 잘 보이는 사진을 1장 선택해 주세요.</p>
              
              {/* Scan Type Selector */}
              <div className="flex gap-3 w-full">
                 <button onClick={() => setScanType('이마/헤어라인')} className={`flex-1 py-3 text-sm font-bold rounded-lg border-2 transition-all ${scanType === '이마/헤어라인' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>이마/헤어라인</button>
                 <button onClick={() => setScanType('정수리/가르마')} className={`flex-1 py-3 text-sm font-bold rounded-lg border-2 transition-all ${scanType === '정수리/가르마' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>정수리/가르마</button>
              </div>
            </div>
            
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg aspect-[4/3] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors">
              {imagePreview ? (<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />) : (
                <div className="flex flex-col items-center text-gray-400 gap-3">
                  <div className="p-4 bg-white rounded-full shadow-sm"><Camera className="w-10 h-10 text-teal-500" /></div>
                  <span className="font-medium text-lg">사진 업로드</span>
                  <span className="text-sm text-gray-400">클릭하여 파일을 선택하세요</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5"><Camera className="w-4 h-4 text-teal-600"/> 정확도를 높이는 촬영 팁</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                      <img src="/hairline_guide.png" alt="M자 헤어라인 가이드" className="w-full h-full object-cover scale-110" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">M자 / 헤어라인</span>
                    <span className="text-[11px] text-slate-500 leading-tight">정면 45도에서<br/>이마 라인이 보이게</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                      <img src="/crown_guide.png" alt="정수리 가이드" className="w-full h-full object-cover scale-110" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">정수리 / 가르마</span>
                    <span className="text-[11px] text-slate-500 leading-tight">고개를 숙여<br/>위에서 아래로</span>
                  </div>
                </div>
                <div className="text-[12px] text-slate-600 mt-3 bg-white p-3 rounded border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>밝은 조명 아래에서 흔들림 없이 찍어야 <strong>모발 밀도와 두피 상태(홍반 등)</strong>를 AI가 가장 정확히 판독합니다.</span>
                  </div>
                  <div className="flex items-start gap-1.5 ml-5 text-slate-500">
                    <span>• Ai 판독은 각도와 조명 그리고 촬영 이미지에 따라 다르게 나올 수 있습니다.</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-600"/> 임상 스캔 안내</h4>
                <ul className="text-[12px] text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>입력된 환자 정보(나이/성별/가족력)를 바탕으로 초개인화 분석을 진행합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Profile + Analyze */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-gray-900">환자 정보</h3>
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
            
            <div className="flex flex-col gap-2 bg-white p-4 rounded-md border border-slate-200 shadow-sm mt-1">
              <div 
                onClick={() => { const val = !consentAll; setConsent1(val); setConsent2(val); }} 
                className="flex items-center gap-2 cursor-pointer border-b border-slate-100 pb-3 mb-1"
              >
                <div className="text-teal-600">
                  {consentAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-400" />}
                </div>
                <span className="text-[14px] font-bold text-slate-800">전체 동의하기</span>
              </div>
              
              <div className="flex items-start gap-2 pl-1 group">
                <div onClick={() => setConsent1(!consent1)} className="mt-0.5 text-teal-600 shrink-0 cursor-pointer">
                  {consent1 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span onClick={() => setConsent1(!consent1)} className="text-[12px] text-gray-600 leading-snug cursor-pointer flex-1">
                  (필수) 서비스 품질 향상 및 AI 학습을 위해, 데이터 수집에 동의합니다.
                </span>
                <button onClick={() => setTermsModal('service')} className="text-[11px] font-bold text-gray-400 hover:text-teal-600 underline underline-offset-2 shrink-0 px-1">[보기]</button>
              </div>

              <div className="flex items-start gap-2 pl-1 mt-1 group">
                <div onClick={() => setConsent2(!consent2)} className="mt-0.5 text-teal-600 shrink-0 cursor-pointer">
                  {consent2 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span onClick={() => setConsent2(!consent2)} className="text-[12px] text-gray-600 leading-snug cursor-pointer flex-1">
                  (필수) AI의 분석 결과는 참고용이며, 의학적 진단을 대체할 수 없습니다.
                </span>
                <button onClick={() => setTermsModal('medical')} className="text-[11px] font-bold text-gray-400 hover:text-teal-600 underline underline-offset-2 shrink-0 px-1">[보기]</button>
              </div>
            </div>

            <button 
              onClick={handleAnalyze} 
              disabled={!imageFile || isAnalyzing || !isProfileComplete || !consentAll} 
              className={`w-full py-4 rounded-md font-bold text-white flex items-center justify-center gap-2 text-lg transition-all duration-300 mt-2 
              ${!imageFile || !isProfileComplete || !consentAll 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-slate-800 hover:bg-slate-900 hover:-translate-y-1 hover:shadow-lg shadow-md"
              }`}
            >
              {isAnalyzing ? (<><RefreshCcw className="w-5 h-5 animate-spin" /> 임상 리포트 생성 중...</>) : (<><FileText className="w-5 h-5" /> AI 분석 실행</>)}
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
          
          <div className="w-full flex justify-end mb-3">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold text-[14px] shadow-sm hover:bg-slate-900 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" /> 리포트 PDF 저장/공유
            </button>
          </div>

          <div id="pdf-report-area" className="w-full bg-white border border-gray-300 shadow-lg rounded-sm overflow-hidden text-slate-800">
            {/* 리포트 헤더 */}
            <div className="border-b-[3px] border-slate-800 p-8 flex justify-between items-end bg-slate-50">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">탈모톡 AI 리포트</h1>
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
                  
                  <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Analyzed" crossOrigin="anonymous" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
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
                          <strong className="text-slate-900 block mb-1">특징 분석:</strong>
                          <p dangerouslySetInnerHTML={{ __html: report.medicalAnalysis.finding }} />
                        </div>
                      )}
                      {report?.medicalAnalysis?.cause && (
                        <div>
                          <strong className="text-slate-900 block mb-1">추정 요인:</strong>
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
                    * 본 AI 리포트는 통계적 데이터 분석 결과이며, 의학적 진단을 대체하는 진단서가 아닙니다.
                  </div>
                  

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

