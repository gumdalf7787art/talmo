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
        alert("沅뚰븳??蹂寃쎈릺?덉뒿?덈떎.");
      }
    } catch (err) {
      alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
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
      alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
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
      alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm("?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id));
      }
    } catch (err) {
      alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
    }
  };

  return (
    <div className="w-full min-h-[800px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-[240px] bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 py-6">
        <h2 className="px-6 font-bold text-gray-900 mb-6">愿由ъ옄 硫붾돱</h2>
        <nav className="flex flex-col gap-1 px-3">
          <button 
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> ?묒냽 ?곗씠??          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Shield className="w-4 h-4" /> ?뚯썝/沅뚰븳 愿由?          </button>
          <button 
            onClick={() => setActiveTab("banners")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banners' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ImageIcon className="w-4 h-4" /> 諛곕꼫 愿由?          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        {activeTab === "stats" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-gray-900">?묒냽 ?곗씠??& ?꾩껜 ?듦퀎</h3>
            
            {stats ? (
              <div className="grid grid-cols-3 gap-4">
                {/* Traffic Stats */}
                <div className="bg-teal-50 p-6 rounded-md border border-teal-100">
                  <p className="text-teal-700 font-medium text-sm mb-1">?ㅻ뒛 ?꾩쟻 諛⑸Ц?먯닔 (DAU)</p>
                  <p className="text-3xl font-bold text-teal-900">{stats.dau}紐?/p>
                </div>
                <div className="bg-teal-50 p-6 rounded-md border border-teal-100">
                  <p className="text-teal-700 font-medium text-sm mb-1">?쇱＜???묒냽?먯닔 (WAU)</p>
                  <p className="text-3xl font-bold text-teal-900">{stats.wau}紐?/p>
                </div>
                <div className="bg-teal-50 p-6 rounded-md border border-teal-100">
                  <p className="text-teal-700 font-medium text-sm mb-1">1???묒냽?먯닔 (MAU)</p>
                  <p className="text-3xl font-bold text-teal-900">{stats.mau}紐?/p>
                </div>

                {/* Overall Platform Stats */}
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
                  <p className="text-gray-600 font-medium text-sm mb-1">?꾩껜 媛?낆옄</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}紐?/p>
                </div>
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
                  <p className="text-gray-600 font-medium text-sm mb-1">?꾩껜 寃뚯떆湲</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}媛?/p>
                </div>
                <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-4">
                  <p className="text-gray-600 font-medium text-sm mb-1">?앹꽦??梨꾪똿諛?/p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalChats}媛?/p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">?곗씠?곕? 遺덈윭?ㅻ뒗 以묒엯?덈떎...</p>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">?뚯썝 諛?沅뚰븳 愿由?(珥?{users.length}紐?</h3>
              <input
                type="text"
                placeholder="?대찓???먮뒗 ?됰꽕??寃??
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">?대찓??/th>
                    <th className="px-4 py-3 font-medium">?됰꽕??/th>
                    <th className="px-4 py-3 font-medium">媛?낆씪</th>
                    <th className="px-4 py-3 font-medium">?꾩옱 沅뚰븳</th>
                    <th className="px-4 py-3 font-medium text-right">沅뚰븳 蹂寃?/th>
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
                          <option value="user">?쇰컲?뚯썝 (user)</option>
                          <option value="hospital">蹂묒썝 (hospital)</option>
                          <option value="admin">愿由ъ옄 (admin)</option>
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
            <h3 className="text-xl font-bold text-gray-900">諛곕꼫 愿由?/h3>
            
            {/* Add New Banner Form */}
            <form onSubmit={handleAddBanner} className="bg-gray-50 p-6 rounded-md border border-gray-200 flex flex-col gap-4">
              <h4 className="font-bold text-sm text-gray-800">??諛곕꼫 ?깅줉</h4>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="諛곕꼫 ?쒕ぉ" 
                  value={newBanner.title}
                  onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                  required
                />
                <input 
                  type="text" 
                  placeholder="?대?吏 URL" 
                  value={newBanner.image_url}
                  onChange={e => setNewBanner({...newBanner, image_url: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                  required
                />
                <input 
                  type="text" 
                  placeholder="?대룞??留곹겕 (?좏깮)" 
                  value={newBanner.link_url}
                  onChange={e => setNewBanner({...newBanner, link_url: e.target.value})}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
                />
                <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-teal-700">
                  ?깅줉
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
                      <p className="text-xs text-blue-500 truncate mt-0.5">{banner.link_url || '留곹겕 ?놁쓬'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleBanner(banner.id, banner.is_active)}
                        className={`text-xs px-2 py-1 rounded border font-medium ${banner.is_active ? 'text-gray-600 border-gray-300 hover:bg-gray-100' : 'text-teal-600 border-teal-300 bg-teal-50 hover:bg-teal-100'}`}
                      >
                        {banner.is_active ? '鍮꾪솢?깊솕' : '?쒖꽦??}
                      </button>
                      <button 
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                      >
                        ??젣
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <p className="text-gray-500 col-span-2 py-8 text-center bg-gray-50 rounded-md">?깅줉??諛곕꼫媛 ?놁뒿?덈떎.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

