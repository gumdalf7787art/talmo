"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical, Heart, MessageCircle, Share2, Send } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCPostDetail from "@/components/pc/PCPostDetail";

export default function PostDetailPage() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");

  // Mock Data
  const post = {
    category: "리얼후기",
    title: "비절개 3000모 이식 6개월 경과 (사진有)",
    author: "탈모요정",
    time: "1시간 전",
    views: 128,
    content: `벌써 수술한 지 6개월이 지났네요. 처음에는 암흑기(쉐딩) 때문에 거울 볼 때마다 정말 우울하고 '이게 맞나?' 싶었는데, 4개월 차부터 솜털이 굵어지기 시작하더니 지금은 바람 불어도 당당하게 다닙니다! ㅠㅠ\n\n모프로 의원에서 비절개로 3000모 진행했고요, 원장님이 디자인을 너무 자연스럽게 잘 잡아주셔서 대만족입니다.\n\n약은 프로페시아 꾸준히 먹고 있고 미녹시딜도 꼬박꼬박 바르고 있습니다. 수술 고민하시는 분들 하루라도 빨리 하시는 걸 추천드립니다! 질문 있으시면 댓글 달아주세요~`,
    likes: 45,
    comments: 12
  };

  const comments = [
    { id: 1, author: "득모기원", time: "50분 전", content: "와 대박이네요! 혹시 비용이 어느 정도 들었는지 쪽지 가능할까요?", isAuthor: false },
    { id: 2, author: "탈모요정", time: "45분 전", content: "득모기원님 쪽지 드렸습니다~ 참고하세요!", isAuthor: true },
    { id: 3, author: "머리숱부자", time: "30분 전", content: "생착률 엄청 좋아보이네요. 축하드립니다!!", isAuthor: false },
  ];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    console.log("Comment submitted:", comment);
    setComment("");
  };

  if (isPC) return <PCPostDetail />;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-base text-gray-900">게시글</h1>
        <button className="p-1 -mr-1 text-gray-700">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-[72px]">
        {/* Post Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <span className="inline-block px-2.5 py-1 mb-3 rounded-md bg-teal-50 text-teal-600 text-xs font-bold">
            {post.category}
          </span>
          <h1 className="text-xl font-bold text-gray-900 leading-snug mb-4">
            {post.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                {post.author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-tight">{post.author}</span>
                <span className="text-[11px] text-gray-400 mt-0.5">{post.time} · 조회 {post.views}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Body */}
        <div className="px-5 py-6 min-h-[200px]">
          {/* Mock Image Placeholder */}
          <div className="w-full h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center border border-gray-200">
            <span className="text-gray-400 text-sm font-medium">첨부된 이미지 (후기 사진)</span>
          </div>
          <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Actions */}
        <div className="px-5 py-4 flex items-center gap-4 border-b-8 border-gray-50">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
            <span className="text-sm font-medium">{isLiked ? post.likes + 1 : post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          <div className="flex-1"></div>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">공유</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="px-5 py-5">
          <h3 className="font-bold text-gray-900 mb-4">댓글 <span className="text-teal-600">{post.comments}</span></h3>
          <div className="flex flex-col gap-5">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-500 font-bold text-xs">
                  {c.author.charAt(0)}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.author}</span>
                    {c.isAuthor && (
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">작성자</span>
                    )}
                    <span className="text-[11px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-[14px] text-gray-800 leading-snug">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2 max-w-md mx-auto z-50 pb-safe">
        <form onSubmit={handleCommentSubmit} className="flex flex-1 items-center bg-gray-100 rounded-full pr-1.5 pl-4 py-1.5">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="따뜻한 댓글을 남겨주세요."
            className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none py-1.5"
          />
          <button 
            type="submit"
            disabled={!comment.trim()}
            className={`p-1.5 rounded-full transition-colors ${comment.trim() ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
