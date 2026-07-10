import React, { useState, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Heart, MessageCircle, Share2, Send, Search, Bell, User } from 'lucide-react';
import BottomNav from './BottomNav';

export default function PostDetail({ postId, onNavigate }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [showMypageModal, setShowMypageModal] = useState(false);

  // 로그인된 유저 ID (현재 미니앱은 게스트 환경이므로 하드코딩하거나 null 처리)
  const currentUserId = null; 

  useEffect(() => {
    // 하드코딩된 전문가 칼럼 클릭 시 가짜 데이터 제공
    if (postId >= 200 && postId <= 204) {
      setPost({
        id: postId,
        title: "전문가 칼럼 상세 내용입니다.",
        category: "전문가 칼럼",
        content: "<p>탈모에 대한 유익한 정보입니다.</p><img src='https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=400&h=300&fit=crop' style='width:100%; border-radius:8px;'/>",
        author: "탈모톡 원장님",
        authorImage: "/logo-v4.jpg",
        authorId: 999,
        time: "1시간 전",
        views: 150,
        comments: 0,
        likes: 12
      });
      setComments([]);
      setLoading(false);
      return;
    }

    fetch(`https://talmotalk.com/api/posts/detail?id=${postId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let content = data.post.content;
          if (content) {
            content = content.replace(/src="\/api\/images\//g, 'src="https://talmotalk.com/api/images/');
          }
          setPost({ ...data.post, content });
          setComments(data.comments || []);
        } else {
          setError(data.error || '게시글을 불러오는데 실패했습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('서버와 통신 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postId]);

  if (loading) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#9ca3af', fontSize: '14px' }}>로딩중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '54px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #f3f4f6' }}>
          <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} color="#1f2937" />
          </button>
        </header>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6b7280' }}>
          {error || '게시글이 존재하지 않습니다.'}
        </div>
      </div>
    );
  }

  const isAuthor = currentUserId !== null && post.authorId === currentUserId;

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', paddingBottom: '125px', padding: 0 }}>
      
      {/* 글로벌 헤더 */}
      <header className="home-header" style={{
        position: 'sticky', top: 0, zIndex: 60, backgroundColor: 'white', 
        borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '60px', gap: '10px' }}>
          <div className="logo" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
            <img src="https://talmotalk.pages.dev/logo-mobile.png?v=2" alt="탈모톡 로고" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="search-bar" style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', 
            border: '2px solid var(--talmo-green)', borderRadius: '25px', padding: '0 12px',
            overflow: 'hidden', height: '34px'
          }}>
            <Search size={16} color="var(--talmo-green)" />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>원장님 닥터칼럼</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Bell size={22} color="#4b5563" />
            <div onClick={() => setShowMypageModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <User size={22} color="#4b5563" />
            </div>
          </div>
        </div>
      </header>

      {/* 서브 헤더 (게시글) */}
      <header style={{ 
        height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '0 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fff',
        position: 'sticky', top: '60px', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '33%' }}>
          <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={24} color="#1f2937" />
          </button>
        </div>
        <div style={{ width: '33%', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
          게시글
        </div>
        <div style={{ width: '33%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          {isAuthor && (
            <>
              <button style={{ background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', padding: 0, cursor: 'pointer' }}>수정</button>
              <button style={{ background: 'none', border: 'none', fontSize: '13px', color: '#ef4444', padding: 0, cursor: 'pointer' }}>삭제</button>
            </>
          )}
          <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <MoreVertical size={20} color="#1f2937" />
          </button>
        </div>
      </header>

      <div style={{ padding: '20px 16px' }}>
        {/* 카테고리 뱃지 */}
        <div style={{ 
          display: 'inline-block', backgroundColor: '#eafffa', color: 'var(--talmo-green)', 
          fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', marginBottom: '12px' 
        }}>
          {post.category}
        </div>

        {/* 제목 */}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', lineHeight: '1.4' }}>
          {post.title}
        </h1>

        {/* 작성자 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {post.authorImage ? (
              <img src={post.authorImage} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'bold' }}>{post.author.charAt(0)}</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '2px' }}>{post.author}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{post.time} · 조회 {post.views}</div>
          </div>
        </div>

        {/* 본문 (HTML 렌더링) */}
        <div 
          className="post-content-html"
          style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6', wordBreak: 'break-word', marginBottom: '32px' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* 인터랙션 바 (좋아요, 댓글 수, 공유) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '8px solid #f9fafb', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', padding: 0 }}>
            <Heart size={20} strokeWidth={1.5} />
            {post.likes || 0}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', padding: 0 }}>
            <MessageCircle size={20} strokeWidth={1.5} />
            {post.comments || 0}
          </button>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', padding: 0 }}>
          <Share2 size={18} strokeWidth={1.5} />
          공유
        </button>
      </div>

      {/* 댓글 영역 */}
      <div style={{ padding: '20px 16px', flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          댓글 <span style={{ color: 'var(--talmo-green)' }}>{post.comments || 0}</span>
        </h3>
        
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', padding: '40px 0' }}>
            등록된 댓글이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {comment.authorImage ? (
                    <img src={comment.authorImage} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>{comment.author.charAt(0)}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>{comment.author}</span>
                    {comment.isAuthor && <span style={{ fontSize: '10px', color: 'var(--talmo-green)', border: '1px solid var(--talmo-green)', padding: '1px 4px', borderRadius: '4px' }}>작성자</span>}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4', marginBottom: '6px' }}>{comment.content}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{comment.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 고정 댓글 입력창 */}
      <div style={{ 
        position: 'fixed', bottom: '58px', // 하단 메뉴바 위로 올림
        width: '100%', maxWidth: '480px', // app-container 너비에 맞춤
        backgroundColor: '#fff', borderTop: '1px solid #f3f4f6', 
        padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', gap: '10px', zIndex: 90
      }}>
        <div style={{ 
          flex: 1, backgroundColor: '#f3f4f6', borderRadius: '20px', 
          display: 'flex', alignItems: 'center', padding: '8px 16px' 
        }}>
          <input 
            type="text" 
            placeholder="따뜻한 댓글을 남겨주세요." 
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            style={{ 
              border: 'none', background: 'transparent', outline: 'none', 
              width: '100%', fontSize: '14px', color: '#1f2937' 
            }}
          />
        </div>
        <button style={{ 
          background: 'none', border: 'none', width: '36px', height: '36px', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: commentInput.trim() ? 'var(--talmo-green)' : '#e5e7eb',
          cursor: commentInput.trim() ? 'pointer' : 'default',
          transition: 'background-color 0.2s'
        }}>
          <Send size={16} color={commentInput.trim() ? '#fff' : '#9ca3af'} style={{ marginLeft: '-2px', marginTop: '2px' }} />
        </button>
      </div>

      {/* 하단 네비게이션 메뉴바 */}
      <BottomNav currentView="post_detail" onNavigate={onNavigate} />

      {/* 마이페이지 이동 확인 모달 */}
      {showMypageModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '320px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>탈모톡 본 페이지로 이동</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '24px' }}>
              마이페이지 기능은 <strong style={{ color: 'var(--talmo-green)' }}>탈모톡</strong>에서 가능합니다.<br/>
              탈모톡으로 옮겨집니다.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowMypageModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                그냥 있기
              </button>
              <button 
                onClick={() => {
                  setShowMypageModal(false);
                  window.open('https://talmotalk.com/my-page', '_blank');
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--talmo-green)', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                탈모톡 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
