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

  const hideRoutes = ["/login", "/signup", "/write", "/find-id", "/find-password", "/terms", "/privacy"];
  const isPostDetail = pathname?.startsWith("/community/") && pathname !== "/community";
  const isChatRoom = pathname === "/consult/detail";
  const isChatList = pathname === "/chat-list";
  const isHistory = pathname === "/diagnosis-history";
  const isMyPosts = pathname === "/my-posts" || pathname === "/my-bookmarks";
  
  if (hideRoutes.includes(pathname) || isChatRoom || isChatList || isHistory || isMyPosts) return null;

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/community", label: "커뮤니티", icon: Users },
    { href: "/diagnosis", label: "AI진단", icon: Camera },
    { href: "/consult", label: "1:1상담", icon: MessageCircle },
    { 
      href: isLoggedIn ? "/mypage" : "/login", 
      label: isLoggedIn ? "마이페이지" : "로그인", 
      icon: isLoggedIn ? User : LogIn 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
