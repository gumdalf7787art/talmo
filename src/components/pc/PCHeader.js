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
    { href: "/diagnosis", label: "Ai분석", highlight: true },
    { href: "/consult", label: "1:1상담", highlight: true },
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
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo-pc.png" alt="탈모톡 로고" className="h-14 w-auto object-contain" />
          </Link>

          {/* Navigation */}
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
                  className={`px-3 py-2 rounded-lg text-[15px] transition-colors ${
                    item.highlight
                      ? isActive
                        ? "text-teal-700 bg-teal-100 font-extrabold"
                        : "text-teal-600 font-extrabold hover:bg-teal-50"
                      : isActive
                        ? "text-gray-900 bg-gray-100 font-bold"
                        : "text-gray-600 font-semibold hover:text-gray-900 hover:bg-gray-50"
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

export default function PCHeader() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-gray-200 shadow-sm"></header>}>
      <PCHeaderContent />
    </Suspense>
  );
}
