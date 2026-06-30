"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCMyPosts({ posts }) {
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
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">
              내가 작성한 글 <span className="text-teal-600 ml-1">{posts.length}</span>
            </h3>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-[80px_1fr_120px_80px_60px] px-5 py-3 bg-gray-50 border-b border-gray-200 text-[13px] font-bold text-gray-500">
            <span>카테고리</span>
            <span>제목</span>
            <span>작성일</span>
            <span className="text-center">조회</span>
            <span className="text-center">댓글</span>
          </div>

          {/* Table Rows */}
          {posts.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">작성한 게시글이 없습니다.</div>
          ) : (
            posts.map((post) => (
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
                <span className="text-[13px] text-gray-500 line-clamp-1">{post.time}</span>
                <span className="text-[13px] text-gray-400 text-center">{post.views?.toLocaleString() || 0}</span>
                <div className="flex items-center justify-center gap-1 text-teal-600 text-[13px] font-bold">
                  <MessageCircle className="w-3.5 h-3.5" /> {post.comments || 0}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Sidebar */}
      <PCSidebar />
    </div>
  );
}
