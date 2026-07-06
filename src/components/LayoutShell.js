"use client";

import { useEffect } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PCHeader from "@/components/pc/PCHeader";

export default function LayoutShell({ children }) {
  const isPC = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!sessionStorage.getItem('tracked')) {
      fetch('/api/track', { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('tracked', 'true');
    }

    // Capture referral code from URL and save to cookie (expires in 1 day)
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      document.cookie = `referral_code=${refCode}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  if (isPC) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PCHeader />
        <main className="max-w-[1080px] mx-auto py-6 px-4">
          {children}
        </main>
      </div>
    );
  }

  // 모바일: 기존 레이아웃 그대로
  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-white relative pb-16 shadow-2xl">
        <Header />
        <main className="min-h-[calc(100vh-120px)]">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
