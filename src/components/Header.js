"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const hideRoutes = ["/login", "/signup", "/write", "/find-id", "/find-password", "/terms", "/privacy"];
  const isPostDetail = pathname?.startsWith("/community/") && pathname !== "/community";
  const isChatRoom = pathname?.startsWith("/consult/") && pathname !== "/consult";
  const isChatList = pathname === "/chat-list";
  const isHistory = pathname === "/diagnosis-history";
  const isMyPosts = pathname === "/my-posts" || pathname === "/my-bookmarks";
  
  if (hideRoutes.includes(pathname) || isPostDetail || isChatRoom || isChatList || isHistory || isMyPosts) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-teal-500 to-teal-700 flex flex-col shadow-md">
      <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm shrink-0 border border-teal-400/30">
            <img src="/logo.png" alt="탈모톡 로고" className="w-full h-full object-cover" />
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
          <Link href="/login" className="text-teal-50 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
