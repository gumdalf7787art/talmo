"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCMyPosts from "@/components/pc/PCMyPosts";

export default function MyPostsPage() {
  const router = useRouter();
  const isPC = useMediaQuery("(min-width: 1024px)");

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
    return <PCMyPosts posts={posts} />;
  }

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

        <div className="flex flex-col bg-white border-y border-gray-100 mt-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/community/detail?id=${post.id}`} className="py-3 px-4 border-b border-gray-100 active:bg-gray-50 transition-colors flex items-start gap-2 last:border-b-0">
              <span className={`text-[11px] font-medium shrink-0 pt-[2px] w-[52px] ${categoryColor(post.category)}`}>
                {post.category}
              </span>
              
              <div className="flex flex-col flex-1 min-w-0 pr-1">
                <h3 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 mb-1.5">
                  {post.title}
                  <span className="text-teal-600 font-bold ml-1.5 text-[13px]">[{post.comments || 0}]</span>
                </h3>
                <div className="flex items-center mt-auto">
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <span>{post.time || '방금 전'}</span>
                    <span className="text-gray-300">|</span>
                    <span>조회 {post.views}</span>
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
      </main>
    </div>
  );
}
