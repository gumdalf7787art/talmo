"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, Upload, AlertCircle, RefreshCcw, MapPin, MessageCircle, ChevronRight, ChevronLeft, CheckSquare, Square, X, Scissors, Pill, Home, Heart, Download, Activity, Calendar, User, FileText, HelpCircle } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCDiagnosis from "@/components/pc/PCDiagnosis";
import RadarChart from "@/components/RadarChart";
import { compressImage, dataURLtoFile } from "@/lib/imageUtils";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/cropUtils";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { getAsiInfo, getAsiSeverityIndex } from "@/lib/asiUtils";

// renderStageText is replaced by ASI logic

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
  const [showAsiModal, setShowAsiModal] = useState(false);
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
            if (details) {
              details.created_at = data.created_at;
            }
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
      } else {
        // Not history mode, reset state
        setResult(null);
        setImagePreview(null);
        setImageFile(null);
      }
    };
    fetchHistoryDetail();
  }, [searchParams, isHistory]);

  const handleInvite = () => {
    let rawCode = '';
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        rawCode = u?.referral_code ? u.referral_code.trim() : '';
      }
    } catch (e) {
      console.error(e);
    }
    const inviteUrl = `https://talmotalk.com/signup?ref=${rawCode}`;
    const safeInviteUrl = encodeURI(inviteUrl);

    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init('f557c50a623379e0c2abb685232ade41');
      }
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '🎁 탈모톡에 가입하고 AI 분석 티켓을 받아보세요!',
          description: `초대장을 클릭하고 간편가입 하시면 AI 탈모분석 티켓 5장(기본2+보너스3)이 즉시 발급됩니다.\n추천인 코드: ${rawCode}`,
          imageUrl: 'https://talmotalk.com/invite_thumbnail.jpg?v=1',
          link: {
            mobileWebUrl: safeInviteUrl,
            webUrl: safeInviteUrl,
          },
        },
        buttons: [
          {
            title: '탈모톡 시작하기',
            link: {
              mobileWebUrl: safeInviteUrl,
              webUrl: safeInviteUrl,
            },
          },
        ],
      });
    } else {
      const text = `🎁 탈모톡에 가입하고 AI 분석 티켓 4장을 무료로 받아보세요!\n\n가입 링크: ${safeInviteUrl}\n추천인 코드: ${rawCode}`;
      if (navigator.share) {
        navigator.share({ title: '탈모톡 초대', text: text });
      } else {
        navigator.clipboard.writeText(text);
        alert("초대 링크와 코드가 복사되었습니다!");
      }
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-report-area");
    if (!element) return;
    
    try {
      // Use toJpeg instead of toPng and lower pixel ratio to prevent Mobile OOM crashes
      const imgData = await toJpeg(element, { 
        quality: 0.9, 
        pixelRatio: 2, 
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
        const compressedBase64 = await compressImage(file, 2048, 0.9);
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

    const payload = {
      userId: user?.id || null,
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
      // Fallback: convert original file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(imageFile);
      });
      payload.image = await base64Promise;
    }

    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const details = data.diagnosis;
        if (details) {
          details.created_at = data.created_at || new Date().toISOString();
        }
        setResult(details);
        window.scrollTo(0, 0);
        
        // update user's tickets in local storage silently by fetching me again
        if (user) {
          fetch(`/api/user/me?userId=${user.id}`).then(r => r.json()).then(d => {
            if (d.success && d.user) {
              localStorage.setItem('user', JSON.stringify(d.user));
              setUser(d.user);
            }
          }).catch(e => {});
        }
      } else {
        const errorData = await response.json().catch(() => null);
        if (response.status === 403 && errorData?.error) {
          alert(errorData.error);
        } else {
          alert("분석 중 오류가 발생했습니다.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("서버와 통신할 수 없습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const report = result || {};

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
                AI 탈모 분석 중
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
              
              {/* Message */}
              <div className="w-full mt-2 bg-teal-50 border border-teal-100 rounded-xl p-3 shadow-sm flex items-center justify-center">
                <span className="text-[13px] font-bold text-teal-800">
                  매주 평가해서 나의 탈모를 관리하세요.
                </span>
              </div>
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
          <h2 className="text-xl font-bold text-gray-900">AI 정밀 탈모 분석</h2>
          <p className="text-[12px] text-red-500 font-bold mb-1 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0"/> ※ 개인정보 보호를 위해 얼굴이 나오지 않도록, 이마와 두피 부위만 보이게 지정해 주세요.</p>
          <p className="text-[13px] text-gray-500">
            이마 라인이나 정수리가 잘 보이도록 사진을 1장 선택해 주세요.
          </p>
        </div>
      )}

      {!result && !isHistory && (
        <div className="flex flex-col gap-4">
          
          {/* 업로드 영역 */}
          <div className="flex gap-2 w-full mt-2">
             <button onClick={() => setScanType('이마/헤어라인')} className={`flex-1 py-3 text-[13px] font-bold rounded-xl border-2 transition-all ${scanType === '이마/헤어라인' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>이마/헤어라인</button>
             <button onClick={() => setScanType('정수리/가르마')} className={`flex-1 py-3 text-[13px] font-bold rounded-xl border-2 transition-all ${scanType === '정수리/가르마' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>정수리/가르마</button>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors"
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

          {/* 정확도를 높이는 촬영 팁 (모바일) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3.5">
            <div>
              <h4 className="font-bold text-slate-900 text-[13px] mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-600"/> 정확도를 높이는 촬영 팁
              </h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center text-center gap-1.5">
                  <div className="w-full aspect-[4/3] max-h-[80px] bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                    <img src="/tip_m_hairline.jpg" alt="M자 헤어라인 가이드" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">M자 / 헤어라인</span>
                  <span className="text-[10px] text-slate-500 leading-tight">정면에서<br/>라인이 잘 보이도록</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center text-center gap-1.5">
                  <div className="w-full aspect-[4/3] max-h-[80px] bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                    <img src="/tip_crown_part.jpg" alt="정수리 가이드" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">정수리 / 가르마</span>
                  <span className="text-[10px] text-slate-500 leading-tight">고개를 숙이고<br/>전체가 잘 보이도록</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 mt-2.5 bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col gap-1.5">
                <div className="flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>밝은 조명 아래에서 흔들림 없이 찍어야 <strong>모발 밀도와 두피 상태(홍반 등)</strong>를 AI가 가장 정확히 판독합니다.</span>
                </div>
                <div className="flex flex-col gap-1 pl-4.5 text-[10.5px] text-slate-500">
                  <span>• Ai 판독은 각도와 조명 그리고 촬영 이미지에 따라 다르게 나올 수 있습니다.</span>
                  <span>• 확대경으로 찍은 사진이 아니므로 참고용으로만 사용해주시기 바랍니다.</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Profile Requirement Box (Compact) */}
          <div className="bg-white border border-gray-200 p-3.5 rounded-xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[16px] text-gray-900 flex items-center gap-2">
                정보 입력 <span className="text-[16px] text-red-600 font-black tracking-wide">필수</span>
              </h3>
            </div>
            
            <div className="flex flex-col gap-4 mt-2">
              {/* Gender */}
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-gray-800 font-bold">성별 <span className="text-red-500">*</span></span>
                <div className="flex gap-2 w-full">
                  {["남성", "여성"].map(g => (
                    <button 
                      key={g} 
                      onClick={() => setProfile(prev => ({ ...prev, gender: g }))}
                      className={`flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all ${profile.gender === g ? 'bg-teal-600 text-white shadow-md border-transparent' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Year */}
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-gray-800 font-bold">출생 연도 <span className="text-red-500">*</span></span>
                <select 
                  value={profile.birthYear}
                  onChange={(e) => setProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 shadow-sm"
                >
                  <option value="" disabled>출생 연도를 선택해주세요</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>

              {/* Family History */}
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-gray-800 font-bold">유전적 가족력 <span className="text-red-500">*</span></span>
                <select 
                  value={profile.familyHistory}
                  onChange={(e) => setProfile(prev => ({ ...prev, familyHistory: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[15px] font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 shadow-sm"
                >
                  <option value="" disabled>가족력 여부를 선택해주세요</option>
                  {["있음 (부계)", "있음 (모계)", "있음 (양가 모두)", "없음", "모름"].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          {/* 분석 버튼 (약관 동의 통합) */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[14px] font-bold text-gray-700">남은 분석 티켓</span>
              <span className="text-[15px] font-black text-teal-600">
                {user ? (user.tickets_basic || 0) + (user.tickets_premium || 0) : 0}장
              </span>
            </div>
            
            <button
              onClick={() => {
                setConsent1(true);
                setConsent2(true);
                handleAnalyze();
              }}
              disabled={!imageFile || isAnalyzing || !isProfileComplete}
              className={`w-full py-4 rounded-2xl font-bold text-white flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                !imageFile || !isProfileComplete
                  ? "bg-gray-300 cursor-not-allowed" 
                  : "bg-teal-600 hover:bg-teal-700 hover:-translate-y-1 hover:shadow-xl shadow-md"
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  <span>AI 모델 분석 중...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[16px]">
                    <CheckSquare className="w-5 h-5" />
                    <span>약관 동의 및 AI 분석 시작</span>
                  </div>
                  <span className="text-[11px] text-teal-100 font-medium tracking-wide">수집 동의 및 면책 조항에 동의합니다 (1장 차감)</span>
                </>
              )}
            </button>
            <div className="text-center text-[12px] text-gray-400 mt-1 flex justify-center gap-3">
              <button onClick={() => setTermsModal('service')} className="hover:text-teal-600 underline underline-offset-2">데이터 수집 약관 보기</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setTermsModal('medical')} className="hover:text-teal-600 underline underline-offset-2">의학적 면책 조항 보기</button>
            </div>
            <button 
              onClick={handleInvite}
              className="w-full bg-[#FEE500] text-black font-bold py-3.5 rounded-xl text-[14px] shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-1"
            >
              🎁 친구 초대하고 분석권 받기
            </button>
            {user && (user.tickets_basic || 0) + (user.tickets_premium || 0) === 0 && (
              <p className="text-center text-xs text-red-500 font-bold mt-1">티켓이 부족합니다. 마이페이지에서 친구를 초대하고 티켓을 받아보세요!</p>
            )}
          </div>
        </div>
      )}

      {/* 결과 영역 */}
      {result && (
        <div className={`flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isHistory ? 'px-4' : ''}`}>
          
          <div className="w-full flex justify-end gap-2">
            <button 
              onClick={handleInvite}
              className="flex items-center gap-1.5 bg-[#FEE500] text-black px-3 py-2 rounded-lg font-bold text-[12px] shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
            >
              🎁 친구 초대하고 분석권 받기
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-[12px] shadow-sm hover:bg-slate-900 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" /> 리포트 PDF 저장/공유
            </button>
          </div>

          <div id="pdf-report-area" className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col">
            
            {/* Header & Patient Info */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[18px] text-gray-900">탈모톡 AI 리포트</h3>
                <span className="text-[12px] text-gray-500">TalmoTalk AI Assessment</span>
              </div>
              <div className="flex flex-col items-end text-right text-[11px] text-gray-400 leading-snug">
                <span>분석일: {result?.created_at ? new Date(result.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                <span>{result?.patientInfo?.gender || profile.gender === 'male' ? '남성' : '여성'} / {result?.patientInfo?.age || (profile.birthYear ? new Date().getFullYear() - parseInt(profile.birthYear) + 1 : "-")}세</span>
              </div>
            </div>

            {/* 핵심 요약 대시보드 박스 */}
            <div className="flex flex-col gap-2 mb-6">
              {/* 상단 2개 박스 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-center items-center text-center">
                  <span className="text-[11px] font-bold text-slate-500 mb-1">탈모 종합 점수</span>
                  <div className="text-[20px] font-black text-slate-900">{result.summary?.score || result.score || 0}<span className="text-[12px] text-slate-400 font-medium">/100</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-center items-center text-center">
                  <span className="text-[11px] font-bold text-slate-500 mb-1">추정 두피 나이</span>
                  <div className="text-[20px] font-black text-teal-600">{result.summary?.scalpAge || result.scalpAge || "-"}<span className="text-[12px] text-teal-600/60 font-medium">세</span></div>
                </div>
              </div>

              {/* 하단 1개 박스: 진행 단계 */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[11px] font-bold text-slate-500 mb-2">AI 정밀 분석 결과 (ASI)</span>
                {(() => {
                  const asi = getAsiInfo(result);
                  return (
                    <div className="flex flex-col items-center gap-1.5 mb-2 w-full">
                      <span className="text-[15px] font-bold text-gray-900">{asi.code} : {asi.title}</span>
                      <span className="text-[11px] text-gray-500 leading-tight whitespace-pre-wrap text-center">{asi.desc}</span>
                      
                      {/* 1~7단계 (여성은 1~5단계) */}
                      <div className="flex items-center gap-0.5 mt-3 w-full max-w-[240px]">
                        {(asi.code.includes('F') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]).map((step) => {
                          const isActive = asi.level === step;
                          return (
                            <div key={step} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-red-500' : 'bg-slate-200'}`} />
                              <span className={`text-[9px] whitespace-nowrap ${isActive ? 'font-bold text-red-600' : 'text-slate-400'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* 4단계 직관적 심각도 */}
                      <div className="flex items-center gap-2 w-full mt-4 max-w-[240px] px-1">
                        {['양호', '주의', '위험', '심각'].map((stage, idx) => {
                          const severityIdx = getAsiSeverityIndex(asi);
                          const isActive = severityIdx === idx;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-red-500' : 'bg-slate-200'}`} />
                              <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold text-red-600' : 'text-slate-400 font-medium'}`}>
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
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

            {/* 스캔 원본 이미지 (제일 아래로 이동) */}
            <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mb-4 mt-6 flex items-center justify-center">
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

            {/* Legal Disclaimer */}
            <div className="text-[11px] text-slate-400 text-center mt-2 pb-4">
              * 본 AI 리포트는 통계적 데이터 분석 결과이며, 의학적 진단을 대체하는 진단서가 아닙니다.
            </div>
          </div>

          {/* PC Version Hidden Report for PDF Capture (Disabled for Mobile OOM) */}
          {false && (
          <div className="absolute top-0 left-[-9999px] z-[-1]">
            <div id="pdf-report-pc-area" className="w-[1000px] bg-white border border-gray-300 shadow-lg rounded-sm overflow-hidden text-slate-800">
              {/* 리포트 헤더 */}
              <div className="border-b-[3px] border-slate-800 p-8 flex justify-between items-end bg-slate-50">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">탈모톡 AI 리포트</h1>
                  <p className="text-sm font-medium text-slate-500">TalmoTalk Precision AI Assessment Report</p>
                </div>
                <div className="text-right text-[13px] text-slate-600 space-y-1">
                  <p className="flex items-center justify-end gap-2"><Calendar className="w-4 h-4" /> 분석일: {report?.created_at ? new Date(report.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  <p className="flex items-center justify-end gap-2"><User className="w-4 h-4" /> 유저 정보: {report?.patientInfo?.age}세 / {report?.patientInfo?.gender} / 가족력 {report?.patientInfo?.familyHistory}</p>
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
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center relative">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[13px] font-bold text-slate-500">진행 단계 (AI Scalp Index)</span>
                      <button onClick={() => setShowAsiModal(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {(() => {
                      const asi = getAsiInfo(report);
                      return (
                        <>
                          <div className="flex flex-col items-center leading-snug mt-1">
                            <span className="text-[13px] font-bold text-slate-500">{asi.sub}</span>
                            <span className="text-2xl font-black text-red-600 my-0.5">{asi.code}</span>
                            <span className="text-[12px] font-bold text-slate-400">{asi.title}</span>
                          </div>
                          
                          {/* 7단계 진행 심각도 시각화 스텝퍼 */}
                          {/* ASI 진행 심각도 시각화 스텝퍼 */}
                          <div className="flex items-center gap-0.5 mt-3 w-full max-w-[240px]">
                            {(asi.code.includes('F') ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7]).map((step) => {
                              const isActive = asi.level === step;
                              return (
                                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                                  <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-red-500' : 'bg-slate-200'}`} />
                                  <span className={`text-[9px] whitespace-nowrap ${isActive ? 'font-bold text-red-600' : 'text-slate-400'}`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* ASI 모달 */}
                          {showAsiModal && (
                            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-slate-600" /> 
                                    AI Scalp Index 안내
                                  </h4>
                                  <button onClick={() => setShowAsiModal(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="p-5">
                                  <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded text-sm font-bold w-fit mb-3">
                                    {asi.code} : {asi.title}
                                  </div>
                                  <p className="text-[14px] text-slate-700 leading-relaxed mb-4">
                                    {asi.desc}
                                  </p>
                                  <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
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
                      <img 
                        src={imagePreview} 
                        alt="Analyzed" 
                        crossOrigin={imagePreview && imagePreview.startsWith('http') ? "anonymous" : undefined}
                        className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
                      />
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
                        
                        {/* Fallback for old history format */}
                        {(!report?.medicalAnalysis && report?.analysis) && (
                          <div>
                            <strong className="text-slate-900 block mb-1">종합 분석:</strong>
                            <ul className="list-disc pl-4 space-y-1">
                              {report.analysis.map((text, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                              ))}
                            </ul>
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
                        
                        {/* Fallback for old history format */}
                        {(!report?.treatmentPlan && report?.recommendations) && (
                          <div>
                            <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-teal-700 mb-2"><Pill className="w-4 h-4" /> 맞춤 솔루션</h4>
                            <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-teal-500">
                              {report.recommendations.map((text, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                              ))}
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
