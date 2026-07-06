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

  if (hideRoutes.includes(pathname) || isChatRoom || isChatList || isHistory || isMyPosts) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 flex flex-col shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo-mobile.png?v=2" alt="탈모톡 로고" className="h-9 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          {mounted && isLoggedIn ? (
            <>
              <button className="text-gray-500 hover:text-gray-900 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/mypage" className="text-gray-500 hover:text-gray-900 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </>
          ) : mounted && !isLoggedIn ? (
            <Link href="/login" className="bg-teal-600 hover:bg-teal-700 text-white transition-colors text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm">
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
