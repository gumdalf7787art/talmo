"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, MessageSquare, Clock } from "lucide-react";

export default function AdminPostsTab({ adminId }) {
  const [period, setPeriod] = useState('daily');
  const [sort, setSort] = useState('recent'); // recent, popular, comments
  const [data, setData] = useState({ summary: { today_posts: 0, total_posts: 0 }, posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/admin/posts_stats?userId=${adminId}&period=${period}&sort=${sort}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData);
        }
      })
      .finally(() => setLoading(false));
  }, [adminId, period, sort]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 flex flex-col justify-center">
          <p className="text-teal-700 font-medium text-sm mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> 오늘 작성글
          </p>
          <p className="text-4xl font-bold text-teal-900">{data.summary.today_posts.toLocaleString()}건</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col justify-center">
          <p className="text-gray-600 font-medium text-sm mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 총 작성글
          </p>
          <p className="text-4xl font-bold text-gray-900">{data.summary.total_posts.toLocaleString()}건</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 border-b border-gray-200 pb-0">
        {/* Main Tabs */}
        <div className="flex gap-6 relative top-[1px]">
          <button 
            onClick={() => setSort('recent')}
            className={`pb-3 px-1 text-base font-bold transition-colors border-b-2 ${sort === 'recent' ? 'border-[#00c73c] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            최근 작성글
          </button>
          <button 
            onClick={() => setSort('popular')}
            className={`pb-3 px-1 text-base font-bold transition-colors border-b-2 ${sort === 'popular' ? 'border-[#00c73c] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            인기 작성글
          </button>
          <button 
            onClick={() => setSort('comments')}
            className={`pb-3 px-1 text-base font-bold transition-colors border-b-2 ${sort === 'comments' ? 'border-[#00c73c] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            댓글 많은 글
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex bg-gray-100 rounded-md p-1 mb-2">
          <button 
            onClick={() => setPeriod('daily')}
            className={`px-4 py-1 text-sm font-bold rounded transition-colors ${period === 'daily' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            일간
          </button>
          <button 
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-1 text-sm font-bold rounded transition-colors ${period === 'weekly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            주간
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-1 text-sm font-bold rounded transition-colors ${period === 'monthly' ? 'bg-[#00c73c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            월간
          </button>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center text-gray-500">
            데이터를 불러오는 중...
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-medium text-gray-600 w-24 text-center">분류</th>
              <th className="py-3 px-4 font-medium text-gray-600">제목</th>
              <th className="py-3 px-4 font-medium text-gray-600 w-32 text-center">작성자</th>
              <th className="py-3 px-4 font-medium text-gray-600 w-24 text-center">
                <div className="flex items-center justify-center gap-1"><Eye className="w-4 h-4" />조회수</div>
              </th>
              <th className="py-3 px-4 font-medium text-gray-600 w-24 text-center">
                <div className="flex items-center justify-center gap-1"><MessageSquare className="w-4 h-4" />댓글</div>
              </th>
              <th className="py-3 px-4 font-medium text-gray-600 w-40 text-center">작성일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-center text-gray-500 font-medium whitespace-nowrap">
                  {post.category || '일반'}
                </td>
                <td className="py-4 px-4 text-gray-900 font-medium">
                  {post.title}
                </td>
                <td className="py-4 px-4 text-center text-gray-600 whitespace-nowrap">
                  {post.author || '알 수 없음'}
                </td>
                <td className="py-4 px-4 text-center text-gray-900 font-bold whitespace-nowrap">
                  {post.views?.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center text-teal-600 font-bold whitespace-nowrap">
                  {post.comments_count?.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(post.created_at)}
                </td>
              </tr>
            ))}
            {!loading && data.posts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  해당 기간 내에 작성된 게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
