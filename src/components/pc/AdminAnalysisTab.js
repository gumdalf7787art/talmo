"use client";

import { useState, useEffect } from "react";
import { Activity, Users, UserRound, Target, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function AdminAnalysisTab({ adminId }) {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [listFilter, setListFilter] = useState('all');
  const [listData, setListData] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/admin/analysis_data?userId=${adminId}&period=${period}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData);
        }
      })
      .finally(() => setLoading(false));
  }, [adminId, period]);

  useEffect(() => {
    if (!adminId) return;
    setLoadingList(true);
    fetch(`/api/admin/analysis_list?userId=${adminId}&filter=${listFilter}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setListData(resData.data);
        }
      })
      .finally(() => setLoadingList(false));
  }, [adminId, listFilter]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500">
        데이터를 불러오는 중...
      </div>
    );
  }

  const { summary, breakdown, chartData } = data;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Summary Cards (Global) */}
      <div className="grid grid-cols-4 gap-4">
        <div 
          onClick={() => setListFilter('today')}
          className={`cursor-pointer p-6 rounded-lg border transition-all ${listFilter === 'today' ? 'bg-teal-100 border-teal-300 shadow-md transform scale-105' : 'bg-teal-50 border-teal-100 hover:bg-teal-100'} flex flex-col justify-center`}
        >
          <p className="text-teal-700 font-medium text-sm mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 오늘 분석 수
          </p>
          <p className="text-3xl font-bold text-teal-900">{summary.today_count?.toLocaleString()}건</p>
        </div>
        <div 
          onClick={() => setListFilter('all')}
          className={`cursor-pointer p-6 rounded-lg border transition-all ${listFilter === 'all' ? 'bg-gray-200 border-gray-400 shadow-md transform scale-105' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} flex flex-col justify-center`}
        >
          <p className="text-gray-600 font-medium text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> 전체 분석 수
          </p>
          <p className="text-3xl font-bold text-gray-900">{summary.total_count?.toLocaleString()}건</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col justify-center">
          <p className="text-blue-700 font-medium text-sm mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> 부위별 (이마 / 정수리)
          </p>
          <p className="text-3xl font-bold text-blue-900">
            <span onClick={() => setListFilter('forehead')} className={`cursor-pointer transition-all ${listFilter === 'forehead' ? 'text-blue-600 underline scale-110 inline-block' : 'hover:text-blue-600 hover:underline'}`}>{summary.forehead_count?.toLocaleString()}</span> 
            <span className="text-xl text-blue-400 font-light mx-1">/</span> 
            <span onClick={() => setListFilter('crown')} className={`cursor-pointer transition-all ${listFilter === 'crown' ? 'text-blue-600 underline scale-110 inline-block' : 'hover:text-blue-600 hover:underline'}`}>{summary.crown_count?.toLocaleString()}</span>
          </p>
        </div>
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 flex flex-col justify-center">
          <p className="text-amber-700 font-medium text-sm mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> 성별 (남성 / 여성)
          </p>
          <p className="text-3xl font-bold text-amber-900">
            <span onClick={() => setListFilter('male')} className={`cursor-pointer transition-all ${listFilter === 'male' ? 'text-amber-600 underline scale-110 inline-block' : 'hover:text-amber-600 hover:underline'}`}>{summary.male_count?.toLocaleString()}</span> 
            <span className="text-xl text-amber-400 font-light mx-1">/</span> 
            <span onClick={() => setListFilter('female')} className={`cursor-pointer transition-all ${listFilter === 'female' ? 'text-amber-600 underline scale-110 inline-block' : 'hover:text-amber-600 hover:underline'}`}>{summary.female_count?.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* 2. Chart Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">분석 숫자 추이</h3>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setPeriod('daily')}
              className={`px-4 py-1 text-sm font-bold rounded transition-colors ${period === 'daily' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              일간 (최근 30일)
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-1 text-sm font-bold rounded transition-colors ${period === 'weekly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              주간 (최근 12주)
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-1 text-sm font-bold rounded transition-colors ${period === 'monthly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              월간 (최근 12개월)
            </button>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c73c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00c73c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6B7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="분석건수" stroke="#00c73c" strokeWidth={3} fillOpacity={1} fill="url(#colorTeal)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              해당 기간의 분석 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 3. Detailed Aggregation (Global) */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Male Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-blue-500" /> 남성 분석 누적 통계
            </h3>
            <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              총 {breakdown.male.total.toLocaleString()}명
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-8 text-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">이마 분석</p>
              <p className="text-2xl font-bold text-gray-900">{breakdown.male.forehead.toLocaleString()}</p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">정수리 분석</p>
              <p className="text-2xl font-bold text-gray-900">{breakdown.male.crown.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-700 mb-2">탈모 심각도 단계별 분포 (남성형 7단계)</p>
            {Object.entries(breakdown.male.stages).map(([stage, count]) => {
              const pct = breakdown.male.total > 0 ? ((count / breakdown.male.total) * 100).toFixed(1) : 0;
              return (
                <div key={stage} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">{stage}</span>
                    <span className="text-gray-900 font-bold">{count.toLocaleString()}명 <span className="text-gray-400 text-xs ml-1">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Female Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-rose-500" /> 여성 분석 누적 통계
            </h3>
            <span className="text-sm font-medium bg-rose-50 text-rose-600 px-3 py-1 rounded-full">
              총 {breakdown.female.total.toLocaleString()}명
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-8 text-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">이마 분석</p>
              <p className="text-2xl font-bold text-gray-900">{breakdown.female.forehead.toLocaleString()}</p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">정수리 분석</p>
              <p className="text-2xl font-bold text-gray-900">{breakdown.female.crown.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-700 mb-2">탈모 심각도 단계별 분포 (여성형 5단계)</p>
            {Object.entries(breakdown.female.stages).map(([stage, count]) => {
              const pct = breakdown.female.total > 0 ? ((count / breakdown.female.total) * 100).toFixed(1) : 0;
              return (
                <div key={stage} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-600">{stage}</span>
                    <span className="text-gray-900 font-bold">{count.toLocaleString()}명 <span className="text-gray-400 text-xs ml-1">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Analysis Report List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8 mt-4">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" /> 
            분석 리포트 목록
            <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full ml-2">
              {listFilter === 'today' ? '오늘 분석' : 
               listFilter === 'forehead' ? '이마 분석' : 
               listFilter === 'crown' ? '정수리 분석' : 
               listFilter === 'male' ? '남성' : 
               listFilter === 'female' ? '여성' : '전체'} ({listData.length}건)
            </span>
          </h3>
        </div>

        {loadingList ? (
          <div className="py-12 flex justify-center text-gray-400">
            데이터를 불러오는 중...
          </div>
        ) : listData.length === 0 ? (
          <div className="py-12 flex justify-center text-gray-400">
            해당 조건의 분석 리포트가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listData.map((item, idx) => {
              let details = {};
              try {
                details = typeof item.details === 'string' ? JSON.parse(item.details) : item.details;
              } catch (e) {}

              // Format date
              const d = new Date(item.created_at);
              const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
              const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              const seqNum = listData.length - idx; // 역순으로 순번 (가장 최신이 마지막 순번이 되거나, 1번이 되거나)

              return (
                <Link 
                  href={`/diagnosis?history=true&id=${item.id}`} 
                  key={item.id} 
                  target="_blank"
                  className="group border border-gray-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-md transition-all bg-white relative flex gap-4 items-center"
                >
                  <div className="absolute -top-3 -left-3 bg-gray-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10">
                    {idx + 1}
                  </div>
                  
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                    <img 
                      src={item.image_url && item.image_url !== 'placeholder_url' ? item.image_url : "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=100&h=100&fit=crop"} 
                      alt="분석 사진" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[12px] text-gray-500 font-medium">{dateStr} {timeStr}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {details?.scanType || '알 수 없음'}
                      </span>
                      <span className="text-[12px] font-bold text-gray-700 truncate">
                        {item.nickname || item.email || '탈퇴/게스트 사용자'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-400 mb-0.5">상태: {item.severity || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xl font-black ${item.score >= 75 ? 'text-emerald-600' : item.score >= 45 ? 'text-amber-600' : 'text-red-600'} tracking-tighter`}>
                          {item.score}<span className="text-xs font-bold text-gray-400 ml-0.5">점</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-transform ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
