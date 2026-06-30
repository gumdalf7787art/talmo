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
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const consentAll = consent1 && consent2;
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
      // 諛깆뿏??AI 怨좊룄?붾? ?꾪븳 ?섏옄 ?뺣낫 異붽? ?꾨떖
      formData.append("gender", profile.gender);
      formData.append("birthYear", profile.birthYear);
      formData.append("familyHistory", profile.familyHistory);
      
      if (user && user.id) {
        formData.append("userId", user.id);
      }

      // ?꾨줎?몄뿏?쒖뿉??1024px濡??대?吏 理쒖쟻??(???룺 ?덉빟 諛?R2 ????⑸웾 理쒖쟻??
      try {
        const optimizedBase64 = await compressImage(imageFile, 1024, 0.8); 
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
        alert(`遺꾩꽍 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎: ${errData.error || response.statusText || '?쒕쾭 ?먮윭'}`); 
        console.error("API Error Response:", errData);
      }
    } catch (error) { 
      alert(`?쒕쾭? ?듭떊?????놁뒿?덈떎: ${error.message}`); 
      console.error("Fetch Error:", error);
    }
    finally { setIsAnalyzing(false); }
  };

  // 援щ쾭??諛⑹뼱肄붾뱶 ?쒓굅 - ??긽 ?덈줈??Medical Report ?ㅽ궎留덈? ?곕Ⅸ?ㅺ퀬 媛??  const report = result || {};

  return (
    <div className="max-w-[1000px] mx-auto pb-10 relative">
      {/* Loading Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg w-full max-w-[480px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-teal-600 animate-spin" /> 
                AI ?먰뵾 遺꾩꽍 以?              </h3>
              <button onClick={() => alert("遺꾩꽍 以묒뿉??李쎌쓣 ?レ쓣 ???놁뒿?덈떎. 議곌툑留?湲곕떎?ㅼ＜?몄슂!")} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <p className="text-gray-800 font-bold text-[18px]">
                吏湲?遺꾩꽍以묒엯?덈떎.<br />
                李쎌쓣 ?レ? 留먭퀬 湲곕떎由ъ꽭??
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-teal-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mb-2">珥덇컻?명솕 紐⑤뜽 ?ㅼ틪??吏꾪뻾?섍퀬 ?덉뒿?덈떎...</p>
              
              {/* Ad Banner */}
              <a href="https://store.talmotalk.com" target="_blank" rel="noopener noreferrer" className="block w-full mt-2 rounded-md overflow-hidden border border-gray-200 hover:shadow-md transition-shadow relative group">
                <img src="/talmotalk_ad.png" alt="?덈え???ㅽ넗??愿묎퀬" className="w-full h-[120px] object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-[13px] font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1 transition-transform group-hover:scale-105">
                    留욎땄??耳???쒗뭹 援ш꼍?섍린 <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {!result && !isHistory ? (
        /* ?낅젰 紐⑤뱶: 醫뚯슦 2遺꾪븷 (湲곗〈 ?좎?) */
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Info + Upload */}
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI ?뺣? ?먰뵾 遺꾩꽍</h2>
              <p className="text-sm text-gray-500">?대쭏 ?쇱씤?대굹 ?뺤닔由ш? ??蹂댁씠?꾨줉 ?ъ쭊??李띿뼱二쇱꽭??</p>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg h-80 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition-colors">
              {imagePreview ? (<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />) : (
                <div className="flex flex-col items-center text-gray-400 gap-3">
                  <div className="p-4 bg-white rounded-full shadow-sm"><Camera className="w-10 h-10 text-teal-500" /></div>
                  <span className="font-medium text-lg">?ъ쭊 ?낅줈??/span>
                  <span className="text-sm text-gray-400">?대┃?섏뿬 ?뚯씪???좏깮?섏꽭??/span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5"><Camera className="w-4 h-4 text-teal-600"/> ?뺥솗?꾨? ?믪씠??珥ъ쁺 ??/h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                      <img src="/hairline_guide.png" alt="M???ㅼ뼱?쇱씤 媛?대뱶" className="w-full h-full object-cover scale-110" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">M??/ ?ㅼ뼱?쇱씤</span>
                    <span className="text-[11px] text-slate-500 leading-tight">?뺣㈃ 45?꾩뿉??br/>?대쭏 ?쇱씤??蹂댁씠寃?/span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-center text-center gap-1.5">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                      <img src="/crown_guide.png" alt="?뺤닔由?媛?대뱶" className="w-full h-full object-cover scale-110" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">?뺤닔由?/ 媛瑜대쭏</span>
                    <span className="text-[11px] text-slate-500 leading-tight">怨좉컻瑜??숈뿬<br/>?꾩뿉???꾨옒濡?/span>
                  </div>
                </div>
                <div className="text-[12px] text-slate-600 mt-3 bg-white p-3 rounded border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>諛앹? 議곕챸 ?꾨옒?먯꽌 ?붾뱾由??놁씠 李띿뼱??<strong>紐⑤컻 諛?꾩? ?먰뵾 ?곹깭(?띾컲 ??</strong>瑜?AI媛 媛???뺥솗???먮룆?⑸땲??</span>
                  </div>
                  <div className="flex items-start gap-1.5 ml-5 text-slate-500">
                    <span>??Ai ?먮룆? 媛곷룄? 議곕챸 洹몃━怨?珥ъ쁺 ?대?吏???곕씪 ?ㅻⅤ寃??섏삱 ???덉뒿?덈떎.</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-600"/> ?꾩긽 ?ㅼ틪 ?덈궡</h4>
                <ul className="text-[12px] text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>?낅젰???섏옄 ?뺣낫(?섏씠/?깅퀎/媛議깅젰)瑜?諛뷀깢?쇰줈 珥덇컻?명솕 遺꾩꽍??吏꾪뻾?⑸땲??</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Profile + Analyze */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-gray-900">?섏옄 ?뺣낫</h3>
                {!isProfileComplete && <span className="text-[12px] text-red-500 font-medium ml-auto">?꾩닔 ?낅젰 ??ぉ?낅땲??/span>}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">?깅퀎</span>
                  <div className="flex gap-2 flex-1">
                    {["?⑥꽦", "?ъ꽦"].map(g => (<button key={g} onClick={() => setProfile(prev => ({ ...prev, gender: g }))} className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${profile.gender === g ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{g}</button>))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">異쒖깮</span>
                  <select 
                    value={profile.birthYear}
                    onChange={(e) => setProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-slate-500 text-gray-900"
                  >
                    <option value="" disabled>?좏깮</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}??/option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 font-medium w-14">媛議깅젰</span>
                  <select 
                    value={profile.familyHistory}
                    onChange={(e) => setProfile(prev => ({ ...prev, familyHistory: e.target.value }))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-slate-500 text-gray-900"
                  >
                    <option value="" disabled>?좏깮</option>
                    {["?덉쓬 (遺怨?", "?덉쓬 (紐④퀎)", "?덉쓬 (?묎? 紐⑤몢)", "?놁쓬", "紐⑤쫫"].map(h => (
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
                <span className="text-[14px] font-bold text-slate-800">?꾩껜 ?숈쓽?섍린</span>
              </div>
              
              <div onClick={() => setConsent1(!consent1)} className="flex items-start gap-2 cursor-pointer pl-1">
                <div className="mt-0.5 text-teal-600 shrink-0">
                  {consent1 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span className="text-[12px] text-gray-600 leading-snug">
                  (?꾩닔) ?쒕퉬???덉쭏 ?μ긽 諛?AI ?숈뒿???꾪빐, ?ъ쭊怨?遺꾩꽍 寃곌낵 ?곗씠?곕? ?섏쭛?섍퀬 ?쒖슜?섎뒗 寃껋뿉 ?숈쓽?⑸땲??
                </span>
              </div>

              <div onClick={() => setConsent2(!consent2)} className="flex items-start gap-2 cursor-pointer pl-1 mt-1">
                <div className="mt-0.5 text-teal-600 shrink-0">
                  {consent2 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                </div>
                <span className="text-[12px] text-gray-600 leading-snug">
                  (?꾩닔) AI??遺꾩꽍 寃곌낵??李멸퀬?⑹씠硫? ?섑븰??吏꾨떒???꾩쟾 ?泥댄븷 ???놁뒿?덈떎.
                </span>
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
              {isAnalyzing ? (<><RefreshCcw className="w-5 h-5 animate-spin" /> ?꾩긽 由ы룷???앹꽦 以?..</>) : (<><FileText className="w-5 h-5" /> AI 遺꾩꽍 ?ㅽ뻾</>)}
            </button>
          </div>
        </div>
      ) : result ? (
        /* 寃곌낵 紐⑤뱶: ?꾨Ц 由ы룷??UI (Medical Report Style) */
        <div className="flex flex-col items-center">
          {isHistory && (
            <div className="w-full mb-4">
              <button onClick={() => window.history.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-medium w-fit">??紐⑸줉?쇰줈</button>
            </div>
          )}
          
          <div className="w-full bg-white border border-gray-300 shadow-lg rounded-sm overflow-hidden text-slate-800">
            {/* 由ы룷???ㅻ뜑 */}
            <div className="border-b-[3px] border-slate-800 p-8 flex justify-between items-end bg-slate-50">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">?덈え??遺꾩꽍 寃곌낵吏</h1>
                <p className="text-sm font-medium text-slate-500">TalmoTalk Precision AI Assessment Report</p>
              </div>
              <div className="text-right text-[13px] text-slate-600 space-y-1">
                <p className="flex items-center justify-end gap-2"><Calendar className="w-4 h-4" /> 諛쒓툒?? {new Date().toLocaleDateString()}</p>
                <p className="flex items-center justify-end gap-2"><User className="w-4 h-4" /> ?섏옄 ?뺣낫: {report?.patientInfo?.age}??/ {report?.patientInfo?.gender} / 媛議깅젰 {report?.patientInfo?.familyHistory}</p>
              </div>
            </div>

            <div className="p-8">
              {/* ?듭떖 ?붿빟 ??쒕낫??*/}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center">
                  <span className="text-[13px] font-bold text-slate-500 mb-1">?먰뵾 醫낇빀 ?먯닔</span>
                  <div className="text-4xl font-black text-slate-900">{report?.summary?.score}<span className="text-lg text-slate-400 font-medium">/100</span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center">
                  <span className="text-[13px] font-bold text-slate-500 mb-1">異붿젙 ?먰뵾 ?섏씠</span>
                  <div className="text-4xl font-black text-teal-600">{report?.summary?.scalpAge}<span className="text-lg text-teal-600/60 font-medium">??/span></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg flex flex-col justify-center items-center text-center">
                  <span className="text-[13px] font-bold text-slate-500 mb-1">吏꾪뻾 ?④퀎 (Norwood/Ludwig)</span>
                  <div className="text-2xl font-black text-red-600 mt-1">{report?.summary?.norwoodStage}</div>
                  
                  {/* 吏꾪뻾 ?ш컖???쒓컖???ㅽ뀦??*/}
                  <div className="flex items-center gap-1 mt-3 w-full max-w-[200px]">
                    {['?묓샇', '吏꾪뻾: 珥덇린', '吏꾪뻾: 以묎린', '吏꾪뻾: ?ш컖'].map((stage, idx) => {
                      const isActive = report?.summary?.severity === stage;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-red-500' : 'bg-slate-200'}`} />
                          <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold text-red-600' : 'text-slate-400 font-medium'}`}>
                            {stage.replace('吏꾪뻾: ', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* 醫뚯륫: ?꾩긽 吏??諛??덉씠??李⑦듃 */}
                <div className="col-span-5 flex flex-col gap-6">
                  <div className="border border-slate-200 rounded-lg p-5">
                    <h3 className="text-[15px] font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Activity className="w-5 h-5 text-slate-600" /> ?꾩긽 吏??遺꾩꽍 (Clinical Metrics)</h3>
                    <div className="flex justify-center mb-4">
                      {report?.breakdown && <RadarChart breakdown={report.breakdown} />}
                    </div>
                    <div className="space-y-4">
                      {report?.breakdown?.map((m) => (
                        <div key={m.label} className="bg-slate-50 rounded p-3 text-[13px]">
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-slate-800">{m.label}</span>
                            <span className={`text-${m.color || 'slate'}-600`}>{m.score}??/span>
                          </div>
                          {m.clinicalNote && <p className="text-slate-500 leading-snug" dangerouslySetInnerHTML={{ __html: m.clinicalNote }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Analyzed" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded font-medium">?ㅼ틪 ?먮낯 ?대?吏</div>
                  </div>
                </div>

                {/* ?곗륫: ?꾨Ц???뚭껄 諛?泥섎갑 媛?대뱶?쇱씤 */}
                <div className="col-span-7 flex flex-col gap-6">
                  {/* ?덈え???뚭껄 */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200">
                      <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> ?덈え???뚭껄</h3>
                    </div>
                    <div className="p-5 text-[14px] text-slate-700 leading-relaxed space-y-4">
                      {report?.medicalAnalysis?.finding && (
                        <div>
                          <strong className="text-slate-900 block mb-1">愿李??뚭껄 (Finding):</strong>
                          <p dangerouslySetInnerHTML={{ __html: report.medicalAnalysis.finding }} />
                        </div>
                      )}
                      {report?.medicalAnalysis?.cause && (
                        <div>
                          <strong className="text-slate-900 block mb-1">?먯씤 遺꾩꽍 (Cause):</strong>
                          <p dangerouslySetInnerHTML={{ __html: report.medicalAnalysis.cause }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 留욎땄 ?붾（??(媛?대뱶?쇱씤) */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 p-3 border-b border-slate-900">
                      <h3 className="text-[15px] font-bold text-white flex items-center gap-2"><AlertCircle className="w-4 h-4 text-slate-300" /> 留욎땄 愿由?媛?대뱶 (Management Plan)</h3>
                    </div>
                    <div className="p-5 space-y-5">
                      
                      {report?.treatmentPlan?.medical?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-teal-700 mb-2"><Pill className="w-4 h-4" /> 沅뚭퀬?ы빆</h4>
                          <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-teal-500">
                            {report.treatmentPlan.medical.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                          </ul>
                        </div>
                      )}

                      {report?.treatmentPlan?.homeCare?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-blue-700 mb-2"><Home className="w-4 h-4" /> ?먭? 愿由?(Home Care)</h4>
                          <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-blue-500">
                            {report.treatmentPlan.homeCare.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                          </ul>
                        </div>
                      )}

                      {report?.treatmentPlan?.lifestyle?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[14px] font-bold text-orange-600 mb-2"><Heart className="w-4 h-4" /> ?앺솢 ?듦? (Lifestyle)</h4>
                          <ul className="list-disc pl-5 text-[13.5px] text-slate-700 space-y-1 marker:text-orange-400">
                            {report.treatmentPlan.lifestyle.map((text, i) => <li key={i} dangerouslySetInnerHTML={{ __html: text }} />)}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  <div className="text-[11px] text-slate-400 text-center mt-2">
                    * AI??遺꾩꽍 寃곌낵??李멸퀬?⑹씠硫? ?섑븰??吏꾨떒???泥댄븯?붽쾬? ?꾨떃?덈떎.
                  </div>
                  
                  {!isHistory && (
                    <button onClick={() => { setResult(null); setImageFile(null); setImagePreview(null); window.history.replaceState(null, '', '/diagnosis'); }} className="w-full mt-4 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold hover:bg-slate-200 transition-colors">?ㅼ떆 吏꾨떒?섍린</button>
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


