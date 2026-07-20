"use client";

import { useEffect } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PCHeader from "@/components/pc/PCHeader";
import PWAPrompt from "@/components/PWAPrompt";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function LayoutShell({ children }) {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const pathname = usePathname();

  useEffect(() => {
    if (!sessionStorage.getItem('tracked')) {
      const savedUser = localStorage.getItem('user');
      const userType = savedUser ? 'member' : 'non_member';

      let inflowSource = '직접 유입 및 기타';
      try {
        const referrer = document.referrer || '';
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('ref')) {
          inflowSource = '친구추천';
        } else if (referrer.includes('blog.naver.com')) {
          const match = referrer.match(/blog\.naver\.com\/([^/]+)\/(\d+)/);
          inflowSource = match ? `네이버 블로그 (${match[1]}/${match[2]})` : '네이버 블로그';
        } else if (referrer.includes('cafe.naver.com')) {
          const match = referrer.match(/cafe\.naver\.com\/([^/]+)\/(\d+)/);
          inflowSource = match ? `네이버 카페 (${match[1]}/${match[2]})` : '네이버 카페';
        } else if (referrer.includes('naver.com')) {
          inflowSource = '네이버 (일반/검색)';
        } else if (referrer.includes('instagram.com')) {
          inflowSource = '인스타그램';
        } else if (referrer.includes('facebook.com')) {
          inflowSource = '페이스북';
        } else if (referrer.includes('google.com')) {
          inflowSource = '구글 검색';
        } else if (referrer.includes('daum.net')) {
          inflowSource = '다음 검색';
        } else if (referrer) {
          try {
            const url = new URL(referrer);
            inflowSource = `기타 (${url.hostname})`;
          } catch(e) {
            inflowSource = '기타 웹사이트';
          }
        }
      } catch (e) {}
      
      fetch('/api/track', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: userType, inflow_source: inflowSource })
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
  const hideFooter = pathname === "/diagnosis";
  
  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-white relative pb-16 shadow-2xl flex flex-col">
        <Header />
        <main className="min-h-[calc(100vh-120px)] flex-1">{children}</main>
        {!hideFooter && <Footer />}
        <BottomNav />
      </div>
    </div>
  );
}
