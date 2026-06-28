"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MoreVertical, Heart, MessageCircle, Share2, Send } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCPostDetail from "@/components/pc/PCPostDetail";

function PostDetailContent() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setLoggedInUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (isInputFocused) {
      setTimeout(() => {
        if (commentsEndRef.current) {
          commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Wait for keyboard animation
    }
  }, [isInputFocused]);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/posts/detail?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPost(data.post);
          setComments(data.comments || []);
        }
      })
      .catch(err => console.error("Failed to fetch post:", err))
      .finally(() => setLoading(false));
  }, [id]);

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
          postId: id,
          userId: userId,
          content: comment
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setComment("");
        // Format time for the new comment
        const newComment = {
          id: data.comment.id,
          author: data.comment.author || "익명 사용자",
          authorImage: data.comment.authorImage,
          time: "방금 전",
          content: data.comment.content,
          isAuthor: false, // Assume false for immediate UI update unless checked
          userId: userId
        };
        setComments([...comments, newComment]);
        // Update post comment count
        setPost(prev => ({ ...prev, comments: prev.comments + 1 }));
        
        // Scroll to the new comment
        setTimeout(() => {
          if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        alert(data.error || "댓글 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    router.push(`/write?id=${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch('/api/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, userId: loggedInUserId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("게시글이 삭제되었습니다.");
        router.push("/community");
      } else {
        alert(data.error || "게시글 삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch('/api/posts/comment-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId: loggedInUserId, postId: id })
      });
      const data = await res.json();
      if (data.success) {
        setComments(comments.filter(c => c.id !== commentId));
        setPost(prev => ({ ...prev, comments: Math.max(0, prev.comments - 1) }));
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleCommentEditSave = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch('/api/posts/comment-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId: loggedInUserId, content: editContent })
      });
      const data = await res.json();
      if (data.success) {
        setComments(comments.map(c => c.id === commentId ? { ...c, content: editContent } : c));
        setEditingCommentId(null);
        setEditContent("");
      } else {
        alert(data.error || "수정에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  if (isPC) return <PCPostDetail post={post} comments={comments} loading={loading} setComments={setComments} setPost={setPost} loggedInUserId={loggedInUserId} handleEdit={handleEdit} handleDelete={handleDelete} />;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="text-gray-500">게시글을 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="text-gray-500">게시글을 찾을 수 없습니다.</div>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="w-full bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-base text-gray-900">게시글</h1>
        <div className="flex items-center gap-1 -mr-1">
          {loggedInUserId && loggedInUserId === post.authorId && (
            <>
              <button onClick={handleEdit} className="text-xs font-medium text-gray-500 hover:text-gray-900 px-2 py-1">수정</button>
              <button onClick={handleDelete} className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1">삭제</button>
            </>
          )}
          <button className="p-1 text-gray-700">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-[70px]">
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
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm overflow-hidden shrink-0">
                {post.authorImage ? (
                  <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  post.author.charAt(0)
                )}
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
          <div 
            className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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
                <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-500 font-bold text-xs overflow-hidden">
                  {c.authorImage ? (
                    <img src={c.authorImage} alt={c.author} className="w-full h-full object-cover" />
                  ) : (
                    c.author.charAt(0)
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.author}</span>
                    {c.isAuthor && (
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">작성자</span>
                    )}
                    <span className="text-[11px] text-gray-400">{c.time}</span>
                    <div className="flex-1"></div>
                    {loggedInUserId && c.userId === loggedInUserId && (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingCommentId(c.id); setEditContent(c.content); }} className="text-[11px] text-gray-400 hover:text-gray-600">수정</button>
                        <button onClick={() => handleCommentDelete(c.id)} className="text-[11px] text-gray-400 hover:text-red-500">삭제</button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === c.id ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-teal-500" rows={2} />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingCommentId(null)} className="text-xs px-3 py-1.5 text-gray-500 bg-gray-100 rounded-md">취소</button>
                        <button onClick={() => handleCommentEditSave(c.id)} className="text-xs px-3 py-1.5 text-white bg-teal-600 rounded-md">저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[14px] text-gray-800 leading-snug">{c.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} className="h-4" />
          </div>
        </div>
      </main>

      {/* Sticky Comment Input */}
      <div 
        className="fixed left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2 max-w-md mx-auto z-[60] transition-all duration-200"
        style={{ bottom: isInputFocused ? '0px' : 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
      >
        <form onSubmit={handleCommentSubmit} className="flex flex-1 items-center bg-gray-100 rounded-full pr-1.5 pl-4 py-1.5">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
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

export default function PostDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="text-gray-500">페이지를 불러오는 중입니다...</div>
      </div>
    }>
      <PostDetailContent />
    </Suspense>
  );
}
