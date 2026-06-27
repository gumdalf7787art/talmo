"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bookmark as BookmarkIcon } from "lucide-react";
import Link from "next/link";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCMyBookmarks from "@/components/pc/PCMyBookmarks";

export default function MyBookmarksPage() {
  const router = useRouter();
  const isPC = useMediaQuery("(min-width: 1024px)");

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email) {
        fetch(`/api/posts/list?bookmarkedBy=${encodeURIComponent(parsed.email)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setPosts(data.posts);
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);
  const categoryColor = (cat) => {
    switch(cat) {
      case '탈모수다': return 'text-orange-500';
      case '리얼후기': return 'text-teal-500';
      case '탈모정보': return 'text-blue-500';
      case '닥터칼럼': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  if (isPC) {
    return <PCMyBookmarks posts={posts} isLoading={isLoading} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <header className="sticky top-0 z-50 bg-white flex items-center px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700 mr-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px] text-gray-900">스크랩한 글</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4 px-1 text-[13px] text-gray-500">
          <span className="flex items-center gap-1"><BookmarkIcon className="w-3.5 h-3.5" /> 보관된 글 <strong>{posts.length}</strong>건</span>
        </div>

        <div className="flex flex-col bg-white border-y border-gray-100 mt-2">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">게시글을 불러오는 중입니다...</div>
          ) : posts.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">보관된 게시글이 없습니다.</div>
          ) : (
            posts.map((post) => (
            <Link key={post.id} href={`/community/detail?id=${post.id}`} className="py-3 px-4 border-b border-gray-100 active:bg-gray-50 transition-colors flex items-start gap-2 last:border-b-0 relative pr-10">
              <span className={`text-[11px] font-medium shrink-0 pt-[2px] w-[52px] ${categoryColor(post.category)}`}>
                {post.category}
              </span>
              
              <div className="flex flex-col flex-1 min-w-0 pr-1">
                <h3 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 mb-1.5 pr-2">
                  {post.title}
                  <span className="text-teal-600 font-bold ml-1.5 text-[13px]">[{post.comments || 0}]</span>
                </h3>
                <div className="flex items-center mt-auto">
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <span>{post.author}</span>
                    <span className="text-gray-300">|</span>
                    <span>{post.time || '방금 전'}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              {post.imageUrl && (
                <div className="w-[52px] h-[52px] shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 ml-1">
                  <img src={post.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="absolute top-4 right-4 text-purple-500">
                <BookmarkIcon className="w-4 h-4 fill-current" />
              </div>
            </Link>
          )))}
        </div>
      </main>
    </div>
  );
}
