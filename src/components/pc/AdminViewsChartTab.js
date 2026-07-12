"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminViewsChartTab({ adminId }) {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    all: true,
    member: false,
    non_member: false,
    other: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/admin/views?period=${period}&userId=${adminId}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .finally(() => setLoading(false));
  }, [period, adminId]);

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getFilteredData = () => {
    // We already have all fields in the data: total, member, non_member, other.
    // Recharts will automatically plot the lines we tell it to.
    // The data array doesn't need to be filtered, we just control which <Line> components render.
    return data;
  };

  const calculateTotals = () => {
    let totalViews = 0;
    data.forEach(item => totalViews += item.total);
    return totalViews;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            조회수 <span className="text-gray-400 text-sm font-normal bg-gray-100 rounded-full px-2 w-5 h-5 flex items-center justify-center">?</span>
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-700 font-bold">
            <button className="text-gray-400 hover:text-gray-600 px-2">&lt;</button>
            <span className="text-sm">현재 기준 📅</span>
            <button className="text-gray-400 hover:text-gray-600 px-2">&gt;</button>
          </div>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setPeriod('daily')}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${period === 'daily' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              일간
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${period === 'weekly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              주간
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${period === 'monthly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              월간
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        현재 기준<br />
        <span className="text-4xl font-light text-gray-900">{calculateTotals().toLocaleString()}</span>건
      </div>

      <div className="flex justify-end gap-4 mt-2 mb-4">
        <label className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input type="checkbox" checked={filters.all} onChange={() => toggleFilter('all')} className="accent-[#00c73c] w-4 h-4" /> 전체
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input type="checkbox" checked={filters.member} onChange={() => toggleFilter('member')} className="accent-[#00c73c] w-4 h-4" /> 회원
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input type="checkbox" checked={filters.non_member} onChange={() => toggleFilter('non_member')} className="accent-[#00c73c] w-4 h-4" /> 비회원
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input type="checkbox" checked={filters.other} onChange={() => toggleFilter('other')} className="accent-[#00c73c] w-4 h-4" /> 기타
        </label>
      </div>

      <div className="h-[300px] w-full border-t border-b border-gray-100 bg-[#fbfcfd] pt-8 pb-4 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">데이터를 불러오는 중...</div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">데이터가 없습니다.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFilteredData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#eef2f5" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
              <YAxis tickLine={false} axisLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              {filters.all && <Line type="monotone" dataKey="total" name="전체" stroke="#00c73c" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />}
              {filters.member && <Line type="monotone" dataKey="member" name="회원" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />}
              {filters.non_member && <Line type="monotone" dataKey="non_member" name="비회원" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />}
              {filters.other && <Line type="monotone" dataKey="other" name="기타" stroke="#6b7280" strokeWidth={2} dot={{ r: 4 }} />}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-8 border-t border-gray-900">
        <table className="w-full text-center text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 font-medium text-gray-600">날짜</th>
              <th className="py-3 font-medium text-gray-600">전체</th>
              <th className="py-3 font-medium text-gray-600">회원</th>
              <th className="py-3 font-medium text-gray-600">비회원</th>
              <th className="py-3 font-medium text-gray-600">기타</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.slice().reverse().map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-900">{row.label}</td>
                <td className="py-3 text-gray-900 font-bold">{row.total}</td>
                <td className="py-3 text-gray-600">{row.member}</td>
                <td className="py-3 text-gray-600">{row.non_member}</td>
                <td className="py-3 text-gray-600">{row.other}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-gray-400">조회된 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
