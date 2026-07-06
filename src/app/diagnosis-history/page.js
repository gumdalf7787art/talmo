"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, TrendingDown, TrendingUp, Minus, Activity, AlertCircle, Search } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCDiagnosisHistory from "@/components/pc/PCDiagnosisHistory";

function DiagnosisHistoryContent() {
  const router = useRouter();
  const isPC = useMediaQuery("(min-width: 1024px)");
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('전체');

  const filteredHistory = historyList ? historyList.filter(item => {
    if (filterTab === '전체') return true;
    try {
      const details = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
      const type = details?.scanType || '알 수 없음';
      return type === filterTab;
    } catch(e) {
      return false;
    }
  }) : [];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
          alert("로그인이 필요합니다.");
          router.push('/login');
          return;
        }
        const user = JSON.parse(savedUser);
        
        const response = await fetch(`/api/diagnosis-history?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setHistoryList(data);
        } else {
          console.error("Failed to fetch history");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If PC, render the PCDiagnosisHistory layout
  if (isPC) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header (reusing general PC header layout if needed, or simple title) */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-[1000px] mx-auto flex items-center justify-between h-16 px-4">
            <h1 className="font-bold text-xl text-gray-900">AI 분석 기록 모아보기</h1>
            <button onClick={() => router.push('/mypage')} className="text-sm font-medium text-gray-500 hover:text-gray-900">
              마이페이지로 돌아가기
            </button>
          </div>
        </header>
        <div className="flex-1 px-4">
          <PCDiagnosisHistory historyList={historyList} />
        </div>
      </div>
    );
  }

  // Mobile layout
  if (!historyList || historyList.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-[18px] text-gray-900">AI 분석 기록 모아보기</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 pb-20">
          <Activity className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm">AI 분석 기록이 없습니다.</p>
          <Link href="/diagnosis" className="mt-4 px-5 py-2 bg-teal-600 text-white rounded-lg font-bold text-sm">
            새 분석 시작하기
          </Link>
        </div>
      </div>
    );
  }

  const latestScore = filteredHistory[0]?.score || 0;
  const previousScore = filteredHistory.length > 1 ? filteredHistory[1].score : latestScore;
  const diff = latestScore - previousScore;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';

  // Prepare chart data
  const chartData = [...filteredHistory].reverse().map(item => {
    const d = new Date(item.created_at);
    return {
      date: `${d.getMonth() + 1}.${d.getDate()}`,
      score: item.score,
      severity: item.severity,
      fullDate: d.toLocaleDateString()
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 p-2.5 rounded-lg shadow-xl">
          <p className="text-[10px] text-gray-500 mb-0.5">{payload[0].payload.fullDate}</p>
          <p className="text-[14px] font-black text-teal-700">{payload[0].value}점</p>
          <p className="text-[11px] font-bold text-gray-700 mt-0.5">{payload[0].payload.severity}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <header className="sticky top-0 z-50 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-[18px] text-gray-900">AI 분석 기록 모아보기</h1>
        </div>
      </header>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 px-5 py-7">
        <div className="flex justify-between items-end text-white">
          <div className="flex flex-col gap-1.5">
            <span className="text-teal-100 text-[13px] font-medium">최근 분석 점수 ({new Date(historyList[0].created_at).toLocaleDateString()})</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">{latestScore}</span>
              <span className="text-teal-100 text-[15px] font-bold">/ 100점</span>
            </div>
          </div>
          {historyList.length > 1 && (
            <div className="flex flex-col items-end gap-1.5">
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[12px] font-bold text-white flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                {trend === 'same' && <Minus className="w-3.5 h-3.5" />}
                지난 검사 대비 {trend === 'up' ? `+${diff}` : trend === 'down' ? diff : '동일'}점
              </span>
            </div>
          )}
        </div>
      </div>

      {/* History List & Chart */}
      <main className="flex-1 p-4">
        
        {/* Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-4">
          {['전체', '이마/헤어라인', '정수리/가르마'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setFilterTab(tab)}
              className={`flex-1 py-1.5 text-[13px] font-bold rounded-lg transition-all ${filterTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400 mb-5">
            <Search className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-[13px]">해당 부위의 기록이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* Mobile Chart View */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-gray-800 text-[14px]">점수 변화 추이</h4>
              <p className="text-[11px] text-gray-500">최근 분석된 시계열 데이터</p>
            </div>
          </div>
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScoreMob" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScoreMob)" 
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#0f766e' }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3.5 text-gray-600 px-1">
          <Calendar className="w-4 h-4" />
          <h2 className="text-[14px] font-bold">나의 두피 변화 기록</h2>
        </div>

        <div className="flex flex-col gap-3">
          {filteredHistory.map((item) => {
            const details = item.details ? (typeof item.details === 'string' ? JSON.parse(item.details) : item.details) : null;
            
            // Helper to parse severity
            const parseSeverity = (sev) => {
              if (!sev) return { status: "-", level: "-" };
              if (sev.includes("양호")) {
                return { status: "정상", level: "양호" };
              }
              const level = sev.replace("진행:", "").replace("진행", "").replace(":", "").trim();
              return { status: "진행중", level };
            };

            const { status, level } = parseSeverity(item.severity);
            
            // Color styling for status and level
            let statusColor = "bg-gray-100 text-gray-700 border border-gray-200";
            if (status === "진행중") statusColor = "bg-red-50 text-red-600 border border-red-200";
            if (status === "정상") statusColor = "bg-green-50 text-green-600 border border-green-200";

            let levelColor = "bg-gray-100 text-gray-700 border border-gray-200";
            if (level.includes("양호")) levelColor = "bg-green-50 text-green-600 border border-green-200";
            if (level.includes("초기")) levelColor = "bg-yellow-50 text-yellow-600 border border-yellow-200";
            if (level.includes("중기")) levelColor = "bg-orange-50 text-orange-600 border border-orange-200";
            if (level.includes("심각") || level.includes("위험")) levelColor = "bg-red-100 text-red-700 border border-red-300 shadow-sm";

            // Score color based on risk
            let scoreColorClass = "text-red-600";
            if (item.score >= 75) scoreColorClass = "text-emerald-600";
            else if (item.score >= 60) scoreColorClass = "text-amber-600";
            else if (item.score >= 45) scoreColorClass = "text-orange-600";
            
            // Compare with next item to get trend
            const currentIndex = filteredHistory.findIndex(h => h.id === item.id);
            const prevItem = filteredHistory[currentIndex + 1];
            const itemDiff = prevItem ? item.score - prevItem.score : 0;
            const itemTrend = itemDiff > 0 ? 'up' : itemDiff < 0 ? 'down' : 'same';

            return (
              <Link key={item.id} href={`/diagnosis?history=true&id=${item.id}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center transition-transform active:scale-[0.98] cursor-pointer">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                  <img src={item.image_url && item.image_url !== 'placeholder_url' ? item.image_url : "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100&h=100&fit=crop"} alt="분석 사진" className="w-full h-full object-cover" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{details?.scanType || '전체/알 수 없음'}</span>
                    <span className="text-[11px] text-gray-400 font-medium ml-1">{new Date(item.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      {itemTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                      {itemTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-teal-500" />}
                      {itemTrend === 'same' && <Minus className="w-3.5 h-3.5 text-gray-400" />}
                      <span className={`text-[14px] font-black ${scoreColorClass}`}>
                        {item.score}점
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                      상황: {status}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${levelColor}`}>
                      상태: {level}
                    </span>
                    {details?.analysis?.[0] && (
                      <p className="text-[12px] text-gray-500 truncate flex-1 min-w-[120px] ml-1">
                        {details.analysis[0]}
                      </p>
                    )}
                  </div>
                  
                  <button className="text-[11px] text-teal-600 font-bold text-left hover:text-teal-700 w-max">
                    상세 리포트 보기 &rarr;
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function DiagnosisHistoryPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <DiagnosisHistoryContent />
    </Suspense>
  );
}
