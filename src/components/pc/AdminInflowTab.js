"use client";

import { useState, useEffect } from "react";
import { Link2 } from "lucide-react";

export default function AdminInflowTab({ adminId }) {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/admin/inflow?period=${period}&userId=${adminId}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .finally(() => setLoading(false));
  }, [period, adminId]);

  const calculateTotals = () => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            유입분석 <span className="text-gray-400 text-sm font-normal bg-gray-100 rounded-full px-2 w-5 h-5 flex items-center justify-center">?</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">방문자들이 어떤 경로를 통해 사이트에 접속했는지 보여줍니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setPeriod('daily')}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${period === 'daily' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              일간 (최근 30일)
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${period === 'weekly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              주간 (최근 12주)
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${period === 'monthly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              월간 (최근 12개월)
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        선택 기간 총 유입수<br />
        <span className="text-4xl font-light text-gray-900">{calculateTotals().toLocaleString()}</span>건
      </div>

      <div className="mt-4 border-t border-gray-900 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center text-gray-500">
            데이터를 불러오는 중...
          </div>
        )}
        <table className="w-full text-left text-sm mt-4">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-medium text-gray-600 w-24 text-center">순위</th>
              <th className="py-3 px-4 font-medium text-gray-600">유입 경로</th>
              <th className="py-3 px-4 font-medium text-gray-600 w-32 text-right">유입수</th>
              <th className="py-3 px-4 font-medium text-gray-600 w-32 text-right">비율</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => {
              const percentage = calculateTotals() > 0 ? ((row.count / calculateTotals()) * 100).toFixed(1) : 0;
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-4 text-center">
                    {idx < 3 ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
                    {row.source}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{row.count.toLocaleString()}건</td>
                  <td className="py-4 px-4 text-right text-gray-500">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="w-8">{percentage}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400">조회된 유입 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
