"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function DiagnosisHistoryPage() {
  const router = useRouter();

  // Mock history data
  const historyList = [
    {
      id: 1,
      date: "2026.06.20",
      score: 65,
      severity: "진행: 초기",
      trend: "down",
      summary: "M자 헤어라인 후퇴 관찰됨",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      date: "2026.03.15",
      score: 72,
      severity: "정상 범위",
      trend: "same",
      summary: "정수리 밀도 다소 감소, 관리 필요",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      date: "2025.12.01",
      score: 74,
      severity: "정상 범위",
      trend: "up",
      summary: "두피 및 모발 상태 전반적 양호",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
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
            <span className="text-teal-100 text-[13px] font-medium">최근 분석 점수 (6/20 기준)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">65</span>
              <span className="text-teal-100 text-[15px] font-bold">/ 100점</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[12px] font-bold text-white flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              지난 검사 대비 -7점
            </span>
          </div>
        </div>
      </div>

      {/* History List */}
      <main className="flex-1 p-4">
        <div className="flex items-center gap-1.5 mb-3.5 text-gray-600 px-1">
          <Calendar className="w-4 h-4" />
          <h2 className="text-[14px] font-bold">나의 두피 변화 기록</h2>
        </div>

        <div className="flex flex-col gap-3">
          {historyList.map((item) => (
            <Link key={item.id} href="/diagnosis?history=true" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center transition-transform active:scale-[0.98] cursor-pointer">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                <img src={item.image} alt="분석 사진" className="w-full h-full object-cover" />
              </div>
              
              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] text-gray-400 font-medium">{item.date}</span>
                  <div className="flex items-center gap-1">
                    {item.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    {item.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-teal-500" />}
                    {item.trend === 'same' && <Minus className="w-3.5 h-3.5 text-gray-400" />}
                    <span className={`text-[13px] font-black ${item.trend === 'down' ? 'text-red-500' : item.trend === 'up' ? 'text-teal-600' : 'text-gray-500'}`}>
                      {item.score}점
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                    {item.severity}
                  </span>
                  <p className="text-[13px] font-bold text-gray-900 truncate">
                    {item.summary}
                  </p>
                </div>
                
                <button className="text-[11px] text-teal-600 font-bold text-left hover:text-teal-700 w-max">
                  상세 리포트 보기 &rarr;
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
