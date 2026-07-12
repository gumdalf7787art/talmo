"use client";

import { useEffect } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PCHeader from "@/components/pc/PCHeader";
import PWAPrompt from "@/components/PWAPrompt";
import Footer from "@/components/Footer";

export default function LayoutShell({ children }) {
  const isPC = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!sessionStorage.getItem('tracked')) {
      const savedUser = localStorage.getItem('user');
      const userType = savedUser ? 'member' : 'non_member';
      
      fetch('/api/track', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: userType })
      }).catch(() => {});
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
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <PCHeader />
        <main className="max-w-[1080px] w-full mx-auto py-6 px-4 flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 모바일: 기존 레이아웃 그대로
  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-white relative pb-16 shadow-2xl flex flex-col">
        <Header />
        <main className="min-h-[calc(100vh-120px)] flex-1">{children}</main>
        <Footer />
        <BottomNav />
        <PWAPrompt />
      </div>
    </div>
  );
}
