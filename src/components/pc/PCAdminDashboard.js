"use client";

import { useState, useEffect, useRef } from "react";
import { Users, LayoutDashboard, Image as ImageIcon, Check, Edit2, Shield, UploadCloud } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

function BannerSlotForm({ slot, initialData, onSave }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? 1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setLinkUrl(initialData?.link_url || "");
    setImageUrl(initialData?.image_url || "");
    setIsActive(initialData?.is_active ?? 1);
  }, [initialData]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. 압축
      const compressedBase64 = await compressImage(file, 1200, 0.8);
      
      // 2. Base64를 다시 Blob으로 변환
      const res = await fetch(compressedBase64);
      const blob = await res.blob();
      
      // 3. R2 업로드 API 호출
      const formData = new FormData();
      formData.append("image", blob, file.name || "banner.jpg");
      
      const uploadRes = await fetch("/api/admin/upload-banner", {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        setImageUrl(uploadData.url); // 업로드된 R2 URL
      } else {
        alert(uploadData.error || "이미지 업로드 실패");
      }
    } catch (err) {
      console.error(err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!title) {
      alert("배너 제목을 입력해주세요.");
      return;
    }
    if (!imageUrl) {
      alert("이미지를 첨부해주세요.");
      return;
    }
    onSave({ title, link_url: linkUrl, image_url: imageUrl, is_active: isActive });
  };

  return (
    <div className={`border rounded-lg p-5 flex flex-col gap-4 bg-white shadow-sm transition-colors ${isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 grayscale'}`}>
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h4 className="font-bold text-gray-900">{slot.name}</h4>
          <p className="text-xs text-teal-600 font-medium mt-1">권장 사이즈: {slot.size}</p>
        </div>
        <button 
          onClick={() => setIsActive(isActive ? 0 : 1)}
          className={`text-[11px] px-2 py-1 rounded border font-bold ${isActive ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : 'text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100'}`}
        >
          {isActive ? '비활성화 하기' : '활성화 하기'}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Preview Area */}
        <div 
          className="w-full aspect-[21/9] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-xs font-bold">이미지 변경</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              {isUploading ? (
                <span className="text-sm font-medium animate-pulse text-teal-600">업로드 중...</span>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">클릭하여 이미지 첨부</span>
                </>
              )}
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="배너 내부 식별용 제목 (예: 6월 이벤트 배너)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
          />
          <input 
            type="text" 
            placeholder="클릭 시 이동할 URL (선택)"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isUploading}
          className="w-full py-2.5 mt-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-md transition-colors disabled:bg-gray-300"
        >
          {isUploading ? '이미지 업로드 중...' : '슬롯 저장'}
        </button>
      </div>
    </div>
  );
}

export default function PCAdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'main_a_1', name: '메인페이지 A섹션 1 배너', size: '가로 744px × 세로 180px' },
                { id: 'main_a_2', name: '메인페이지 A섹션 2 배너', size: '가로 744px × 세로 가변(자유)' },
                { id: 'main_b_1', name: '메인페이지 B섹션 1 배너', size: '가로 280px × 세로 150px' },
                { id: 'main_b_2', name: '메인페이지 B섹션 2 배너', size: '가로 280px × 세로 280px' },
                { id: 'board_top', name: '게시판 상단 배너', size: '가로 744px × 세로 180px' }
              ].map(slot => {
                const existingBanner = banners.find(b => b.id === slot.id);
                // We use a form for each slot.
                return (
                  <BannerSlotForm 
                    key={slot.id} 
                    slot={slot} 
                    initialData={existingBanner} 
                    onSave={async (bannerData) => {
                      const res = await fetch("/api/admin/banners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: slot.id, ...bannerData })
                      });
                      if (res.ok) {
                        alert("저장되었습니다.");
                        // refresh banners
                        fetch("/api/admin/banners").then(r => r.json()).then(data => {
                          if (data.success) setBanners(data.banners);
                        });
                      } else {
                        alert("저장에 실패했습니다.");
                      }
                    }} 
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
