"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Heart } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useRouter, useSearchParams } from "next/navigation";
import PCSidebar from "@/components/pc/PCSidebar";

function UserPostsContent() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nickname) {
      setLoading(false);
      return;
    }
    
    fetch(`/api/posts/list?nickname=${encodeURIComponent(nickname)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error("Failed to fetch posts:", err))
      .finally(() => setLoading(false));
  }, [nickname]);

  const categoryColor = (cat) => {
    switch(cat) {
      case '탈모수다': return 'text-orange-500 bg-orange-50';
      case '리얼후기': return 'text-teal-600 bg-teal-50';
      case '탈모정보': return 'text-blue-500 bg-blue-50';
      case '닥터칼럼': return 'text-indigo-500 bg-indigo-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (!nickname) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="text-gray-500 mb-4">잘못된 접근입니다.</div>
        <button onClick={() => router.back()} className="px-4 py-2 bg-teal-600 text-white rounded-lg">돌아가기</button>
      </div>
    );
  }

  const MobileLayout = () => (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full bg-white flex items-center px-4 h-14 border-b border-gray-100 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-base text-gray-900 ml-2">
          {nickname}님의 게시물
        </h1>
      </header>
      
      <div className="flex flex-col bg-white">
        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">목록을 불러오는 중입니다...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <p className="text-sm">작성한 게시글이 없습니다.</p>
          </div>
        ) : posts.map((post) => (
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
                  <span>{post.time}</span>
                  <span className="text-gray-300">|</span>
                  <span>조회 {post.views}</span>
                </div>
              </div>
            </div>
            {post.imageUrl && (
              <div className="w-[52px] h-[52px] shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 ml-1">
                <img src={post.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  const PCLayout = () => (
    <div className="flex gap-6 max-w-[1200px] mx-auto pt-6 px-6">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{nickname}님의 게시물</h1>
            <p className="text-sm text-gray-500 mt-1">총 {posts.length}개의 게시글을 작성했습니다.</p>
          </div>
        </div>

        {/* Post Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-[80px_1fr_80px_60px] px-5 py-3 bg-gray-50 border-b border-gray-200 text-[13px] font-bold text-gray-500">
            <span>카테고리</span>
            <span>제목</span>
            <span className="text-center">조회</span>
            <span className="text-center">댓글</span>
          </div>
          {loading ? (
            <div className="py-20 text-center text-gray-500 text-sm">목록을 불러오는 중입니다...</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 text-sm">등록된 게시글이 없습니다.</div>
          ) : posts.map((post) => (
            <Link key={post.id} href={`/community/detail?id=${post.id}`} className="grid grid-cols-[80px_1fr_80px_60px] items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded w-fit ${categoryColor(post.category)}`}>{post.category}</span>
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <h3 className="font-semibold text-gray-900 text-[14px] line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                {post.imageUrl && (
                  <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-200">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-[12px] text-gray-400 ml-2">{post.time}</span>
              </div>
              <span className="text-[13px] text-gray-400 text-center">{post.views?.toLocaleString()}</span>
              <div className="flex items-center justify-center gap-1 text-teal-600 text-[13px] font-bold">
                <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <PCSidebar />
    </div>
  );

  return isPC ? <PCLayout /> : <MobileLayout />;
}

export default function UserPostsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">로딩 중...</div>}>
      <UserPostsContent />
    </Suspense>
  );
}
