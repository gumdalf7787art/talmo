"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Search, Edit3, Bell, ChevronUp, ChevronDown } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCCommunity() {
  const [activeTab, setActiveTab] = useState("전체");
  const [isNoticeOpen, setIsNoticeOpen] = useState(true);
  const tabs = ["전체", "탈모수다", "리얼후기", "탈모정보", "닥터칼럼"];

  const posts = [
    { id: 1, title: "M자 초기인데 모발이식 견적 봐주세요", content: "사진 첨부합니다. 약은 3개월 먹었습니다...", category: "탈모수다", comments: 12, author: "득모기원", time: "10분 전", views: 234 },
    { id: 2, title: "비절개 3000모 이식 6개월 경과 (사진有)", content: "처음엔 쉐딩 때문에 힘들었는데...", category: "리얼후기", comments: 45, author: "탈모요정", time: "1시간 전", views: 1205, imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100&h=100&fit=crop" },
    { id: 3, title: "미녹시딜 바르는 꿀팁 공유합니다", content: "아침저녁으로 바르는데 떡지지 않게...", category: "탈모정보", comments: 8, author: "머리숱부자", time: "3시간 전", views: 567 },
    { id: 4, title: "M자 헤어라인, 모발이식이 답일까?", content: "수많은 환자를 만나며 느낀 M자 탈모의 해결책...", category: "닥터칼럼", comments: 23, author: "강남 ㅇㅇ의원 김원장", time: "5시간 전", views: 892 },
    { id: 5, title: "절개 vs 비절개 고민중입니다. 조언 부탁드려요", content: "비용 차이가 꽤 나던데 생착률은 비슷한가요?", category: "탈모수다", comments: 34, author: "바람이분다", time: "1일 전", views: 1543 },
    { id: 6, title: "두피문신(SMP) 1년차 부작용 없이 잘 유지중입니다", content: "번짐 현상 걱정했는데 샵 잘 고르면 괜찮네요.", category: "리얼후기", comments: 56, author: "흑채탈출", time: "3일 전", views: 2310, imageUrl: "https://images.unsplash.com/photo-1599552220979-4591a5db4c68?w=100&h=100&fit=crop" },
    { id: 7, title: "여성형 탈모의 원인과 치료적 접근", content: "남성형 탈모와는 다른 양상을 보이는 여성형 탈모의 치료법", category: "닥터칼럼", comments: 15, author: "압구정 ㅇㅇ의원 박원장", time: "06.20", views: 678 },
  ];

  const notices = [
    { id: 101, title: "[필독] 클린한 커뮤니티 이용을 위한 5가지 규칙", date: "06.21" },
    { id: 102, title: "탈모톡 병원 할인 및 브로커 신고 포상금 안내", date: "06.20" },
  ];

  const filteredPosts = activeTab === "전체" ? posts : posts.filter(p => p.category === activeTab);

  const categoryColor = (cat) => {
    switch(cat) {
      case '탈모수다': return 'text-orange-500 bg-orange-50';
      case '리얼후기': return 'text-teal-600 bg-teal-50';
      case '탈모정보': return 'text-blue-500 bg-blue-50';
      case '닥터칼럼': return 'text-indigo-500 bg-indigo-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Search + Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="관심있는 탈모 키워드를 검색해보세요" className="w-full bg-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 transition-shadow" />
          </div>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === tab ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer" onClick={() => setIsNoticeOpen(!isNoticeOpen)}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-sm text-gray-700">공지사항</span>
            </div>
            <button className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              {isNoticeOpen ? "접기" : "펼치기"}
              {isNoticeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {isNoticeOpen && notices.map(notice => (
            <Link key={notice.id} href={`/community/${notice.id}`} className="flex items-center gap-3 py-3 px-5 border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-600 shrink-0">공지</span>
              <span className="text-[14px] font-medium text-gray-800 flex-1 line-clamp-1">{notice.title}</span>
              <span className="text-[12px] text-gray-400 shrink-0">{notice.date}</span>
            </Link>
          ))}
        </div>

        {/* Post Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[80px_1fr_120px_80px_60px] px-5 py-3 bg-gray-50 border-b border-gray-200 text-[13px] font-bold text-gray-500">
            <span>카테고리</span>
            <span>제목</span>
            <span>작성자</span>
            <span className="text-center">조회</span>
            <span className="text-center">댓글</span>
          </div>
          {/* Table Rows */}
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/community/${post.id}`} className="grid grid-cols-[80px_1fr_120px_80px_60px] items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded w-fit ${categoryColor(post.category)}`}>{post.category}</span>
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <h3 className="font-semibold text-gray-900 text-[14px] line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                {post.imageUrl && (
                  <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-200">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <span className="text-[13px] text-gray-500 line-clamp-1">{post.author}</span>
              <span className="text-[13px] text-gray-400 text-center">{post.views?.toLocaleString()}</span>
              <div className="flex items-center justify-center gap-1 text-teal-600 text-[13px] font-bold">
                <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
              </div>
            </Link>
          ))}
        </div>

        {/* Write Button */}
        <div className="flex justify-end">
          <Link href="/write" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
            <Edit3 className="w-4 h-4" /> 글쓰기
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <PCSidebar />
    </div>
  );
}
