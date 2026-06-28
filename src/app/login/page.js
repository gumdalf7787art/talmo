"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCLogin from "@/components/pc/PCLogin";

export default function LoginPage() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          router.push("/admin/dashboard");
        } else if (data.user.role === 'hospital') {
          router.push("/hospital/dashboard");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg(data.error || "로그인에 실패했습니다.");
      }
    } catch (e) {
      setErrorMsg("서버 통신 중 오류가 발생했습니다.");
    }
  };

  if (isPC) return <PCLogin />;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white flex items-center justify-center px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="absolute left-4 p-1 -ml-1 text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">로그인</h1>
      </header>

      <div className="flex flex-col flex-1 px-6 pt-10 pb-8">
        <div className="flex flex-col items-center mb-10">
          <span className="font-bold text-3xl tracking-tight text-teal-600 mb-2">
            탈모톡<span className="text-teal-200">.</span>
          </span>
          <p className="text-gray-500 text-sm">대한민국 리얼 탈모 커뮤니티</p>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 w-full mb-8">
          <button 
            type="button"
            onClick={() => {
              const clientId = '43a474ecd76c1a1b758dcdf415c1565a';
              const redirectUri = `${window.location.origin}/api/auth/kakao/callback`;
              window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
            }}
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-[#FEE500] text-black font-semibold text-[15px] transition-opacity active:opacity-80"
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
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-[#03C75A] text-white font-semibold text-[15px] transition-opacity active:opacity-80"
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
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold text-[15px] transition-colors active:bg-gray-50"
          >
            구글로 시작하기
          </button>
        </div>

        <div className="flex items-center w-full gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">또는</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">이메일</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요"
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">비밀번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
          {errorMsg && <div className="text-red-500 text-sm mt-1">{errorMsg}</div>}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-teal-600 text-white rounded-lg font-bold text-[15px] shadow-sm active:bg-teal-700 transition-colors"
          >
            이메일로 로그인
          </button>
        </form>

        {/* Links */}
        <div className="flex items-center justify-center gap-4 mt-8 text-xs text-gray-500 font-medium">
          <Link href="/find-id" className="hover:text-gray-900 transition-colors">아이디 찾기</Link>
          <div className="w-px h-3 bg-gray-300"></div>
          <Link href="/find-password" className="hover:text-gray-900 transition-colors">비밀번호 찾기</Link>
          <div className="w-px h-3 bg-gray-300"></div>
          <Link href="/signup" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
