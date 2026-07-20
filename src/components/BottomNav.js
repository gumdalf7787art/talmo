"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Camera, MessageCircle, User, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, [pathname]);

  const isAdminOrHospital = pathname?.startsWith("/admin") || pathname?.startsWith("/hospital");
  
  if (isAdminOrHospital) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-between h-16 max-w-md mx-auto px-8 relative">
        
        {/* 홈 */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
            pathname === "/" ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home className="w-6 h-6" strokeWidth={pathname === "/" ? 2.5 : 2} />
          <span className="text-[10px] font-bold">홈</span>
        </Link>

        {/* AI 분석 (Floating Button) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5">
          <Link
            href="/diagnosis"
            className="flex flex-col items-center justify-center w-16 h-16 bg-teal-600 rounded-full shadow-lg text-white hover:bg-teal-700 hover:scale-105 transition-all duration-300 ring-4 ring-white"
          >
            <Camera className="w-7 h-7" strokeWidth={2} />
            <span className="text-[10px] font-bold mt-0.5">AI분석</span>
          </Link>
        </div>

        {/* 마이페이지 / 로그인 */}
        <Link
          href={isLoggedIn ? "/mypage" : "/login"}
          className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
            pathname?.startsWith("/mypage") || pathname?.startsWith("/login") ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {isLoggedIn ? (
            <User className="w-6 h-6" strokeWidth={pathname?.startsWith("/mypage") ? 2.5 : 2} />
          ) : (
            <LogIn className="w-6 h-6" strokeWidth={pathname?.startsWith("/login") ? 2.5 : 2} />
          )}
          <span className="text-[10px] font-bold">{isLoggedIn ? "마이페이지" : "로그인"}</span>
        </Link>

      </div>
    </nav>
  );
}
