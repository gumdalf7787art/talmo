import { useState, useEffect } from "react";
import { ArrowLeft, Search, User, Bell, ChevronUp, ChevronDown, PenLine } from "lucide-react";
import BottomNav from "./BottomNav";

export default function BoardList({ initialTab, onNavigate }) {
  const tabs = ["전체", "탈모수다", "리얼후기", "탈모정보", "전문가칼럼"];
  const [activeTab, setActiveTab] = useState(initialTab || "전체");
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noticesExpanded, setNoticesExpanded] = useState(false);

  // Parse relative time
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}달 전`;
    return `${Math.floor(diffInMonths / 12)}년 전`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Fetch notices
    fetch("https://talmotalk.com/api/posts/list?category=공지사항&limit=3")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.posts) {
          setNotices(data.posts);
        }
      })
      .catch(err => console.error("공지사항 로딩 실패:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const apiCategory = activeTab === "전체" ? "all" : activeTab;
    
    fetch(`https://talmotalk.com/api/posts/list?category=${encodeURIComponent(apiCategory)}&limit=30`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.posts || []);
        } else {
          setPosts([]);
        }
      })
      .catch(err => {
        console.error("데이터 로딩 실패:", err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="app-container" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: 0, paddingBottom: '65px', position: 'relative' }}>
      
      {/* 글로벌 헤더 */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'white', 
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '60px', gap: '10px' }}>
          <button 
            onClick={() => onNavigate('home')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={24} color="var(--text-main)" />
          </button>
          
          <div className="logo" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
            <img src="https://talmotalk.pages.dev/logo-mobile.png?v=2" alt="탈모톡 로고" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          
          <div style={{ flex: 1 }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Search size={22} color="#4b5563" />
            <Bell size={22} color="#4b5563" />
            <div onClick={() => onNavigate('history')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <User size={22} color="#4b5563" />
            </div>
          </div>
        </div>

        {/* 탭 바 */}
        <div style={{ display: 'flex', overflowX: 'auto', padding: '12px', gap: '8px', borderBottom: '1px solid #e5e7eb', scrollbarWidth: 'none' }} className="hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '20px',
                border: activeTab === tab ? '1px solid var(--text-main)' : '1px solid #e5e7eb',
                backgroundColor: activeTab === tab ? 'var(--text-main)' : 'white',
                color: activeTab === tab ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 'bold' : '500',
                cursor: 'pointer'
              }}
            >
              {tab === '전문가칼럼' ? '닥터칼럼' : tab}
            </button>
          ))}
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div style={{ backgroundColor: 'white', minHeight: 'calc(100vh - 120px)' }}>
        
        {/* 공지사항 영역 */}
        <div style={{ borderBottom: '8px solid #f3f4f6' }}>
          <div 
            onClick={() => setNoticesExpanded(!noticesExpanded)}
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '16px', cursor: 'pointer', backgroundColor: '#f9fafb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontWeight: '600', fontSize: '14px' }}>
              <Bell size={16} /> 공지사항
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '13px' }}>
              {noticesExpanded ? '접기' : '열기'} 
              {noticesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          
          {noticesExpanded && (
            <div style={{ backgroundColor: '#f9fafb', paddingBottom: '8px' }}>
              {notices.length > 0 ? notices.map((notice, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', alignItems: 'center', padding: '12px 16px', 
                  borderTop: '1px solid #f3f4f6', gap: '12px'
                }}>
                  <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                    공지
                  </span>
                  <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notice.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>
                    {formatDate(notice.created_at)}
                  </div>
                </div>
              )) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f3f4f6', gap: '12px' }}>
                    <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                      공지
                    </span>
                    <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      [필독] 클린한 커뮤니티 이용을 위한 5가지 규칙
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>06.21</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f3f4f6', gap: '12px' }}>
                    <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                      공지
                    </span>
                    <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      탈모톡 병원 할인 및 브로커 신고 포상금 안내
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>06.20</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 게시글 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              데이터를 불러오는 중입니다...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              게시글이 없습니다.
            </div>
          ) : (
            posts.map(post => (
              <div 
                key={post.id} 
                onClick={() => onNavigate('post_detail', post.id)}
                style={{ 
                  display: 'flex', padding: '16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                  gap: '12px', alignItems: 'flex-start'
                }}
              >
                {/* 텍스트 영역 */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ 
                      color: 'var(--toss-blue)', fontSize: '13px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px'
                    }}>
                      {post.category}
                    </span>
                    <h3 style={{ 
                      fontSize: '15px', color: 'var(--text-main)', margin: 0, 
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', fontWeight: '500'
                    }}>
                      {post.title}
                      {post.comments_count > 0 && (
                        <span style={{ color: 'var(--talmo-green)', fontWeight: 'bold', marginLeft: '4px' }}>
                          [{post.comments_count}]
                        </span>
                      )}
                    </h3>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {post.author || '익명'} <span style={{ color: '#e5e7eb', margin: '0 4px' }}>|</span> {timeAgo(post.created_at)}
                  </div>
                </div>

                {/* 썸네일 */}
                {post.imageUrl && (
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f3f4f6'
                  }}>
                    <img src={post.imageUrl?.startsWith('/') ? `https://talmotalk.com${post.imageUrl}` : post.imageUrl} alt="썸네일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 글쓰기 플로팅 액션 버튼 (FAB) */}
      <button 
        onClick={() => alert('글쓰기 기능은 준비 중입니다.')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: 'max(16px, calc(50vw - 224px))', // app-container max-width 480px 고려
          backgroundColor: 'var(--talmo-green)',
          color: 'white',
          border: 'none',
          borderRadius: '24px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          cursor: 'pointer',
          zIndex: 40,
          fontWeight: 'bold',
          fontSize: '15px'
        }}
      >
        <PenLine size={18} /> 글쓰기
      </button>

      <BottomNav currentView="board_list" onNavigate={onNavigate} />
    </div>
  );
}
