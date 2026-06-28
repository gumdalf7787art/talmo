"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Bell } from "lucide-react";

export default function PCHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "홈" },
    { href: "/community", label: "커뮤니티" },
    { href: "/diagnosis", label: "AI 분석" },
    { href: "/consult", label: "1:1 상담" },
  ];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1080px] mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200 shrink-0">
              <img src="/logo.jpg" alt="탈모톡 로고" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">
                탈모톡<span className="text-teal-500">.</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider mt-0.5">
                대한민국 리얼 탈모 커뮤니티
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-[15px] font-semibold transition-colors ${
                    isActive
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 text-gray-500 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">검색</span>
          </Link>
          
          {mounted && isLoggedIn ? (
            <>
              <button className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <Link
                href="/mypage"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">마이페이지</span>
              </Link>
            </>
          ) : mounted && !isLoggedIn ? (
            <Link
              href="/login"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              로그인
            </Link>
          ) : (
            <div className="w-16 h-9"></div>
          )}
        </div>
      </div>
    </header>
  );
}
