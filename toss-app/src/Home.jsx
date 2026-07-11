import { useState, useEffect } from "react";
import { Search, User, Bell, ArrowRight, MessageCircle } from "lucide-react";
import BottomNav from "./BottomNav";

export default function Home({ onNavigate }) {
  const [reviews, setReviews] = useState([]);
  const [infos, setInfos] = useState([]);
  const [talks, setTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchIndex, setSearchIndex] = useState(0);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [showMypageModal, setShowMypageModal] = useState(false);
  const searchTexts = ["탈모 상태 분석하기", "이식/치료 리얼후기", "전문가 칼럼"];

  const columnPhotos = [
    { id: 201, title: "절개 vs 비절개", imageUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=200&h=200&fit=crop" },
    { id: 202, title: "3000모 이식 과정", imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop" },
    { id: 203, title: "이식 후 생착률", imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&h=200&fit=crop" },
    { id: 204, title: "병원 고르는 꿀팁", imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&h=200&fit=crop" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchIndex((prev) => (prev + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch real data from main API (using proxy in dev)
    Promise.all([
      fetch("https://talmotalk.com/api/posts/list?category=리얼후기&limit=8").then(res => res.json()),
      fetch("https://talmotalk.com/api/posts/list?category=탈모정보&limit=8").then(res => res.json()),
      fetch("https://talmotalk.com/api/posts/list?category=탈모수다&limit=8").then(res => res.json())
    ])
    .then(([reviewsData, infosData, talksData]) => {
      if (reviewsData.success) setReviews(reviewsData.posts);
      if (infosData.success) setInfos(infosData.posts);
      if (talksData.success) setTalks(talksData.posts);
    })
    .catch(err => console.error("Failed to fetch data", err))
    .finally(() => setLoading(false));
  }, []);

  const renderFeedSection = (title, items) => {
    return (
      <section className="feed-section" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div>
              {title === '리얼후기' ? '관리 및 이식 ' : ''}
              <span style={{ color: 'var(--talmo-green)' }}>{title}</span>
            </div>
            {title === '전문가 칼럼' && (
              <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>공식</span>
            )}
          </h2>
          <div 
            onClick={() => setShowRedirectModal(true)}
            style={{ fontSize: '11px', color: 'var(--talmo-green)', fontWeight: '600', cursor: 'pointer' }}
          >
            더보기 &gt;
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '14px' }}>불러오는 중...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '14px' }}>게시글이 없습니다.</div>
        ) : (
          <>
            {/* 이미지 있는 글들 */}
            {items.filter(post => post.imageUrl).length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', margin: '0 -12px', paddingLeft: '12px', paddingRight: '12px', scrollbarWidth: 'none' }} className="hide-scrollbar">
                {items.filter(post => post.imageUrl).map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => onNavigate('post_detail', post.id)}
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '0 0 28%', cursor: 'pointer' }}
                  >
                    <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={post.imageUrl?.startsWith('/') ? `https://talmotalk.com${post.imageUrl}` : post.imageUrl} alt="썸네일" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal', lineHeight: '1.4' }}>
                      {post.title}
                    </h3>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 없는 글들 (게시판 목록 형태, 최대 2개) */}
            {items.filter(post => !post.imageUrl).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.filter(post => !post.imageUrl).slice(0, 2).map((post, idx, arr) => (
                  <div 
                    key={post.id} 
                    onClick={() => onNavigate('post_detail', post.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      padding: '4px 0', cursor: 'pointer',
                      borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--talmo-green)', flexShrink: 0 }}></div>
                      <h3 style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                        {post.title}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px', flexShrink: 0, marginLeft: '12px' }}>
                      <MessageCircle size={12} />
                      {post.comments || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: 0, paddingBottom: '65px' }}>
      {/* 탈모톡 모바일 헤더 */}
      <header className="home-header" style={{
        position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'white', 
        borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '60px', gap: '10px' }}>
          <div className="logo" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="https://talmotalk.pages.dev/logo-mobile.png?v=2" alt="탈모톡 로고" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="search-bar" style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', 
            border: '2px solid var(--talmo-green)', borderRadius: '25px', padding: '0 12px',
            overflow: 'hidden', height: '34px'
          }}>
            <Search size={16} color="var(--talmo-green)" />
            <div style={{ height: '18px', overflow: 'hidden', flex: 1, position: 'relative' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', transition: 'transform 0.5s ease-in-out',
                position: 'absolute', width: '100%', top: 0, left: 0,
                transform: `translateY(-${searchIndex * 18}px)`
              }}>
                {searchTexts.map((text, idx) => (
                  <span key={idx} style={{ height: '18px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Bell size={22} color="#4b5563" />
            <div onClick={() => setShowMypageModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <User size={22} color="#4b5563" />
            </div>
          </div>
        </div>
      </header>

      {/* 피드 섹션들 */}
      <div style={{ padding: '12px' }}>
        {renderFeedSection('리얼후기', reviews)}

        {/* 중간 AI 탈모 분석 배너 */}
        <div 
          onClick={() => onNavigate('analysis')}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
            borderRadius: '12px', padding: '20px', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          {/* 텍스트 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9, letterSpacing: '-0.3px' }}>사진 한장으로 분석하는</div>
            <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-1px' }}>
              Ai 탈모 분석
            </div>
          </div>
          
          {/* 바로가기 버튼 */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            padding: '8px 12px', borderRadius: '20px', 
            fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px',
            zIndex: 1, backdropFilter: 'blur(4px)'
          }}>
            바로가기 <span style={{ fontSize: '10px' }}>&gt;</span>
          </div>

          <div style={{ 
            position: 'absolute', right: '140px', top: '50%', transform: 'translateY(-50%)',
            width: '140px', height: '140px', opacity: 0.4, mixBlendMode: 'screen',
            pointerEvents: 'none'
          }}>
            <img src="/ai_scan_head.png" alt="AI Background" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {renderFeedSection('탈모정보', infos)}
        {renderFeedSection('탈모수다', talks)}

        {renderFeedSection('전문가 칼럼', columnPhotos)}
        
        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', marginTop: '12px' }}>
          <a href="https://talmotalk.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'underline' }}>개인정보처리방침</a>
          <div style={{ marginTop: '8px' }}>© TalmoTalk. All rights reserved.</div>
        </div>
      </div>
      <BottomNav currentView="home" onNavigate={onNavigate} />

      {/* 외부 링크 이동 확인 모달 */}
      {showRedirectModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '320px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>탈모톡 본 페이지로 이동</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '24px' }}>
              더 많은 전체 게시글과 전체 기능을 이용하시려면<br/>
              <strong style={{ color: 'var(--talmo-green)' }}>탈모톡 공식 홈페이지</strong>로 이동합니다.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowRedirectModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                그냥 있기
              </button>
              <button 
                onClick={() => {
                  setShowRedirectModal(false);
                  window.open('https://talmotalk.com', '_blank');
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--talmo-green)', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                탈모톡 가기
              </button>
            </div>
          </div>
        </div>
      )}

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
