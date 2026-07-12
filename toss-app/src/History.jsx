import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import BottomNav from './BottomNav';

export default function History({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('전체');

  // 더미 데이터
  const mockHistory = [
    { id: 1, type: '이마/헤어라인', date: '2026. 7. 1.', score: 52, trend: -6, stage1: '진행중', stage2: '중기', img: '/tip_m_hairline.jpg' },
    { id: 2, type: '이마/헤어라인', date: '2026. 6. 30.', score: 58, trend: 6, stage1: '진행중', stage2: '중기', img: '/tip_m_hairline.jpg' },
    { id: 3, type: '이마/헤어라인', date: '2026. 6. 29.', score: 52, trend: -1, stage1: '진행중', stage2: '중기', img: '/tip_m_hairline.jpg' },
    { id: 4, type: '이마/헤어라인', date: '2026. 6. 28.', score: 53, trend: 0, stage1: '진행중', stage2: '중기', img: '/tip_m_hairline.jpg' },
  ];

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', padding: 0, paddingBottom: '65px' }}>
      
      {/* 헤더 */}
      <header style={{ 
        display: 'flex', alignItems: 'center', height: '60px', padding: '0 16px', 
        backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 
      }}>
        <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-8px' }}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0 8px' }}>AI 분석 기록 모아보기</h1>
      </header>

      {/* 상단 초록색 점수 배너 */}
      <div style={{ backgroundColor: '#0f9c89', padding: '24px 20px', color: 'white' }}>
        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>최근 분석 점수 (2026. 7. 1.)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1, fontStyle: 'italic' }}>52</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', marginLeft: '4px' }}>/ 100점</span>
          </div>
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '6px 12px', 
            borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
              <polyline points="17 18 23 18 23 12"></polyline>
            </svg>
            지난 검사 대비 -6점
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* 탭 메뉴 */}
        <div style={{ 
          display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px', marginBottom: '24px' 
        }}>
          {['전체', '이마/헤어라인', '정수리/가르마'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, textAlign: 'center', padding: '10px 0', fontSize: '14px', fontWeight: 'bold',
                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#0f9c89' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* 차트 영역 */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>점수 변화 추이</h2>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>최근 분석된 시계열 데이터</div>
          
          {/* 심플 SVG 차트 (더미) */}
          <div style={{ position: 'relative', height: '180px', width: '100%' }}>
            {/* Y축 라벨 */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', fontWeight: 'bold' }}>
              <span>92</span><span>75</span><span>55</span><span>35</span><span>15</span>
            </div>
            {/* 그리드 라인 */}
            <div style={{ position: 'absolute', left: '24px', right: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ width: '100%', borderTop: '1px dashed #e5e7eb' }}></div>
              ))}
            </div>
            {/* 차트 패스 */}
            <div style={{ position: 'absolute', left: '24px', right: 0, top: 0, bottom: '20px' }}>
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f9c89" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0f9c89" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 Q5,70 8,90 T15,20 T22,90 T30,60 T38,55 T45,90 T55,60 T60,60 T65,80 T70,60 T75,60 T80,55 T83,20 T87,60 T92,50 T97,60 T100,65 L100,100 L0,100 Z" fill="url(#chartGrad)" />
                <path d="M0,70 Q5,70 8,90 T15,20 T22,90 T30,60 T38,55 T45,90 T55,60 T60,60 T65,80 T70,60 T75,60 T80,55 T83,20 T87,60 T92,50 T97,60 T100,65" fill="none" stroke="#0f9c89" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* X축 라벨 */}
            <div style={{ position: 'absolute', left: '24px', right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', fontWeight: 'bold' }}>
              <span>6.29</span><span>6.29</span><span>6.30</span><span>6.30</span><span>7.1</span>
            </div>
          </div>
        </div>

        {/* 리스트 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Calendar size={18} color="#4b5563" />
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#4b5563' }}>나의 두피 변화 기록</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockHistory.map(item => (
            <div key={item.id} style={{ 
              backgroundColor: 'white', borderRadius: '16px', padding: '16px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', alignItems: 'center'
            }}>
              {/* 이미지 */}
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f3f4f6' }}>
                <img src={item.img} alt="분석 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* 내용 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f9c89' }}>{item.type}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: item.trend < 0 ? '#ef4444' : '#10b981', fontWeight: '900', fontSize: '16px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {item.trend < 0 ? (
                        <>
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                          <polyline points="17 18 23 18 23 12"></polyline>
                        </>
                      ) : (
                        <>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </>
                      )}
                    </svg>
                    {item.score}점
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fecaca', color: '#ef4444', backgroundColor: '#fef2f2' }}>
                    상황: {item.stage1}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fed7aa', color: '#f97316', backgroundColor: '#fff7ed' }}>
                    상태: {item.stage2}
                  </span>
                </div>
                
                <div style={{ fontSize: '13px', color: '#0f9c89', fontWeight: '600', marginTop: '2px' }}>
                  상세 리포트 보기 →
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <BottomNav currentView="history" onNavigate={onNavigate} />
    </div>
  );
}
