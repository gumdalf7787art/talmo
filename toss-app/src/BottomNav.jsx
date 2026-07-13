import React from 'react';
import { Home, ScanFace, ClipboardList } from 'lucide-react';

export default function BottomNav({ currentView, onNavigate }) {
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
        onClick={() => onNavigate('show_history_modal')}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
      >
        <ClipboardList size={22} color="#9ca3af" />
        <span style={{ fontSize: '10px', fontWeight: currentView === 'history' ? 'bold' : 'normal', color: currentView === 'history' ? 'var(--talmo-green)' : '#9ca3af', whiteSpace: 'nowrap' }}>분석결과 보기</span>
      </div>

    </div>
  );
}
