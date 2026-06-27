"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Send, ChevronLeft } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCPostDetail({ post, comments, loading, setComments, setPost }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : null;

    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          userId: userId,
          content: comment
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setComment("");
        const newComment = {
          id: data.comment.id,
          author: data.comment.author || "익명 사용자",
          time: "방금 전",
          content: data.comment.content,
          isAuthor: false
        };
        setComments([...comments, newComment]);
        setPost(prev => ({ ...prev, comments: prev.comments + 1 }));
      } else {
        alert(data.error || "댓글 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4 items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500">게시글을 불러오는 중입니다...</div>
        </div>
        <PCSidebar />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4 items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 mb-4">게시글을 찾을 수 없습니다.</div>
          <button onClick={() => router.back()} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            목록으로 돌아가기
          </button>
        </div>
        <PCSidebar />
      </div>
    );
  }

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
            <div 
              className="text-gray-800 text-[16px] leading-relaxed whitespace-pre-wrap post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
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
