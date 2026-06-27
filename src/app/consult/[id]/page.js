"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, MoreVertical, Plus, Send, Image as ImageIcon, Camera } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCConsult from "@/components/pc/PCConsult";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const isPC = useMediaQuery("(min-width: 1024px)");

  // Mock clinic data (In a real app, fetch based on params.id)
  const clinicName = params.id === "2" ? "블랙라인 스튜디오" : "모프로 탈모의원";

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log("Sent:", message);
    setMessage("");
  };

  if (isPC) {
    return <PCConsult clinicId={params.id} clinicName={clinicName} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F6F8]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md flex items-center justify-between px-4 h-14 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-[16px] text-gray-900 leading-tight">{clinicName}</h1>
            <span className="text-[11px] text-teal-600 font-medium">보통 10분 내 응답</span>
          </div>
        </div>
        <button className="p-1 -mr-1 text-gray-700">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-4 overflow-y-auto pb-24">
        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="bg-gray-200/70 text-gray-500 text-[11px] px-3 py-1 rounded-full font-medium">
            2026년 6월 27일 토요일
          </span>
        </div>

        {/* System / Auto Reply Message */}
        <div className="flex gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/logo.png" alt="clinic" className="w-5 h-5 opacity-50 grayscale" />
          </div>
          <div className="flex flex-col gap-1 items-start max-w-[75%]">
            <span className="text-[12px] text-gray-600 font-medium">{clinicName}</span>
            <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-[14px] text-gray-800 leading-snug">
              안녕하세요! 대한민국 리얼 탈모 커뮤니티 탈모톡 공식 제휴병원 <b>{clinicName}</b>입니다.<br/><br/>
              현재 고민이신 부위의 <b>사진 2~3장</b>과 함께 고민 내용을 남겨주시면, 대표원장님이 직접 확인 후 꼼꼼하게 1:1 정밀 상담을 도와드리겠습니다.
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">오전 10:00</span>
          </div>
        </div>

        {/* User Message */}
        <div className="flex flex-col gap-1 items-end self-end max-w-[75%] mt-2">
          <div className="bg-teal-600 px-3.5 py-2.5 rounded-2xl rounded-tr-sm shadow-sm text-[14px] text-white leading-snug">
            안녕하세요, 20대 후반 남성입니다.<br/>
            최근 M자 라인이 눈에 띄게 밀리는 것 같아서 모발이식을 고려중입니다. 대략 3000모 정도 비절개로 하면 견적이 어떻게 될까요?
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">오전 10:15</span>
        </div>

        {/* User Image Message */}
        <div className="flex flex-col gap-1 items-end self-end max-w-[60%]">
          <div className="rounded-xl rounded-tr-sm overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
            <img src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&h=300&fit=crop" alt="attached" className="w-full h-auto object-cover" />
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">오전 10:15</span>
        </div>
      </main>

      {/* Sticky Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        {/* Optional Attach Menu */}
        {showAttachMenu && (
          <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <ImageIcon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium">앨범</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                <Camera className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium">카메라</span>
            </button>
          </div>
        )}

        <div className="px-3 py-2.5 flex items-end gap-2 max-w-md mx-auto">
          <button 
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Plus className={`w-6 h-6 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
          </button>
          
          <form onSubmit={handleSend} className="flex flex-1 items-end bg-gray-100 rounded-2xl border border-gray-200 px-3 py-1.5 min-h-[44px]">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요."
              className="flex-1 bg-transparent text-[14px] text-gray-900 focus:outline-none resize-none max-h-24 min-h-[24px] py-1"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className={`p-1.5 ml-1 mb-0.5 rounded-full shrink-0 transition-colors ${
                message.trim() ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
