"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

export default function ChatListPage() {
  const router = useRouter();

  // Mock chat list data
  const chatRooms = [
    {
      id: 1,
      clinicId: 2,
      clinicName: "블랙라인 스튜디오",
      lastMessage: "정수리 부위 사진을 2~3장 더 보내주실 수 있나요?",
      time: "오전 11:30",
      unreadCount: 2,
      isClinic: true,
    },
    {
      id: 2,
      clinicId: "18763bdb-dd5b-4c2a-b996-1012039dc029",
      clinicName: "모프로 탈모의원",
      lastMessage: "네, 내원하시면 정확한 견적을 안내해 드리겠습니다.",
      time: "어제",
      unreadCount: 0,
      isClinic: true,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-[18px] text-gray-900">나의 탈모톡</h1>
        </div>
        <button className="p-1 -mr-1 text-gray-700">
          <Search className="w-5 h-5" />
        </button>
      </header>

      {/* Chat List */}
      <main className="flex-1 overflow-y-auto">
        {chatRooms.length > 0 ? (
          <div className="flex flex-col bg-white">
            {chatRooms.map((room) => (
              <Link 
                key={room.id} 
                href={`/consult/${room.clinicId}`} 
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="logo" className="w-7 h-7 opacity-50 grayscale" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-[15px] text-gray-900 truncate pr-2">{room.clinicName}</h3>
                    <span className="text-[12px] text-gray-400 shrink-0">{room.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[13px] truncate pr-4 ${room.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {room.lastMessage}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <p>진행 중인 상담 내역이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
