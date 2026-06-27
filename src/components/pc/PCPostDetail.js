"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Send, ChevronLeft } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCPostDetail() {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");

  const post = {
    category: "리얼후기",
    title: "비절개 3000모 이식 6개월 경과 (사진有)",
    author: "탈모요정",
    time: "1시간 전",
    views: 128,
    content: `벌써 수술한 지 6개월이 지났네요. 처음에는 암흑기(쉐딩) 때문에 거울 볼 때마다 정말 우울하고 '이게 맞나?' 싶었는데, 4개월 차부터 솜털이 굵어지기 시작하더니 지금은 바람 불어도 당당하게 다닙니다! ㅠㅠ\n\n모프로 의원에서 비절개로 3000모 진행했고요, 원장님이 디자인을 너무 자연스럽게 잘 잡아주셔서 대만족입니다.\n\n약은 프로페시아 꾸준히 먹고 있고 미녹시딜도 꼬박꼬박 바르고 있습니다. 수술 고민하시는 분들 하루라도 빨리 하시는 걸 추천드립니다! 질문 있으시면 댓글 달아주세요~`,
    likes: 45,
    comments: 12,
  };

  const comments = [
    { id: 1, author: "득모기원", time: "50분 전", content: "와 대박이네요! 혹시 비용이 어느 정도 들었는지 쪽지 가능할까요?", isAuthor: false },
    { id: 2, author: "탈모요정", time: "45분 전", content: "득모기원님 쪽지 드렸습니다~ 참고하세요!", isAuthor: true },
    { id: 3, author: "머리숱부자", time: "30분 전", content: "생착률 엄청 좋아보이네요. 축하드립니다!!", isAuthor: false },
  ];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComment("");
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-medium w-fit mb-1">
          <ChevronLeft className="w-4 h-4" /> 목록으로
        </button>

        {/* Post Card */}
        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <span className="inline-block px-3 py-1 mb-4 rounded-lg bg-teal-50 text-teal-600 text-sm font-bold">{post.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-5">{post.title}</h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{post.author.charAt(0)}</div>
              <div>
                <span className="text-[15px] font-semibold text-gray-900">{post.author}</span>
                <span className="text-[13px] text-gray-400 ml-3">{post.time} · 조회 {post.views}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <div className="w-full h-64 bg-gray-100 rounded-xl mb-8 flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 text-sm font-medium">첨부된 이미지 (후기 사진)</span>
            </div>
            <p className="text-gray-800 text-[16px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Actions */}
          <div className="px-8 py-4 flex items-center gap-5 border-t border-gray-100">
            <button onClick={() => setIsLiked(!isLiked)} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}>
              <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{isLiked ? post.likes + 1 : post.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </button>
            <div className="flex-1" />
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">공유</span>
            </button>
          </div>
        </article>

        {/* Comments */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h3 className="font-bold text-gray-900 text-lg mb-6">댓글 <span className="text-teal-600">{post.comments}</span></h3>
          <div className="flex flex-col gap-6 mb-8">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm">{c.author.charAt(0)}</div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-gray-900">{c.author}</span>
                    {c.isAuthor && <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">작성자</span>}
                    <span className="text-[12px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-[15px] text-gray-800 leading-snug">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 bg-gray-100 rounded-xl px-5 py-3">
            <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="따뜻한 댓글을 남겨주세요." className="flex-1 bg-transparent text-[15px] text-gray-900 focus:outline-none" />
            <button type="submit" disabled={!comment.trim()} className={`p-2 rounded-full transition-colors ${comment.trim() ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <PCSidebar />
    </div>
  );
}
