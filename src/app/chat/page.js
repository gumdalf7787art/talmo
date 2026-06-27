import { ArrowLeft, MoreVertical, Send, Plus } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-teal-500">강남</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-gray-900">강남 득모의원</span>
              <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
                온라인
              </span>
            </div>
          </div>
        </div>
        <button className="text-gray-500">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div className="text-center text-xs text-gray-400 my-2">
          2026년 6월 26일 금요일
        </div>
        
        {/* User Message */}
        <div className="flex flex-col items-end gap-1">
          <div className="bg-teal-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
            <p className="text-sm">안녕하세요, M자 탈모 초기인 것 같은데 비대면으로 대략적인 모발이식 견적을 받아볼 수 있을까요?</p>
          </div>
          <span className="text-[10px] text-gray-400">오후 2:30</span>
        </div>

        {/* User Image Message */}
        <div className="flex flex-col items-end gap-1">
           <div className="bg-teal-600 text-white p-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
            <div className="w-48 h-48 bg-teal-400 rounded-xl mb-1 flex items-center justify-center">
              <span className="text-xs opacity-70">사진.jpg</span>
            </div>
            <p className="text-sm px-1">위에서 찍은 사진 첨부합니다.</p>
          </div>
          <span className="text-[10px] text-gray-400">오후 2:31</span>
        </div>

        {/* Hospital Message */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full shrink-0"></div>
            <div className="bg-white border border-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
              <p className="text-sm">안녕하세요 고객님! 강남 득모의원입니다. 사진 확인했습니다.</p>
              <p className="text-sm mt-2">M자 라인이 살짝 진행되셨으나 아직 초기이시네요. 대략적으로 1000~1500모 정도 이식이 필요해 보이며, 비용은 약 300~400만원 선으로 예상됩니다. 정확한 진단은 내원 상담을 추천드립니다.</p>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 ml-10">오후 2:45</span>
        </div>
      </div>

      {/* Message Input - adjusted padding to ensure it floats above bottom nav if present */}
      <div className="bg-white border-t border-gray-100 p-3 pb-[80px]">
        <div className="flex items-end gap-2 bg-gray-50 rounded-3xl p-1.5 border border-gray-200 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition-all">
          <button className="p-2 text-gray-400 hover:text-teal-600 transition-colors shrink-0 rounded-full">
            <Plus className="w-5 h-5" />
          </button>
          <textarea 
            rows="1"
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-2.5 resize-none max-h-32"
          ></textarea>
          <button className="p-2.5 bg-teal-600 text-white rounded-full shrink-0 hover:bg-teal-700 transition-colors shadow-sm">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
