"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PCSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("");

  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!val) {
      setEmailStatus("");
      setEmailMessage("");
    } else if (!validateEmailFormat(val)) {
      setEmailStatus("invalid");
      setEmailMessage("?щ컮瑜??대찓???뺤떇???낅젰?댁＜?몄슂.");
    } else {
      setEmailStatus("valid");
      setEmailMessage("?대찓??以묐났?뺤씤??吏꾪뻾?댁＜?몄슂.");
    }
  };

  const handleCheckEmail = async () => {
    if (emailStatus !== "valid" && emailStatus !== "available") return;
    setEmailStatus("checking");
    setEmailMessage("以묐났 ?뺤씤 以?..");
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "?쒕쾭 ?먮윭");
      }
      if (data.available) {
        setEmailStatus("available");
        setEmailMessage("?ъ슜 媛?ν븳 ?대찓?쇱엯?덈떎.");
      } else {
        setEmailStatus("duplicate");
        setEmailMessage("?대? 媛?낅맂 ?대찓?쇱엯?덈떎.");
      }
    } catch (error) {
      setEmailStatus("error");
      setEmailMessage(`?ㅻ쪟: ${error.message}`);
    }
  };

  const handleNicknameChange = (e) => {
    const val = e.target.value;
    setNickname(val);
    if (!val) {
      setNicknameStatus("");
      setNicknameMessage("");
    } else {
      setNicknameStatus("valid");
      setNicknameMessage("?됰꽕??以묐났?뺤씤??吏꾪뻾?댁＜?몄슂.");
    }
  };

  const handleCheckNickname = async () => {
    if (nicknameStatus !== "valid" && nicknameStatus !== "available") return;
    setNicknameStatus("checking");
    setNicknameMessage("以묐났 ?뺤씤 以?..");
    try {
      const res = await fetch(`/api/user/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "?쒕쾭 ?먮윭");
      }
      if (data.available) {
        setNicknameStatus("available");
        setNicknameMessage("?ъ슜 媛?ν븳 ?됰꽕?꾩엯?덈떎.");
      } else {
        setNicknameStatus("duplicate");
        setNicknameMessage("?대? ?ъ슜 以묒씤 ?됰꽕?꾩엯?덈떎.");
      }
    } catch (error) {
      setNicknameStatus("error");
      setNicknameMessage(`?ㅻ쪟: ${error.message}`);
    }
  };

  const handleAgreeAll = () => { const n = !agreeAll; setAgreeAll(n); setAgreeTerms(n); setAgreePrivacy(n); };
  
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  const isPasswordValid = passwordRegex.test(password);
  
  const isFormValid = emailStatus === "available" && isPasswordValid && password === passwordConfirm && (!nickname || nicknameStatus === "available") && agreeTerms && agreePrivacy;

  const handleSignup = async (e) => { 
    e.preventDefault(); 
    if (!isFormValid) return; 
    
    // TODO: Send to API
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname })
      });
      if (res.ok) {
        alert("?뚯썝媛?낆씠 ?꾨즺?섏뿀?듬땲??");
        router.push("/login");
      } else {
        const data = await res.json();
        alert(`?뚯썝媛???ㅽ뙣: ${data.error}`);
      }
    } catch (e) {
      alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-8">
      <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 shadow-lg p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">?덈え?≪뿉 ?ㅼ떊 寃껋쓣<br />?섏쁺?⑸땲??</h2>
          <p className="text-sm text-gray-500 mt-2">湲곕낯 ?뺣낫留??낅젰?섍퀬 諛붾줈 ?쒖옉?대낫?몄슂.</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <button 
            type="button"
            onClick={() => {
              const clientId = '43a474ecd76c1a1b758dcdf415c1565a';
              const redirectUri = `${window.location.origin}/api/auth/kakao/callback`;
              window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
            }}
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-[#FEE500] text-black font-semibold text-[15px] hover:opacity-90 transition-opacity"
          >
            移댁뭅?ㅽ넚?쇰줈 ?쒖옉?섍린
          </button>
          <button 
            type="button" 
            onClick={() => {
              const clientId = 'OWvIAOQuyH9DRnz0L4HZ';
              const redirectUri = `${window.location.origin}/api/auth/naver/callback`;
              const state = Math.random().toString(36).substring(3, 14);
              window.location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
            }}
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-[#03C75A] text-white font-semibold text-[15px] hover:opacity-90 transition-opacity"
          >
            ?ㅼ씠踰꾨줈 ?쒖옉?섍린
          </button>
          <button 
            type="button" 
            onClick={() => {
              const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
              const redirectUri = `${window.location.origin}/api/auth/google/callback`;
              const scope = 'email profile';
              const responseType = 'code';
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
            }}
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
          >
            援ш?濡??쒖옉?섍린
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400 font-medium">?먮뒗 ?대찓?쇰줈 媛??/span><div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800 ml-1">?대찓??/label>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={handleEmailChange} placeholder="example@talmotalk.com" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
                </div>
                <button type="button" onClick={handleCheckEmail} disabled={emailStatus !== 'valid'} className={`px-4 py-3.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${emailStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>以묐났?뺤씤</button>
              </div>
              {emailMessage && (
                <span className={`text-xs ml-1 ${emailStatus === 'available' ? 'text-teal-600' : emailStatus === 'valid' ? 'text-gray-500' : 'text-red-500'}`}>
                  {emailMessage}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800 ml-1">鍮꾨?踰덊샇</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="?곷Ц, ?レ옄, ?뱀닔臾몄옄 8???댁긽" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
              </div>
              {password && (
                <span className={`text-xs ml-1 ${isPasswordValid ? 'text-teal-600' : 'text-red-500'}`}>
                  {isPasswordValid ? '鍮꾨?踰덊샇 ?ъ슜 媛?ν빀?덈떎.' : '鍮꾨?踰덊샇 ?뺤떇??留욎? ?딆뒿?덈떎.'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800 ml-1">鍮꾨?踰덊샇 ?뺤씤</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="鍮꾨?踰덊샇 ?ъ엯?? className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
              </div>
              {passwordConfirm && (
                <span className={`text-xs ml-1 ${password === passwordConfirm ? 'text-teal-600' : 'text-red-500'}`}>
                  {password === passwordConfirm ? '鍮꾨?踰덊샇媛 ?쇱튂?⑸땲??' : '鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800 ml-1">?됰꽕??<span className="text-gray-400 font-normal">(?좏깮)</span></label>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={nickname} onChange={handleNicknameChange} placeholder="誘몄엯?????쒕뜡 ?앹꽦" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
                </div>
                <button type="button" onClick={handleCheckNickname} disabled={nicknameStatus !== 'valid'} className={`px-4 py-3.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${nicknameStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>以묐났?뺤씤</button>
              </div>
              {nicknameMessage && (
                <span className={`text-xs ml-1 ${nicknameStatus === 'available' ? 'text-teal-600' : nicknameStatus === 'valid' ? 'text-gray-500' : 'text-red-500'}`}>
                  {nicknameMessage}
                </span>
              )}
            </div>
          </div>

          <hr className="border-gray-100 my-1" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer" onClick={handleAgreeAll}>
              <CheckCircle2 className={`w-5 h-5 ${agreeAll ? 'text-teal-600' : 'text-gray-300'}`} />
              <span className="font-bold text-sm text-gray-900">?쎄? ?꾩껜 ?숈쓽</span>
            </div>
            <div className="flex flex-col gap-2 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAgreeTerms(!agreeTerms); if(!agreeTerms && agreePrivacy) setAgreeAll(true); else setAgreeAll(false); }}>
                  <CheckCircle2 className={`w-4 h-4 ${agreeTerms ? 'text-teal-600' : 'text-gray-300'}`} />
                  <span className="text-sm text-gray-600 font-medium">[?꾩닔] ?쒕퉬???댁슜?쎄? ?숈쓽</span>
                </div>
                <Link href="/terms" className="text-xs text-gray-400 underline underline-offset-2">蹂닿린</Link>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAgreePrivacy(!agreePrivacy); if(agreeTerms && !agreePrivacy) setAgreeAll(true); else setAgreeAll(false); }}>
                  <CheckCircle2 className={`w-4 h-4 ${agreePrivacy ? 'text-teal-600' : 'text-gray-300'}`} />
                  <span className="text-sm text-gray-600 font-medium">[?꾩닔] 媛쒖씤?뺣낫 ?섏쭛 諛??댁슜 ?숈쓽</span>
                </div>
                <Link href="/privacy" className="text-xs text-gray-400 underline underline-offset-2">蹂닿린</Link>
              </div>
            </div>
          </div>

          <button type="submit" disabled={!isFormValid} className={`w-full py-4 rounded-md font-bold text-[15px] shadow-sm transition-all mt-2 ${isFormValid ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>媛?낇븯湲?/button>
        </form>
      </div>
    </div>
  );
}

