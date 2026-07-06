"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, Minus, Activity, ArrowRight, Calendar, AlertCircle, Search } from "lucide-react";
import Link from "next/link";
import RadarChart from "../RadarChart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PCDiagnosisHistory({ historyList }) {
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

  if (!historyList || historyList.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-500">
        <Activity className="w-12 h-12 text-gray-300 mb-4" />
        <p>AI 분석 기록이 없습니다.</p>
        <Link href="/diagnosis" className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg font-bold">
          새 분석 시작하기
        </Link>
      </div>
    );
  }

  // Calculate stats
  const latestScore = filteredHistory[0]?.score || 0;
  const previousScore = filteredHistory.length > 1 ? filteredHistory[1].score : latestScore;
  const diff = latestScore - previousScore;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';

  // Prepare chart data (Oldest -> Newest)
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
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 p-3 rounded-lg shadow-xl">
          <p className="text-[12px] text-gray-500 mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-[16px] font-black text-teal-700">{payload[0].value}점</p>
          <p className="text-[12px] font-bold text-gray-700 mt-1">{payload[0].payload.severity}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto py-8">
      {/* Overview Dashboard */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-8 rounded-lg shadow-sm text-white flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <span className="text-teal-100 text-[15px] font-medium">
            최근 분석 점수 ({new Date(historyList[0].created_at).toLocaleDateString()})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tighter">{latestScore}</span>
            <span className="text-teal-100 text-[18px] font-bold">/ 100점</span>
          </div>
        </div>
        
        {historyList.length > 1 && (
          <div className="flex flex-col items-end gap-2 bg-white/10 backdrop-blur-md p-5 rounded-md border border-white/20">
            <span className="text-[13px] text-teal-50 font-medium">이전 분석({new Date(historyList[1].created_at).toLocaleDateString()}) 대비</span>
            <div className={`flex items-center gap-1.5 text-xl font-bold ${trend === 'up' ? 'text-green-300' : trend === 'down' ? 'text-red-300' : 'text-white'}`}>
              {trend === 'up' && <TrendingUp className="w-6 h-6" />}
              {trend === 'down' && <TrendingDown className="w-6 h-6" />}
              {trend === 'same' && <Minus className="w-6 h-6" />}
              <span>{Math.abs(diff)}점 {trend === 'up' ? '상승' : trend === 'down' ? '하락' : '동일'}</span>
            </div>
          </div>
        )}
      </div>

      {/* History Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-500" /> 나의 두피 변화 트렌드</h3>
          
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['전체', '이마/헤어라인', '정수리/가르마'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filterTab === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-gray-400">
            <Search className="w-10 h-10 mb-3 text-gray-300" />
            <p>해당 부위의 분석 기록이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* Chart View */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-gray-800 text-[15px]">AI 점수 변화 추이</h4>
              <p className="text-[12px] text-gray-500">최근 분석된 리포트 점수들의 시계열 변화입니다.</p>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <AlertCircle className="w-4 h-4 text-teal-500" /> 꾸준한 관리로 우상향을 만들어보세요!
            </div>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0f766e' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

             {/* List View */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
              <h4 className="font-bold text-gray-800 text-[15px] mb-4">분석 내역 상세</h4>
              <div className="grid grid-cols-2 gap-4">
                {filteredHistory.map((item, idx) => {
                  let details = {};
                  try {
                    details = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
                  } catch (e) {
                    console.error("Failed to parse history details");
                  }
                  
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
                  const displaySeverity = item.severity ? `상황: ${status} / 상태: ${level}` : "분석 내용이 없습니다.";
                  const summaryText = details?.analysis?.[0] || displaySeverity;
                  
                  // Color for severity
                  let severityColor = "bg-gray-100 text-gray-800";
                  if (item.severity?.includes("양호") || item.severity?.includes("초기")) severityColor = "bg-green-100 text-green-800";
                  if (item.severity?.includes("중기")) severityColor = "bg-yellow-100 text-yellow-800";
                  if (item.severity?.includes("심각") || item.severity?.includes("위험")) severityColor = "bg-red-100 text-red-800";
                  
                  return (
                    <Link href={`/diagnosis?history=true&id=${item.id}`} key={item.id} className="group border border-gray-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-md transition-all bg-white relative flex gap-4 items-center">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                        <img src={item.image_url && item.image_url !== 'placeholder_url' ? item.image_url : "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100&h=100&fit=crop"} alt="분석 사진" className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{details?.scanType || '전체/알 수 없음'}</span>
                            <span className="text-[12px] text-gray-500 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${severityColor}`}>
                            상황: {status} | 상태: {level}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-end mt-1">
                          <div className="flex flex-col">
                            <p className="text-[14px] font-bold text-gray-900 line-clamp-1 mb-1 pr-4">
                              {summaryText}
                            </p>
                            <span className="text-[12px] text-teal-600 font-bold group-hover:underline">상세 리포트 보기 &rarr;</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-2xl font-black text-teal-600">{item.score}<span className="text-sm font-medium text-gray-400">점</span></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
