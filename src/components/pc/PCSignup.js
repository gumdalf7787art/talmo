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
      setEmailMessage("올바른 이메일 형식을 입력해주세요.");
    } else {
      setEmailStatus("valid");
      setEmailMessage("이메일 중복확인을 진행해주세요.");
    }
  };

  const handleCheckEmail = async () => {
    if (emailStatus !== "valid" && emailStatus !== "available") return;
    setEmailStatus("checking");
    setEmailMessage("중복 확인 중...");
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "서버 에러");
      }
      if (data.available) {
        setEmailStatus("available");
        setEmailMessage("사용 가능한 이메일입니다.");
      } else {
        setEmailStatus("duplicate");
        setEmailMessage("이미 가입된 이메일입니다.");
      }
    } catch (error) {
      setEmailStatus("error");
      setEmailMessage(`오류: ${error.message}`);
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
      setNicknameMessage("닉네임 중복확인을 진행해주세요.");
    }
  };

  const handleCheckNickname = async () => {
    if (nicknameStatus !== "valid" && nicknameStatus !== "available") return;
    setNicknameStatus("checking");
    setNicknameMessage("중복 확인 중...");
    try {
      const res = await fetch(`/api/user/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "서버 에러");
      }
      if (data.available) {
        setNicknameStatus("available");
        setNicknameMessage("사용 가능한 닉네임입니다.");
      } else {
        setNicknameStatus("duplicate");
        setNicknameMessage("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      setNicknameStatus("error");
      setNicknameMessage(`오류: ${error.message}`);
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
        alert("회원가입이 완료되었습니다.");
        router.push("/login");
      } else {
        const data = await res.json();
        alert(`회원가입 실패: ${data.error}`);
      }
    } catch (e) {
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-8">
      <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 shadow-lg p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">탈모톡에 오신 것을<br />환영합니다!</h2>
          <p className="text-sm text-gray-500 mt-2">기본 정보만 입력하고 바로 시작해보세요.</p>
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
            카카오톡으로 시작하기
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
            네이버로 시작하기
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
            구글로 시작하기
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400 font-medium">또는 이메일로 가입</span><div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800 ml-1">이메일</label>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={handleEmailChange} placeholder="example@talmotalk.com" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
                </div>
                <button type="button" onClick={handleCheckEmail} disabled={emailStatus !== 'valid'} className={`px-4 py-3.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${emailStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>중복확인</button>
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
              <label className="text-sm font-semibold text-gray-800 ml-1">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="영문, 숫자, 특수문자 8자 이상" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
              </div>
              {password && (
                <span className={`text-xs ml-1 ${isPasswordValid ? 'text-teal-600' : 'text-red-500'}`}>
                  {isPasswordValid ? '비밀번호 사용 가능합니다.' : '비밀번호 형식에 맞지 않습니다.'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-800 ml-1">비밀번호 확인</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="비밀번호 재입력" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" required />
              </div>
              {passwordConfirm && (
                <span className={`text-xs ml-1 ${password === passwordConfirm ? 'text-teal-600' : 'text-red-500'}`}>
                  {password === passwordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800 ml-1">닉네임 <span className="text-gray-400 font-normal">(선택)</span></label>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={nickname} onChange={handleNicknameChange} placeholder="미입력 시 랜덤 생성" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all" />
                </div>
                <button type="button" onClick={handleCheckNickname} disabled={nicknameStatus !== 'valid'} className={`px-4 py-3.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${nicknameStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>중복확인</button>
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
              <span className="font-bold text-sm text-gray-900">약관 전체 동의</span>
            </div>
            <div className="flex flex-col gap-2 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAgreeTerms(!agreeTerms); if(!agreeTerms && agreePrivacy) setAgreeAll(true); else setAgreeAll(false); }}>
                  <CheckCircle2 className={`w-4 h-4 ${agreeTerms ? 'text-teal-600' : 'text-gray-300'}`} />
                  <span className="text-sm text-gray-600 font-medium">[필수] 서비스 이용약관 동의</span>
                </div>
                <Link href="/terms" className="text-xs text-gray-400 underline underline-offset-2">보기</Link>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAgreePrivacy(!agreePrivacy); if(agreeTerms && !agreePrivacy) setAgreeAll(true); else setAgreeAll(false); }}>
                  <CheckCircle2 className={`w-4 h-4 ${agreePrivacy ? 'text-teal-600' : 'text-gray-300'}`} />
                  <span className="text-sm text-gray-600 font-medium">[필수] 개인정보 수집 및 이용 동의</span>
                </div>
                <Link href="/privacy" className="text-xs text-gray-400 underline underline-offset-2">보기</Link>
              </div>
            </div>
          </div>

          <button type="submit" disabled={!isFormValid} className={`w-full py-4 rounded-md font-bold text-[15px] shadow-sm transition-all mt-2 ${isFormValid ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>가입하기</button>
        </form>
      </div>
    </div>
  );
}
