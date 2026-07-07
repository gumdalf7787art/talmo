"use client";

import { useEffect, useState } from "react";

export default function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState("other"); // "ios" | "android" | "other"
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. 이미 PWA 독립 모드로 구동 중인지 확인 (그렇다면 가이드 불필요)
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return;

    // 2. 사용자가 최근에 팝업을 닫았는지 확인 (24시간 동안 숨김)
    const hidePromptUntil = localStorage.getItem("pwa_prompt_hide_until");
    if (hidePromptUntil && Date.now() < parseInt(hidePromptUntil, 10)) {
      return;
    }

    // 3. 기기 플랫폼 판별
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setPlatform("ios");
      // iOS는 beforeinstallprompt 이벤트를 지원하지 않으므로, 사파리 유저에게 3초 후에 가이드 노출
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isAndroid) {
      setPlatform("android");

      // 안드로이드 크롬용 설치 프로프리 이벤트 리스너 등록
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 브라우저의 기본 설치 대화상자 표시
    deferredPrompt.prompt();

    // 사용자의 선택 결과 대기
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
    } else {
      console.log("User dismissed the PWA install prompt");
    }

    // 초기화 및 팝업 닫기
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    // 오늘 하루 보지 않기 (24시간 동안 노출 안 함)
    const expireTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("pwa_prompt_hide_until", expireTime.toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[999] bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 animate-fade-in-up md:max-w-sm md:mx-auto">
      {/* 팝업 헤더 */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden shrink-0 border border-orange-200">
            <img src="/logo-mobile.png" alt="탈모톡" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">탈모톡 앱 설치하기</h4>
            <p className="text-xs text-gray-500 mt-0.5">바탕화면에 아이콘을 만들고 더 빠르게 진단해 보세요!</p>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 p-1 transition"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 플랫폼별 액션 가이드 */}
      {platform === "android" && deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition shadow-md shadow-orange-500/20 text-center"
        >
          간편 설치 시작
        </button>
      )}

      {platform === "ios" && (
        <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50 text-xs text-gray-700 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-orange-600 mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            아이폰 추가 방법
          </div>
          1. 사파리 브라우저 하단의 <strong className="text-gray-900">공유 버튼</strong>(네모 안의 위쪽 화살표)을 누릅니다.<br />
          2. 메뉴를 아래로 내려 <strong className="text-gray-900">['홈 화면에 추가']</strong>를 선택합니다.
        </div>
      )}

      {/* 오늘 하루 보지 않기 */}
      <div className="flex justify-end">
        <button 
          onClick={handleClose}
          className="text-[10px] text-gray-400 hover:text-gray-500 transition underline underline-offset-2"
        >
          오늘 하루 보지 않기
        </button>
      </div>
    </div>
  );
}
