"use client";

import { useState, useEffect } from "react";
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
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (!user || !params.id) return;
    const fetchMessages = () => {
      fetch(`/api/chat/messages?userId=${user.id}&clinicId=${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setMessages(data.messages);
        });
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, params.id]);

  // Mock clinic data (In a real app, fetch based on params.id)
  const clinicName = params.id === "2" ? "블랙라인 스튜디오" : "모프로 탈모의원";

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    const textToSend = message;
    setMessage("");

    setMessages(prev => [...prev, {
      id: "temp-" + Date.now(),
      sender_id: user.id,
      content: textToSend,
      created_at: new Date().toISOString()
    }]);

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          clinicId: params.id,
          senderId: user.id,
          content: textToSend
        })
      });
    } catch (err) {
      console.error(err);
    }
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

        {/* Chat Messages */}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex flex-col gap-1 max-w-[75%] ${isMine ? 'items-end self-end' : 'items-start self-start'}`}>
              {msg.image_url ? (
                 <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 max-w-[60%]">
                   <img src={msg.image_url} alt="attached" className="w-full h-auto object-cover" />
                 </div>
              ) : (
                <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-[14px] leading-snug ${
                  isMine 
                    ? 'bg-teal-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              )}
              <span className="text-[10px] text-gray-400 mt-0.5">
                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
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
