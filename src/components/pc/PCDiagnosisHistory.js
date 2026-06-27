"use client";

import { TrendingDown, TrendingUp, Minus, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import RadarChart from "../RadarChart";

export default function PCDiagnosisHistory({ historyList }) {
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
  const latestScore = historyList[0]?.score || 0;
  const previousScore = historyList.length > 1 ? historyList[1].score : latestScore;
  const diff = latestScore - previousScore;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto py-8">
      {/* Overview Dashboard */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-8 rounded-2xl shadow-sm text-white flex justify-between items-center">
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
          <div className="flex flex-col items-end gap-2 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
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
        <h3 className="font-bold text-lg text-gray-900">나의 두피 변화 기록</h3>
        <div className="grid grid-cols-2 gap-6">
          {historyList.map((item) => {
            const details = item.details ? JSON.parse(item.details) : null;
            const summaryText = details?.analysis?.[0] || item.severity || "분석 내용이 없습니다.";

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[300px]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[12px] font-bold rounded mb-2 inline-block">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <h4 className="font-bold text-gray-900 text-[16px] truncate">{item.severity}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-teal-600">{item.score}<span className="text-sm font-medium text-gray-400">점</span></span>
                  </div>
                </div>

                <div className="flex-1 mb-4 flex gap-4">
                  {/* Mock Image or Real Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200 mt-1">
                     <img src={item.image_url && item.image_url !== 'placeholder_url' ? item.image_url : "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=200&h=200&fit=crop"} alt="분석 사진" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Details summary */}
                  <div className="flex flex-col flex-1 text-[13px] text-gray-600">
                    <p className="line-clamp-3 leading-relaxed break-keep font-medium mb-3">
                      "{summaryText}"
                    </p>
                    {details?.breakdown && (
                      <div className="flex flex-col gap-1.5 mt-auto">
                         {details.breakdown.slice(0, 2).map((m, idx) => (
                           <div key={idx} className="flex justify-between items-center text-[12px]">
                             <span>{m.label.split(' ')[0]}</span>
                             <span className={`font-bold text-${m.color}-500`}>{m.status}</span>
                           </div>
                         ))}
                         <span className="text-[11px] text-gray-400 mt-1">+ 추가 지표</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                   <span className="text-[12px] text-gray-400">분석 완료</span>
                   <Link href={`/diagnosis?history=true&id=${item.id}`} className="text-[13px] text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1 group">
                     상세 리포트 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
