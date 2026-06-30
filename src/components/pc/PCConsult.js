"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, MoreVertical, Plus, Send, Image as ImageIcon, Camera } from "lucide-react";

export default function PCConsult({ clinicId, clinicName }) {
  const [message, setMessage] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Fetch chat rooms
  useEffect(() => {
    if (!user) return;
    fetch(`/api/chat/list?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Add default dummy rooms if real ones don't exist yet for visual demo
          const realRooms = data.rooms;
          setChatRooms(realRooms.length > 0 ? realRooms : [
            {
              id: 1,
              clinicId: "2",
              otherPartyName: "블랙라인 스튜디오",
              lastMessage: "정수리 부위 사진을 2~3장 더 보내주실 수 있나요?",
              time: "오전 11:30",
              unreadCount: 2,
            },
            {
              id: 2,
              clinicId: "18763bdb-dd5b-4c2a-b996-1012039dc029",
              otherPartyName: "모프로 탈모의원",
              lastMessage: "네, 내원하시면 정확한 견적을 안내해 드리겠습니다.",
              time: "어제",
              unreadCount: 0,
            }
          ]);
        }
      });
  }, [user]);

  const fetchMessages = () => {
    if (!user || !clinicId) return;
    fetch(`/api/chat/messages?userId=${user.id}&clinicId=${clinicId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessages(data.messages);
      });
  };

  // Fetch messages
  useEffect(() => {
    if (!user || !clinicId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user, clinicId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    const textToSend = message;
    setMessage("");

    setMessages(prev => [...prev, {
      id: "temp-" + Date.now(),
      sender_id: user.id,
      content: textToSend,
      created_at: new Date().toISOString(),
      is_read: 0
    }]);

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          clinicId: clinicId,
          senderId: user.id,
          content: textToSend
        })
      });
      // Fetch immediately after sending
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[750px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
      
      {/* Left Sidebar: Chat List */}
      <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-[16px] text-gray-900">나의 탈모톡</h2>
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Chat List Items */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.map((room) => {
            const isActive = room.clinicId === clinicId;
            return (
              <Link 
                key={room.id} 
                href={`/consult/detail?id=${room.clinicId}`} 
                className={`flex items-center gap-3 px-4 py-4 border-b border-gray-50 transition-colors ${
                  isActive ? 'bg-teal-50/50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Profile Image */}
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <img src="/logo.jpg" alt="logo" className="w-6 h-6 opacity-50 grayscale" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-bold text-[14px] truncate pr-2 ${isActive ? 'text-teal-700' : 'text-gray-900'}`}>
                      {room.otherPartyName || room.clinicName}
                    </h3>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {room.time && room.time.length > 10 ? new Date(room.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : room.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[12px] truncate pr-2 ${room.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {room.lastMessage}
                    </p>
                    {room.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Main Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#F5F6F8]">
        {/* Chat Header */}
        <div className="h-14 px-5 bg-white/90 backdrop-blur-md flex items-center justify-between border-b border-gray-200 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="logo" className="w-5 h-5 opacity-50 grayscale" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-[16px] text-gray-900 leading-tight">{clinicName}</h1>
              <span className="text-[11px] text-teal-600 font-medium">보통 10분 내 응답</span>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 scroll-smooth">
          <div className="flex justify-center my-2">
            <span className="bg-gray-200/70 text-gray-500 text-[11px] px-3 py-1 rounded-full font-medium">
              2026년 6월 27일 토요일
            </span>
          </div>

          {/* Chat Messages */}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col gap-1 max-w-[75%] ${isMine ? 'items-end self-end' : 'items-start self-start'}`}>
                <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Bubble */}
                  {msg.image_url ? (
                     <div className="rounded-md overflow-hidden shadow-sm border border-gray-200 bg-gray-100 max-w-full">
                       <img src={msg.image_url} alt="attached" className="w-full h-auto object-cover" />
                     </div>
                  ) : (
                    <div className={`px-4 py-3 rounded-lg shadow-sm text-[14px] leading-relaxed break-words ${
                      isMine 
                        ? 'bg-teal-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                  
                  {/* Time and Unread */}
                  <div className={`flex flex-col mb-1 ${isMine ? 'items-end' : 'items-start'}`}>
                    {isMine && msg.is_read === 0 && (
                      <span className="text-[11px] text-teal-600 font-bold leading-none mb-0.5">1</span>
                    )}
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input Box */}
        <div className="bg-white border-t border-gray-200 shrink-0 relative">
          {showAttachMenu && (
            <div className="absolute bottom-full left-0 right-0 flex items-center gap-6 px-6 py-4 border-b border-t border-gray-100 bg-gray-50/95 backdrop-blur-sm z-20">
              <button className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:bg-gray-50 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[11px] text-gray-600 font-medium">앨범</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:bg-gray-50 transition-colors">
                  <Camera className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[11px] text-gray-600 font-medium">카메라</span>
              </button>
            </div>
          )}

          <div className="px-4 py-3 flex items-end gap-3 z-10 relative bg-white">
            <button 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 shrink-0 text-gray-500 hover:text-gray-700 bg-gray-50 rounded-full transition-colors mb-0.5"
            >
              <Plus className={`w-5 h-5 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
            </button>
            
            <form onSubmit={handleSend} className="flex flex-1 items-end bg-gray-100 rounded-lg border border-gray-200 px-4 py-2 min-h-[48px] focus-within:ring-1 focus-within:ring-teal-500 transition-shadow">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요."
                className="flex-1 bg-transparent text-[14px] text-gray-900 focus:outline-none resize-none max-h-32 min-h-[24px] py-1"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                className={`p-1.5 ml-2 mb-0.5 rounded-full shrink-0 transition-colors ${
                  message.trim() ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700' : 'bg-transparent text-gray-400'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}
