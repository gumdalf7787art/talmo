"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCConsult from "@/components/pc/PCConsult";
import PCHospitalDashboard from "@/components/pc/PCHospitalDashboard";

export default function ChatListPage() {
  const router = useRouter();
  const isPC = useMediaQuery("(min-width: 1024px)");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/chat/list?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setChatRooms(data.rooms);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      }
    };
    fetchRooms();
  }, [user]);

  if (isPC) {
    if (user?.role === 'hospital') {
      return (
        <div className="min-h-[90vh] bg-[#F5F6F8] py-8">
           <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">병원 관리자 ?�모??/h2>
              <PCHospitalDashboard user={user} />
           </div>
        </div>
      );
    }
    return (
      <div className="min-h-[90vh] bg-[#F5F6F8] py-8">
         <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">?�의 ?�모??/h2>
            <PCConsult />
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-[18px] text-gray-900">
            {user?.role === 'hospital' ? '?�담 목록' : '?�의 ?�모??}
          </h1>
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
                key={room.id || room.clinicId} 
                href={`/consult/detail?id=${user?.role === 'hospital' ? room.otherPartyId : room.clinicId}`} 
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <img src="/logo.jpg" alt="logo" className="w-7 h-7 opacity-50 grayscale" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-[15px] text-gray-900 truncate pr-2">
                      {room.otherPartyName}
                    </h3>
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
            <p>진행 중인 ?�담 ?�역???�습?�다.</p>
          </div>
        )}
      </main>
    </div>
  );
}
