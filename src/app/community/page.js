"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Search, Edit3, Bell, ChevronUp, ChevronDown } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCCommunity from "@/components/pc/PCCommunity";

export default function CommunityPage() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const [activeTab, setActiveTab] = useState("전체");
  const [isNoticeOpen, setIsNoticeOpen] = useState(true);
  
  
  const tabs = ["전체", "탈모수다", "리얼후기", "탈모정보", "닥터칼럼"];
  
  const posts = [
    { id: 1, title: "M자 초기인데 모발이식 견적 봐주세요", content: "사진 첨부합니다. 약은 3개월 먹었습니다...", category: "탈모수다", comments: 12, author: "득모기원", time: "10분 전" },
    { id: 2, title: "비절개 3000모 이식 6개월 경과 (사진有)", content: "처음엔 쉐딩 때문에 힘들었는데 지금은 아주 만족합니다...", category: "리얼후기", comments: 45, author: "탈모요정", time: "1시간 전", imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100&h=100&fit=crop" },
    { id: 3, title: "미녹시딜 바르는 꿀팁 공유합니다", content: "아침저녁으로 바르는데 떡지지 않게 바르는 방법입니다...", category: "탈모정보", comments: 8, author: "머리숱부자", time: "3시간 전" },
    { id: 4, title: "M자 헤어라인, 모발이식이 답일까?", content: "수많은 환자를 만나며 느낀 M자 탈모의 해결책...", category: "닥터칼럼", comments: 23, author: "강남 ㅇㅇ의원 김원장", time: "5시간 전" },
    { id: 5, title: "절개 vs 비절개 고민중입니다. 조언 부탁드려요", content: "비용 차이가 꽤 나던데 생착률은 비슷한가요?", category: "탈모수다", comments: 34, author: "바람이분다", time: "1일 전" },
    { id: 6, title: "두피문신(SMP) 1년차 부작용 없이 잘 유지중입니다", content: "번짐 현상 걱정했는데 샵 잘 고르면 괜찮네요.", category: "리얼후기", comments: 56, author: "흑채탈출", time: "3일 전", imageUrl: "https://images.unsplash.com/photo-1599552220979-4591a5db4c68?w=100&h=100&fit=crop" },
    { id: 7, title: "여성형 탈모의 원인과 치료적 접근", content: "남성형 탈모와는 다른 양상을 보이는 여성형 탈모의 치료법", category: "닥터칼럼", comments: 15, author: "압구정 ㅇㅇ의원 박원장", time: "06.20" },
  ];

  const filteredPosts = activeTab === "전체" ? posts : posts.filter(p => p.category === activeTab);

  const notices = [
    { id: 101, title: "[필독] 클린한 커뮤니티 이용을 위한 5가지 규칙", date: "06.21" },
    { id: 102, title: "탈모톡 병원 할인 및 브로커 신고 포상금 안내", date: "06.20" }
  ];

  if (isPC) return <PCCommunity />;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 검색 및 탭 */}
      <div className="bg-white sticky top-[56px] z-40 border-b border-gray-100 pb-2">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="관심있는 탈모 키워드를 검색해보세요" 
              className="w-full bg-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 transition-shadow"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center px-3 w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold whitespace-nowrap transition-colors flex-1 mx-0.5 ${
                activeTab === tab 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 공지사항 */}
      <div className="bg-white">
        <div 
          className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-y border-gray-200 cursor-pointer"
          onClick={() => setIsNoticeOpen(!isNoticeOpen)}
        >
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-bold text-xs text-gray-700">공지사항</span>
          </div>
          <button className="flex items-center gap-0.5 text-[11px] text-gray-400 font-medium">
            {isNoticeOpen ? "접기" : "펼치기"}
            {isNoticeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
        
        {isNoticeOpen && (
          <div className="flex flex-col bg-gray-100 pb-1">
            {notices.map(notice => (
              <Link key={notice.id} href={`/community/${notice.id}`} className="flex items-center gap-2.5 py-2.5 px-4 border-b border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 shrink-0">공지</span>
                <span className="text-[13.5px] font-medium text-gray-800 flex-1 line-clamp-1">{notice.title}</span>
                <span className="text-[11px] text-gray-400 shrink-0">{notice.date}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      <div className="flex flex-col bg-white">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`} className="py-3 px-4 border-b border-gray-100 active:bg-gray-50 transition-colors flex items-start gap-2">
            <span className={`text-[11px] font-medium shrink-0 pt-[2px] w-[52px] ${
              post.category === '탈모수다' ? 'text-orange-500' :
              post.category === '리얼후기' ? 'text-teal-500' :
              post.category === '탈모정보' ? 'text-blue-500' :
              'text-indigo-500'
            }`}>
              {post.category}
            </span>
            
            <div className="flex flex-col flex-1 min-w-0 pr-1">
              <h3 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 mb-1.5">
                {post.title}
                <span className="text-teal-600 font-bold ml-1.5 text-[13px]">[{post.comments}]</span>
              </h3>
              <div className="flex items-center mt-auto">
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <span>{post.author}</span>
                  <span className="text-gray-300">|</span>
                  <span>{post.time}</span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            {post.imageUrl && (
              <div className="w-[52px] h-[52px] shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 ml-1">
                <img src={post.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* 글쓰기 플로팅 버튼 */}
      <Link href="/write" className="fixed bottom-20 right-4 h-12 bg-teal-600 rounded-full flex items-center gap-2 px-5 text-white shadow-[0_4px_12px_rgba(13,148,136,0.3)] active:bg-teal-700 transition-all z-50">
        <Edit3 className="w-4 h-4" />
        <span className="font-bold text-[14px]">글쓰기</span>
      </Link>
    </div>
  );
}
