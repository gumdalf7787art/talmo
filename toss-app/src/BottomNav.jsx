import React, { useState } from 'react';
import { Home, ScanFace, ClipboardList } from 'lucide-react';

export default function BottomNav({ currentView, onNavigate }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: '58px',
      backgroundColor: 'white',
      borderTop: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      zIndex: 100,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      
      {/* 커뮤니티 (홈 화면) */}
      <div 
        onClick={() => onNavigate('home')}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
      >
        <Home size={22} color={currentView === 'home' ? 'var(--talmo-green)' : '#9ca3af'} />
        <span style={{ fontSize: '10px', fontWeight: currentView === 'home' ? 'bold' : 'normal', color: currentView === 'home' ? 'var(--talmo-green)' : '#9ca3af' }}>커뮤니티</span>
      </div>

      {/* 중앙 AI 분석 튀어나온 버튼 */}
      <div 
        onClick={() => onNavigate('analysis')}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative', height: '100%', justifyContent: 'flex-end', paddingBottom: '6px' }}
      >
        <div style={{
          position: 'absolute',
          top: '-20px',
          backgroundColor: 'var(--talmo-green)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)',
          border: '3px solid white',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <ScanFace size={24} color="white" />
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-main)', fontWeight: 'bold' }}>Ai 탈모 분석</span>
      </div>

      {/* 기록보기 (본진으로 이동) */}
      <div 
        onClick={() => setShowModal(true)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
      >
        <ClipboardList size={22} color="#9ca3af" />
        <span style={{ fontSize: '10px', fontWeight: currentView === 'history' ? 'bold' : 'normal', color: currentView === 'history' ? 'var(--talmo-green)' : '#9ca3af', whiteSpace: 'nowrap' }}>분석결과 보기</span>
      </div>

    {/* 외부 링크 이동 확인 모달 */}
    {showModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '320px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px 20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>탈모톡 본 페이지로 이동</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '24px' }}>
            분석 결과를 모아서 보기 기능은 <strong style={{ color: 'var(--talmo-green)' }}>탈모톡</strong>에서 가능합니다.<br/>
            탈모톡으로 옮겨집니다.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              그냥 있기
            </button>
            <button 
              onClick={() => {
                setShowModal(false);
                window.open('https://talmotalk.com/diagnosis-history', '_blank');
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
