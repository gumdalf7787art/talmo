"use client";

import { useState, useEffect } from "react";
import { Users, LayoutDashboard, Image as ImageIcon, Check, Edit2, Shield } from "lucide-react";

export default function PCAdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New banner form state
  const [newBanner, setNewBanner] = useState({ title: "", image_url: "", link_url: "" });

  const filteredUsers = users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.nickname && u.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (activeTab === "stats") {
      fetch("/api/admin/stats").then(res => res.json()).then(data => {
        if(data.success) setStats(data.stats);
      });
    } else if (activeTab === "users") {
      fetch("/api/admin/users").then(res => res.json()).then(data => {
        if(data.success) setUsers(data.users);
      });
    } else if (activeTab === "banners") {
      fetch("/api/admin/banners").then(res => res.json()).then(data => {
        if(data.success) setBanners(data.banners);
      });
    }
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch("/api/admin/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert("권한이 변경되었습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image_url) return;
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        setNewBanner({ title: "", image_url: "", link_url: "" });
        // Refresh banners
        const data = await fetch("/api/admin/banners").then(r => r.json());
        if(data.success) setBanners(data.banners);
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleToggleBanner = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: currentStatus ? 0 : 1 })
      });
      if (res.ok) {
        setBanners(banners.map(b => b.id === id ? { ...b, is_active: currentStatus ? 0 : 1 } : b));
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id));
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full min-h-[800px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-[240px] bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 py-6">
        <h2 className="px-6 font-bold text-gray-900 mb-6">관리자 메뉴</h2>
        <nav className="flex flex-col gap-1 px-3">
          <button 
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> 접속 데이터
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Shield className="w-4 h-4" /> 회원/권한 관리
          </button>
          <button 
            onClick={() => setActiveTab("banners")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banners' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ImageIcon className="w-4 h-4" /> 배너 관리
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        {activeTab === "stats" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-gray-900">접속 데이터 & 전체 통계</h3>
            
            {stats ? (
              <div className="grid grid-cols-3 gap-4">
                {/* Traffic Stats */}
                <div className="bg-teal-50 p-6 rounded-md border border-teal-100">
                  <p className="text-teal-700 font-medium text-sm mb-1">오늘 누적 방문자수 (DAU)</p>
                  <p className="text-3xl font-bold text-teal-900">{stats.dau}명</p>
                </div>
                <div className="bg-teal-50 p-6 rounded-md border border-teal-100">
                  <p className="text-teal-700 font-medium text-sm mb-1">일주일 접속자수 (WAU)</p>
                  <p className="text-3xl font-bold text-teal-900">{stats.wau}명</p>
                </div>
                <div className="bg-teal-50 p-6 rounded-md border border-teal-100">
                  <p className="text-teal-700 font-medium text-sm mb-1">1달 접속자수 (MAU)</p>
                  <p className="text-3xl font-bold text-teal-900">{stats.mau}명</p>
                </div>

                {/* Overall Platform Stats */}
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
                  <p className="text-gray-600 font-medium text-sm mb-1">전체 가입자</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}명</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
                  <p className="text-gray-600 font-medium text-sm mb-1">전체 게시글</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}개</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
                  <p className="text-gray-600 font-medium text-sm mb-1">생성된 채팅방</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalChats}개</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">회원 및 권한 관리 (총 {users.length}명)</h3>
              <input
                type="text"
                placeholder="이메일 또는 닉네임 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">이메일</th>
                    <th className="px-4 py-3 font-medium">닉네임</th>
                    <th className="px-4 py-3 font-medium">가입일</th>
                    <th className="px-4 py-3 font-medium">현재 권한</th>
                    <th className="px-4 py-3 font-medium text-right">권한 변경</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3 font-medium">{u.nickname}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' :
                          u.role === 'hospital' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select 
                          className="bg-white border border-gray-300 text-gray-700 text-xs rounded px-2 py-1 focus:outline-none focus:border-teal-500"
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="user">일반회원 (user)</option>
                          <option value="hospital">병원 (hospital)</option>
                          <option value="admin">관리자 (admin)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "banners" && (
          <div className="flex flex-col gap-8">
            <h3 className="text-xl font-bold text-gray-900">배너 관리</h3>
            
            {/* Add New Banner Form */}
            <form onSubmit={handleAddBanner} className="bg-gray-50 p-6 rounded-md border border-gray-200 flex flex-col gap-4">
              <h4 className="font-bold text-sm text-gray-800">새 배너 등록</h4>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="배너 제목" 
                  value={newBanner.title}
                  onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                  required
                />
                <input 
                  type="text" 
                  placeholder="이미지 URL" 
                  value={newBanner.image_url}
                  onChange={e => setNewBanner({...newBanner, image_url: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                  required
                />
                <input 
                  type="text" 
                  placeholder="이동할 링크 (선택)" 
                  value={newBanner.link_url}
                  onChange={e => setNewBanner({...newBanner, link_url: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                />
                <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-teal-700">
                  등록
                </button>
              </div>
            </form>

            {/* Banner List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map(banner => (
                <div key={banner.id} className={`border rounded-md p-4 flex flex-col gap-3 ${banner.is_active ? 'border-teal-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div className="aspect-[3/1] bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{banner.title}</h4>
                      <p className="text-xs text-blue-500 truncate mt-0.5">{banner.link_url || '링크 없음'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleBanner(banner.id, banner.is_active)}
                        className={`text-xs px-2 py-1 rounded border font-medium ${banner.is_active ? 'text-gray-600 border-gray-300 hover:bg-gray-100' : 'text-teal-600 border-teal-300 bg-teal-50 hover:bg-teal-100'}`}
                      >
                        {banner.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button 
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="text-gray-500 col-span-2 py-8 text-center bg-gray-50 rounded-md">등록된 배너가 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
