"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, Eye, ThumbsUp, ImageIcon, Bookmark as BookmarkIcon } from "lucide-react";
import Link from "next/link";

export default function MyBookmarksPage() {
  const router = useRouter();

  // Mock data for user's bookmarked posts
  const posts = [
    {
      id: 3,
      title: "강남/서초 지역 모발이식 병원 발품 후기 요약",
      content: "총 5군데 다녀왔고, 각 병원별 장단점 및 견적 정리해봤습니다. 도움 되시길 바랍니다.",
      category: "병원후기",
      time: "1주일 전",
      views: 5230,
      likes: 120,
      comments: 45,
      hasImage: false,
    },
    {
      id: 4,
      title: "바르는 미녹시딜 1년 사용 전후 사진 비교 (효과 대박)",
      content: "매일 아침저녁으로 꾸준히 바른 결과입니다. 잔머리가 엄청 올라왔네요.",
      category: "약물치료",
      time: "2주일 전",
      views: 3100,
      likes: 85,
      comments: 32,
      hasImage: true,
      imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop"
    }
  ];

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
          <span className="flex items-center gap-1"><BookmarkIcon className="w-3.5 h-3.5" /> 보관된 글 <strong>2</strong>건</span>
        </div>

        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link href={`/community/${post.id}`} key={post.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2 relative">
              <div className="absolute top-4 right-4 text-purple-500">
                <BookmarkIcon className="w-5 h-5 fill-current" />
              </div>
              
              <div className="flex items-center gap-2 pr-8">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded">{post.category}</span>
                <span className="text-[12px] text-gray-400">{post.time}</span>
              </div>
              
              <div className="flex gap-4 items-start pr-2">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h3 className="font-bold text-[16px] text-gray-900 leading-tight">
                    {post.title}
                    <span className="text-teal-600 ml-1.5 text-[14px]">[{post.comments}]</span>
                  </h3>
                  <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
                {post.hasImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative mt-1">
                    <img src={post.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/50 p-0.5 rounded text-white backdrop-blur-sm">
                      <ImageIcon className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-[12px] text-gray-400">
                  <Eye className="w-3.5 h-3.5" /> {post.views}
                </div>
                <div className="flex items-center gap-1 text-[12px] text-gray-400">
                  <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                </div>
                <div className="flex items-center gap-1 text-[12px] text-gray-400">
                  <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
