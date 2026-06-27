"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Search, Edit3, Bell, ChevronUp, ChevronDown } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCCommunity from "@/components/pc/PCCommunity";

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPC = useMediaQuery("(min-width: 1024px)");
  const initialTab = searchParams.get('category') || "전체";
  
  const [activeTab, setActiveTab] = useState(initialTab || "전체");
  const [isNoticeOpen, setIsNoticeOpen] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const tabs = ["전체", "탈모수다", "리얼후기", "탈모정보", "닥터칼럼"];

  useEffect(() => {
    fetch('/api/posts/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error("Failed to fetch posts:", err))
      .finally(() => setLoading(false));
  }, []);
  


  const filteredPosts = activeTab === "전체" ? posts : posts.filter(p => p.category === activeTab);

  const notices = [
    { id: 101, title: "[필독] 클린한 커뮤니티 이용을 위한 5가지 규칙", date: "06.21" },
    { id: 102, title: "탈모톡 병원 할인 및 브로커 신고 포상금 안내", date: "06.20" }
  ];

  if (isPC) return <PCCommunity initialTab={initialTab || "전체"} />;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 검색 및 탭 */}
      <div className="bg-white sticky top-[56px] z-40 border-b border-gray-100 pb-2">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
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
        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">목록을 불러오는 중입니다...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">등록된 게시글이 없습니다.</div>
        ) : filteredPosts.map((post) => (
          <Link key={post.id} href={`/community/detail?id=${post.id}`} className="py-3 px-4 border-b border-gray-100 active:bg-gray-50 transition-colors flex items-start gap-2">
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

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">로딩 중...</div>}>
      <CommunityContent />
    </Suspense>
  );
}
