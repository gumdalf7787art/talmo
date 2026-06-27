"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, Eye, ThumbsUp, ImageIcon } from "lucide-react";
import Link from "next/link";

export default function MyPostsPage() {
  const router = useRouter();

  // Mock data for user's posts
  const posts = [
    {
      id: 1,
      title: "M자 3000모 이식 6개월차 후기입니다.",
      content: "벌써 이식한지 6개월이 지났네요. 암흑기 지나고 나니 하루하루 다르게 풍성해지는게 느껴집니다...",
      category: "모발이식",
      time: "2시간 전",
      views: 1205,
      likes: 45,
      comments: 12,
      hasImage: true,
      imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      title: "피나스테리드 3개월째인데 쉐딩현상 언제 끝나나요?",
      content: "약 먹기 시작한지 3개월차인데 오히려 머리가 더 빠지는 것 같아서 스트레스네요. 보통 언제쯤 멈추나요?",
      category: "약물치료",
      time: "2일 전",
      views: 890,
      likes: 5,
      comments: 24,
      hasImage: false,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <header className="sticky top-0 z-50 bg-white flex items-center px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700 mr-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px] text-gray-900">내가 작성한 글</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4 px-1 text-[13px] text-gray-500">
          <span>총 <strong>2</strong>건</span>
        </div>

        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link href={`/community/detail?id=${post.id}`} key={post.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded">{post.category}</span>
                <span className="text-[12px] text-gray-400">{post.time}</span>
              </div>
              
              <div className="flex gap-4 items-start">
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
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
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
