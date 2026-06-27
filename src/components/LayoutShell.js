"use client";

import useMediaQuery from "@/hooks/useMediaQuery";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PCHeader from "@/components/pc/PCHeader";

export default function LayoutShell({ children }) {
  const isPC = useMediaQuery("(min-width: 1024px)");

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
