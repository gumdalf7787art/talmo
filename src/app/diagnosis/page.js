"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, Upload, AlertCircle, RefreshCcw, MapPin, MessageCircle, ChevronRight, ChevronLeft, CheckSquare, Square, X, Scissors, Pill, Home, Heart, Download } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCDiagnosis from "@/components/pc/PCDiagnosis";
import RadarChart from "@/components/RadarChart";
import { compressImage, dataURLtoFile } from "@/lib/imageUtils";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/cropUtils";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

function DiagnosisContent() {
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
      } else if (isHistory) {
        // Fallback for missing id
        setResult({
          score: 65,
          severity: "진행: 초기",
        });
        setImagePreview("https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&h=500&fit=crop");
      }
    };
    fetchHistoryDetail();
  }, [searchParams, isHistory]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-report-area");
    if (!element) return;
    
    try {
      // Use toJpeg instead of toPng and lower pixel ratio to prevent Mobile OOM crashes
      const imgData = await toJpeg(element, { 
        quality: 0.8, 
        pixelRatio: 1.5, 
        backgroundColor: "#ffffff"
      });
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
      
      // Try Web Share API (mobile/modern browsers)
      if (navigator.share && navigator.canShare) {
        try {
          const blob = pdf.output('blob');
          const file = new File([blob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: '탈모톡 AI 분석 리포트',
              text: '탈모톡에서 분석한 나의 두피/탈모 진단 리포트입니다.',
              files: [file]
            });
            return; // If shared successfully, don't download it automatically
          }
        } catch (e) {
          console.log("Share failed or unsupported", e);
        }
      }
      
      // Fallback: Check if in-app browser (Kakao, Line, Instagram) before calling pdf.save()
      const userAgent = navigator.userAgent.toLowerCase();
      const isInApp = /kakao|line|instagram|inapp|naver|snapchat|webview/.test(userAgent);
      
      if (isInApp) {
        alert("현재 접속하신 브라우저(앱 내장 브라우저)에서는 파일 다운로드가 지원되지 않을 수 있습니다. 우측 상단 메뉴에서 '다른 브라우저로 열기(Safari/Chrome)'를 선택해 주세요.");
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      alert("PDF 처리 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1600, 0.9);
        setImagePreview(compressedBase64);
      } catch (err) {
        setImagePreview(URL.createObjectURL(file));
      }
      setIsCropping(true);
      setResult(null); // 새로운 사진 올리면 결과 초기화
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
    if (!imageFile || !isProfileComplete || !consentAll) return;

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
    try {
      const optimizedBase64 = await compressImage(imageFile, 1200, 0.8);
      const file = dataURLtoFile(optimizedBase64, "optimized.jpg");
      formData.append("image", file);
    } catch (err) {
      console.warn("Image optimization failed, sending original...", err);
      formData.append("image", imageFile);
    }
    
    if (user && user.id) {
      formData.append("userId", user.id);
    }
    
    formData.append("scanType", scanType);

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
    <div className={`flex flex-col relative ${isHistory ? 'gap-4 p-0' : 'gap-6 p-4'}`}>
      
      {/* Crop Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-[14px]">
                <Scissors className="w-4 h-4 text-teal-600" />
                얼굴이 보이지 않게 크롭해주세요
              </h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full h-[50vh] bg-black">
              <Cropper
                image={imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
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
              <button onClick={handleCropDone} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors text-[14px]">
                이대로 자르고 업로드하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {termsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-[15px]">
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
              <button onClick={() => setTermsModal(null)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors text-[14px]">
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-[15px]">
                <RefreshCcw className="w-5 h-5 text-teal-600 animate-spin" /> 
                AI 두피 분석 중
              </h3>
              <button onClick={() => alert("분석 중에는 창을 닫을 수 없습니다. 조금만 기다려주세요!")} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 flex flex-col items-center text-center gap-3">
              <p className="text-gray-800 font-bold text-[16px] leading-snug">
                지금 분석중입니다.<br />
                창을 닫지 말고 기다리세요.
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-teal-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[12px] text-gray-500 mb-2">초개인화 모델 스캔을 진행하고 있습니다...</p>
              
              {/* Ad Banner */}
              <a href="https://store.talmotalk.com" target="_blank" rel="noopener noreferrer" className="block w-full mt-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative group active:scale-[0.98] transition-transform">
                <img src="/talmotalk_ad.png" alt="탈모톡 스토어 광고" className="w-full h-[100px] object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-[12px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                    맞춤형 케어 제품 구경하기 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

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
          <h2 className="text-xl font-bold text-gray-900">AI 정밀 두피 분석</h2>
          <p className="text-[12px] text-red-500 font-bold mb-1 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0"/> ※ 개인정보 보호를 위해 얼굴이 나오지 않도록, 이마와 두피 부위만 보이게 지정해 주세요.</p>
          <p className="text-[13px] text-gray-500">
            이마 라인이나 정수리가 잘 보이도록 사진을 1장 선택해 주세요.
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
          <div className="flex gap-2 w-full">
             <button onClick={() => setScanType('이마/헤어라인')} className={`flex-1 py-3 text-[13px] font-bold rounded-xl border-2 transition-all ${scanType === '이마/헤어라인' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>이마/헤어라인</button>
             <button onClick={() => setScanType('정수리/가르마')} className={`flex-1 py-3 text-[13px] font-bold rounded-xl border-2 transition-all ${scanType === '정수리/가르마' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>정수리/가르마</button>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors mt-2"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400 gap-2">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Camera className="w-8 h-8 text-teal-500" />
                </div>
                <span className="font-medium">사진 업로드</span>
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

          <div className="flex flex-col gap-2 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm mt-1">
            <div 
              onClick={() => { const val = !consentAll; setConsent1(val); setConsent2(val); }} 
              className="flex items-center gap-2 cursor-pointer border-b border-gray-100 pb-2.5 mb-1"
            >
              <div className="text-teal-600">
                {consentAll ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
              </div>
              <span className="text-[13px] font-bold text-gray-800">전체 동의하기</span>
            </div>
            
            <div className="flex items-start gap-1.5 group mt-1.5">
              <div onClick={() => setConsent1(!consent1)} className="mt-0.5 text-teal-600 shrink-0 cursor-pointer">
                {consent1 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <span onClick={() => setConsent1(!consent1)} className="text-[11px] text-gray-600 leading-snug cursor-pointer flex-1">
                (필수) 서비스 향상 및 AI 학습을 위한 데이터 수집 동의
              </span>
              <button onClick={() => setTermsModal('service')} className="text-[11px] font-bold text-gray-400 hover:text-teal-600 underline underline-offset-2 shrink-0 px-1 py-0.5">[보기]</button>
            </div>

            <div className="flex items-start gap-1.5 group mt-1.5">
              <div onClick={() => setConsent2(!consent2)} className="mt-0.5 text-teal-600 shrink-0 cursor-pointer">
                {consent2 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <span onClick={() => setConsent2(!consent2)} className="text-[11px] text-gray-600 leading-snug cursor-pointer flex-1">
                (필수) 본 리포트는 의학적 진단을 대체할 수 없음에 동의
              </span>
              <button onClick={() => setTermsModal('medical')} className="text-[11px] font-bold text-gray-400 hover:text-teal-600 underline underline-offset-2 shrink-0 px-1 py-0.5">[보기]</button>
            </div>
          </div>

          {/* 분석 버튼 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAnalyze}
              disabled={!imageFile || isAnalyzing || !isProfileComplete || !consentAll}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                !imageFile || !isProfileComplete || !consentAll
                  ? "bg-gray-300 cursor-not-allowed" 
                  : "bg-teal-600 hover:bg-teal-700 hover:-translate-y-1 hover:shadow-lg shadow-md"
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
                  AI 분석 실행
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 결과 영역 */}
      {result && (
        <div className={`flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isHistory ? 'px-4' : ''}`}>
          
          <div className="w-full flex justify-end">
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-[13px] shadow-sm hover:bg-slate-900 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" /> 리포트 PDF 저장/공유
            </button>
          </div>

          <div id="pdf-report-area" className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col">
            
            {/* Header & Score */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-5 mb-5">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[18px] text-gray-900">탈모톡 AI 리포트</h3>
                <span className="text-[12px] text-gray-500">TalmoTalk AI Assessment</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[12px] font-bold rounded-md mb-1">
                  진행 단계: {result.summary?.severity || result.severity || "진단중"}
                </span>
                <span className="text-[20px] font-black text-teal-600 tracking-tight">{result.summary?.score || result.score || 0}<span className="text-[14px] text-gray-400 font-medium"> /100점</span></span>
              </div>
            </div>

            {/* Uploaded Image Preview with Scan Effect */}
            <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
              <img 
                src={imagePreview} 
                alt="Analyzed" 
                crossOrigin={imagePreview && imagePreview.startsWith('http') ? "anonymous" : undefined} 
                className="w-full h-full object-cover opacity-60" 
              />
              <div className="absolute inset-0 border-2 border-teal-500/50 rounded-xl"></div>
              {/* Scan line animation mockup */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-teal-400 shadow-[0_0_8px_2px_rgba(45,212,191,0.5)]"></div>
              <div className="absolute top-2 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded border border-white/20">AI 분석 원본</div>
            </div>
            
            {/* Detailed Graphs */}
            <h4 className="font-bold text-[15px] text-gray-900 mb-4">항목별 상세 지표</h4>
            <div className="flex flex-col gap-3.5 mb-6">
              {(result.breakdown || [{ label: "모발 밀도 (정수리)", score: 65, avgScore: 68, color: "orange", status: "주의" }, { label: "헤어라인 (M자) 후퇴도", score: 32, avgScore: 72, color: "red", status: "위험" }, { label: "모발 굵기 약화", score: 75, avgScore: 75, color: "yellow", status: "양호" }, { label: "두피 상태 (각질/홍반)", score: 90, avgScore: 80, color: "teal", status: "우수" }]).map((m, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">{m.label}</span>
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 rounded">평균 {m.avgScore || 70}점</span>
                    </div>
                    <span className={`text-${m.color}-500 font-bold`}>{m.status} ({m.score}점)</span>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`bg-gradient-to-r from-${m.color}-400 to-${m.color}-500 h-full rounded-full relative z-0`} style={{ width: `${isNaN(parseFloat(m.score)) ? 0 : parseFloat(m.score)}%` }}></div>
                    <div className="absolute top-0 bottom-0 w-[2px] bg-gray-400 z-10 opacity-70" style={{ left: `${isNaN(parseFloat(m.avgScore)) ? 70 : parseFloat(m.avgScore)}%` }} title={`연령대 평균: ${m.avgScore || 70}점`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart Section */}
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
              <h5 className="font-bold text-[14px] text-gray-800 mb-4">항목별 종합 밸런스</h5>
              <RadarChart breakdown={result.breakdown} />
            </div>

            {/* Comprehensive Opinion */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-5">
              <div className="bg-gray-100 p-3 border-b border-gray-200">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5"><Activity className="w-4 h-4 text-gray-600" /> 탈모톡 소견</h3>
              </div>
              <div className="p-4 text-[13px] text-gray-700 leading-relaxed space-y-4">
                {result?.medicalAnalysis?.finding && (
                  <div>
                    <strong className="text-gray-900 block mb-1">특징 분석:</strong>
                    <p dangerouslySetInnerHTML={{ __html: result.medicalAnalysis.finding }} />
                  </div>
                )}
                {result?.medicalAnalysis?.cause && (
                  <div>
                    <strong className="text-gray-900 block mb-1">추정 요인:</strong>
                    <p dangerouslySetInnerHTML={{ __html: result.medicalAnalysis.cause }} />
                  </div>
                )}
                
                {/* Fallback for old history format */}
                {(!result?.medicalAnalysis && result?.analysis) && (
                  <div>
                    <strong className="text-gray-900 block mb-1">종합 분석:</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      {result.analysis.map((text, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="border border-teal-200 rounded-xl overflow-hidden mb-2 shadow-sm">
              <div className="bg-teal-700 p-3 border-b border-teal-800">
                <h3 className="text-[14px] font-bold text-white flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-teal-200" /> 맞춤 관리 가이드</h3>
              </div>
              <div className="p-4 space-y-4 bg-teal-50/30">
                
                {result?.treatmentPlan?.medical?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-[13px] font-bold text-teal-800 mb-1.5"><Pill className="w-3.5 h-3.5" /> 권고사항</h4>
                    <ul className="list-disc pl-4 text-[12px] text-teal-900 space-y-1 marker:text-teal-500 leading-snug">
                      {result.treatmentPlan.medical.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                    </ul>
                  </div>
                )}

                {result?.treatmentPlan?.homeCare?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-[13px] font-bold text-blue-700 mb-1.5"><Home className="w-3.5 h-3.5" /> 자가 관리</h4>
                    <ul className="list-disc pl-4 text-[12px] text-blue-900 space-y-1 marker:text-blue-500 leading-snug">
                      {result.treatmentPlan.homeCare.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                    </ul>
                  </div>
                )}

                {result?.treatmentPlan?.lifestyle?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-[13px] font-bold text-orange-700 mb-1.5"><Heart className="w-3.5 h-3.5" /> 생활 습관</h4>
                    <ul className="list-disc pl-4 text-[12px] text-orange-900 space-y-1 marker:text-orange-400 leading-snug">
                      {result.treatmentPlan.lifestyle.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                    </ul>
                  </div>
                )}

                {/* Fallback for old history format */}
                {(!result?.treatmentPlan && result?.recommendations) && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-[13px] font-bold text-teal-800 mb-1.5"><Pill className="w-3.5 h-3.5" /> 맞춤 솔루션</h4>
                    <ul className="list-disc pl-4 text-[12px] text-teal-900 space-y-1 marker:text-teal-500 leading-snug">
                      {result.recommendations.map((text, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-gray-100/50 p-3.5 rounded-xl border border-gray-200 mt-2">
              <h5 className="text-[11px] font-bold text-gray-500 mb-1.5">※ 면책 조항 및 주의사항</h5>
              <p className="text-[11px] text-gray-400 leading-relaxed break-keep">
                본 AI 리포트는 통계적 분석 결과로, 의학적 진단을 대체하는 진단서가 아닙니다. 정확한 진단 및 치료 계획은 반드시 병원을 방문하여 전문의의 상담을 받으시기 바랍니다. 탈모톡은 본 리포트에 따른 결과에 대해 법적 책임을 지지 않습니다.
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
                <Link key={clinic.id} href={`/consult/detail?id=${clinic.id}`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 block transition-transform active:scale-[0.98]">
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
                      <img src="/logo.jpg" alt="logo" className="w-6 h-6 opacity-40 grayscale" />
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
