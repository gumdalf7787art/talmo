"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const hideRoutes = ["/login", "/signup", "/write", "/find-id", "/find-password", "/terms", "/privacy"];
  const isPostDetail = pathname?.startsWith("/community/") && pathname !== "/community";
  const isChatRoom = pathname === "/consult/detail";
  const isChatList = pathname === "/chat-list";
  const isHistory = pathname === "/diagnosis-history";
  const isMyPosts = pathname === "/my-posts" || pathname === "/my-bookmarks";
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, [pathname]);

  if (hideRoutes.includes(pathname) || isPostDetail || isChatRoom || isChatList || isHistory || isMyPosts) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-500 to-teal-700 flex flex-col shadow-md">
      <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm shrink-0 border border-teal-400/30">
            <img src="/logo.jpg" alt="탈모톡 로고" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[9px] text-teal-100 font-medium tracking-wider mb-0.5 opacity-90">
              대한민국 리얼 탈모 커뮤니티
            </span>
            <span className="font-bold text-xl tracking-tight text-white leading-none">
              탈모톡<span className="text-teal-200">.</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {mounted && isLoggedIn ? (
            <>
              <button className="text-teal-50 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/mypage" className="text-teal-50 hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : mounted && !isLoggedIn ? (
            <Link href="/login" className="text-teal-50 hover:text-white transition-colors text-xs font-semibold px-2 py-1 bg-teal-600/50 rounded-md border border-teal-400/30">
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
