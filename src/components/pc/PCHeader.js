"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, User, Bell } from "lucide-react";

function PCHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = [
    { href: "/community", label: "전체 탈모톡" },
    { href: "/community?category=탈모수다", label: "탈모수다" },
    { href: "/community?category=리얼후기", label: "리얼후기" },
    { href: "/community?category=탈모정보", label: "탈모정보" },
    { href: "/community?category=닥터칼럼", label: "닥터칼럼" },
  ];

  const highlightItems = [
    { href: "/diagnosis", label: "Ai 탈모 분석" },
    { href: "/consult", label: "1:1상담" },
  ];

  const searchTexts = [
    "Ai 로 나의 탈모상태 분석",
    "관리 및 이식에 대한 리얼후기",
    "신뢰할만한 탈모 정보",
    "1000만 탈모의 고민해결",
    "원장님들이 작성하는 리얼칼럼",
  ];
  const [searchIndex, setSearchIndex] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    
    const interval = setInterval(() => {
      setSearchIndex((prev) => (prev + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [pathname, searchTexts.length]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm flex flex-col">
      {/* Top Row: Logo, Search, User Menu */}
      <div className="max-w-[1080px] w-full mx-auto flex items-center justify-between px-6 h-20">
        
        {/* Left Side: Logo & Search */}
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo-pc.png" alt="탈모톡 로고" className="h-14 w-auto object-contain" />
          </Link>

          <Link
            href="/search"
            className="flex items-center gap-3 bg-white border-2 border-teal-500 hover:bg-teal-50 rounded-full px-5 py-2.5 text-gray-500 transition-colors w-full max-w-[320px] shadow-sm overflow-hidden"
          >
            <Search className="w-5 h-5 text-teal-600 shrink-0" />
            <div className="h-[22px] overflow-hidden flex-1 relative">
              <div 
                className="flex flex-col transition-transform duration-500 ease-in-out absolute w-full top-0 left-0"
                style={{ transform: `translateY(-${searchIndex * 22}px)` }}
              >
                {searchTexts.map((text, idx) => (
                  <span key={idx} className="h-[22px] flex items-center text-[15px] font-bold text-gray-400 truncate">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>

        {/* Right Side: User Menu */}
        <div className="flex items-center gap-4 shrink-0">
          {mounted && isLoggedIn ? (
            <>
              <button className="flex items-center justify-center w-11 h-11 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <Link
                href="/mypage"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="text-[15px] font-bold">마이페이지</span>
              </Link>
            </>
          ) : mounted && !isLoggedIn ? (
            <Link
              href="/login"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[15px] px-6 py-2.5 rounded-md transition-colors shadow-sm"
            >
              로그인
            </Link>
          ) : (
            <div className="w-20 h-10"></div>
          )}
        </div>
      </div>

      {/* Bottom Row: Navigation Links */}
      <div className="border-t-2 border-gray-200 bg-white">
        <div className="max-w-[1080px] w-full mx-auto px-6 h-14 flex items-center justify-center gap-6">
          {/* Ai 탈모 분석 */}
          <nav className="flex items-center gap-1">
            {highlightItems.filter(item => item.label === "Ai 탈모 분석").map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-[15px] transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-teal-700 bg-teal-50 font-bold"
                      : "text-teal-600 font-semibold hover:bg-teal-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="w-[1px] h-4 bg-gray-300"></div>

          {/* Community Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href.includes("?category=")
                ? searchParams.get("category") === item.href.split("=")[1]
                : item.href === "/community"
                  ? pathname === "/community" && (!searchParams.get("category") || searchParams.get("category") === "전체")
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-[15px] transition-colors ${
                    isActive
                      ? "text-black bg-gray-100 font-semibold"
                      : "text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="w-[1px] h-4 bg-gray-300"></div>

          {/* 1:1상담 */}
          <nav className="flex items-center gap-1">
            {highlightItems.filter(item => item.label === "1:1상담").map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-[15px] transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-teal-700 bg-teal-50 font-bold"
                      : "text-teal-600 font-semibold hover:bg-teal-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function PCHeader() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-gray-200 shadow-sm"></header>}>
      <PCHeaderContent />
    </Suspense>
  );
}
