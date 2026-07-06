"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isAdminOrHospital = pathname?.startsWith("/admin") || pathname?.startsWith("/hospital");
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchTexts = [
    "탈모 상태 분석하기",
    "이식/치료 리얼후기",
    "원장님 닥터칼럼",
    "1:1 무료 상담"
  ];
  const [searchIndex, setSearchIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');

    const interval = setInterval(() => {
      setSearchIndex((prev) => (prev + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [pathname, searchTexts.length]);

  if (isAdminOrHospital) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 flex flex-col shadow-sm">
      <div className="flex items-center justify-between px-3 h-14 max-w-md mx-auto w-full gap-2">
        {/* 왼쪽: 로고 */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo-mobile.png?v=2" alt="탈모톡 로고" className="h-8 w-auto object-contain" />
        </Link>

        {/* 가운데: 검색바 */}
        <Link
          href="/search"
          className="flex-1 flex items-center gap-1.5 bg-white border-2 border-teal-500 rounded-full px-3 py-1.5 text-gray-500 transition-colors shadow-sm overflow-hidden h-9 min-w-0"
        >
          <Search className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="h-[18px] overflow-hidden flex-1 relative min-w-0">
            <div 
              className="flex flex-col transition-transform duration-500 ease-in-out absolute w-full top-0 left-0"
              style={{ transform: `translateY(-${searchIndex * 18}px)` }}
            >
              {searchTexts.map((text, idx) => (
                <span key={idx} className="h-[18px] flex items-center text-[12px] font-bold text-gray-400 truncate">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </Link>

        {/* 오른쪽: 알람 및 로그인/마이페이지 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {mounted && isLoggedIn ? (
            <>
              <button className="text-gray-500 hover:text-teal-600 transition-colors relative p-1">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/mypage" className="text-gray-500 hover:text-teal-600 transition-colors p-1">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : mounted && !isLoggedIn ? (
            <Link href="/login" className="bg-teal-600 hover:bg-teal-700 text-white transition-colors text-[11px] font-bold px-2.5 py-1.5 rounded-md shadow-sm shrink-0">
              로그인
            </Link>
          ) : (
            <div className="w-5 h-5"></div>
          )}
        </div>
      </div>
    </header>
  );
}
