"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MoreVertical, Send, Image as ImageIcon, Camera } from "lucide-react";

export default function PCHospitalDashboard({ user }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  // Fetch chat rooms
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

  const fetchMessages = async () => {
    if (!activeRoom || !user) return;
    try {
      const res = await fetch(`/api/chat/messages?userId=${activeRoom.otherPartyId}&clinicId=${user.id}&viewerId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  // Fetch messages when a room is selected
  useEffect(() => {
    if (!activeRoom || !user) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeRoom, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;
    
    const textToSend = inputText;
    setInputText(""); // optimistic clear

    // Add optimistic message
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
          userId: activeRoom.otherPartyId, // The patient's ID
          clinicId: user.id, // The hospital's ID
          senderId: user.id,
          content: textToSend
        })
      });
      fetchMessages();
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <div className="w-full h-[800px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
      {/* Left Sidebar: Patients List */}
      <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-[16px] text-gray-900">?곷떞 紐⑸줉</h2>
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
             <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                吏꾪뻾 以묒씤 ?곷떞???놁뒿?덈떎.
             </div>
          ) : (
            chatRooms.map((room) => {
              const isActive = activeRoom?.id === room.id;
              return (
                <button 
                  key={room.id} 
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-4 border-b border-gray-50 transition-colors ${
                    isActive ? 'bg-teal-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                    <img src="/logo.jpg" alt="logo" className="w-6 h-6 opacity-50 grayscale" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`font-bold text-[14px] truncate pr-2 ${isActive ? 'text-teal-700' : 'text-gray-900'}`}>
                        {room.otherPartyName} ?섏옄??
                      </h3>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {new Date(room.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-[12px] truncate pr-2 ${room.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {room.lastMessage || '??붽? ?놁뒿?덈떎.'}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-[#F5F6F8]">
        {!activeRoom ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
             <img src="/logo.jpg" className="w-16 h-16 opacity-20 grayscale" alt="empty" />
             <p>?곷떞???섏옄瑜??좏깮?댁＜?몄슂.</p>
           </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-14 px-5 bg-white/90 backdrop-blur-md flex items-center justify-between border-b border-gray-200 shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h1 className="font-bold text-[16px] text-gray-900 leading-tight">{activeRoom.otherPartyName} ?섏옄??/h1>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 scroll-smooth">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col gap-1 max-w-[75%] ${isMine ? 'items-end self-end' : 'items-start self-start'}`}>
                    <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`px-4 py-3 rounded-lg shadow-sm text-[14px] leading-relaxed break-words ${
                        isMine 
                          ? 'bg-teal-600 text-white rounded-tr-sm' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      
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
              <div className="px-4 py-3 flex items-end gap-3 z-10 relative bg-white">
                <form onSubmit={handleSend} className="flex flex-1 items-end bg-gray-100 rounded-lg border border-gray-200 px-4 py-2 min-h-[48px] focus-within:ring-1 focus-within:ring-teal-500 transition-shadow">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="?섏옄?먭쾶 ?듬????낅젰?섏꽭??"
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
                    disabled={!inputText.trim()}
                    className={`p-1.5 ml-2 mb-0.5 rounded-full shrink-0 transition-colors ${
                      inputText.trim() ? 'bg-teal-600 text-white shadow-sm hover:bg-teal-700' : 'bg-transparent text-gray-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

