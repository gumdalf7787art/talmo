"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, Edit3, Bell, ChevronUp, ChevronDown } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";
import AuthorPopover from "@/components/common/AuthorPopover";

export default function PCCommunity({ initialTab }) {
  const router = useRouter();
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
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="관심있는 탈모 키워드를 검색해보세요" 
              className="w-full bg-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 transition-shadow" 
            />
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
          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">목록을 불러오는 중입니다...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">등록된 게시글이 없습니다.</div>
          ) : filteredPosts.map((post) => (
            <Link key={post.id} href={`/community/detail?id=${post.id}`} className="grid grid-cols-[80px_1fr_120px_80px_60px] items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded w-fit ${categoryColor(post.category)}`}>{post.category}</span>
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <h3 className="font-semibold text-gray-900 text-[14px] line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                {post.imageUrl && (
                  <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-200">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-start min-w-0 overflow-visible" onClick={e => e.preventDefault()}>
                <AuthorPopover author={post.author} />
              </div>
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
