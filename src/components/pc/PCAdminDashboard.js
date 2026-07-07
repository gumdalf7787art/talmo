"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Users, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Check, 
  Edit2, 
  Shield, 
  UploadCloud, 
  Bot, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  X,
  RefreshCw
} from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

function BannerSlotForm({ slot, initialData, onSave, onDelete, user }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setLinkUrl(initialData?.link_url || "");
    setImageUrl(initialData?.image_url || "");
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
      if (user?.id) {
        formData.append("userId", user.id);
      }
      
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
    onSave({ title, link_url: linkUrl, image_url: imageUrl });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4 bg-white shadow-sm transition-colors">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h4 className="font-bold text-gray-900">{slot.name}</h4>
          <p className="text-xs text-teal-600 font-medium mt-1">권장 사이즈: {slot.size}</p>
        </div>
        {initialData && (
          <button 
            onClick={onDelete}
            className="text-[11px] px-2 py-1 rounded border font-bold text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
          >
            삭제하기
          </button>
        )}
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

  // 신규 추가: 자동화 봇 & 승인 대기글 관련 상태
  const [bots, setBots] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingBotId, setGeneratingBotId] = useState("");

  // 봇 추가/수정용 간이 폼 모달 상태
  const [showBotForm, setShowBotForm] = useState(false);
  const [botFormId, setBotFormId] = useState("");
  const [botFormNickname, setBotFormNickname] = useState("");
  const [botFormConcept, setBotFormConcept] = useState("");
  const [botFormInstruction, setBotFormInstruction] = useState("");

  // 게시글 검수 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewPost, setReviewPost] = useState(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewCategory, setReviewCategory] = useState("탈모정보");

  const filteredUsers = users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.nickname && u.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const adminId = user?.id || "";

  useEffect(() => {
    if (!adminId) return;

    if (activeTab === "stats") {
      fetch(`/api/admin/stats?userId=${adminId}`).then(res => res.json()).then(data => {
        if(data.success) setStats(data.stats);
      });
    } else if (activeTab === "users") {
      fetch(`/api/admin/users?userId=${adminId}`).then(res => res.json()).then(data => {
        if(data.success) setUsers(data.users);
      });
    } else if (activeTab === "banners") {
      fetch("/api/admin/banners").then(res => res.json()).then(data => {
        if(data.success) setBanners(data.banners);
      });
    } else if (activeTab === "bots") {
      fetch(`/api/admin/bots?adminUserId=${adminId}`).then(res => res.json()).then(data => {
        if(data.success) setBots(data.bots);
      });
    } else if (activeTab === "pendingPosts") {
      fetch(`/api/admin/posts/pending?adminUserId=${adminId}`).then(res => res.json()).then(data => {
        if(data.success) setPendingPosts(data.posts);
      });
    }
  }, [activeTab, adminId]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch("/api/admin/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole, adminUserId: adminId })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert("권한이 변경되었습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  // 봇 추가/수정 저장
  const handleSaveBot = async () => {
    if (!botFormNickname || !botFormConcept || !botFormInstruction) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/admin/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: botFormId || undefined,
          nickname: botFormNickname,
          concept: botFormConcept,
          promptInstruction: botFormInstruction,
          adminUserId: adminId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(botFormId ? "봇 정보가 수정되었습니다." : "가상 봇 페르소나가 정상 등록되었습니다.");
        setShowBotForm(false);
        // 리로드
        const listRes = await fetch(`/api/admin/bots?adminUserId=${adminId}`);
        const listData = await listRes.json();
        if (listData.success) setBots(listData.bots);
      } else {
        alert(data.error || "저장에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  // 봇 삭제
  const handleDeleteBot = async (botUserId) => {
    if (!confirm("정말 이 봇 계정을 완전히 삭제하시겠습니까?\n이 봇이 작성한 글들의 작성자는 유지되며 봇 페르소나 데이터만 영구 소멸됩니다.")) return;
    try {
      const res = await fetch(`/api/admin/bots?id=${botUserId}&adminUserId=${adminId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        alert("성공적으로 삭제되었습니다.");
        setBots(bots.filter(b => b.id !== botUserId));
      } else {
        alert(data.error || "삭제 실패");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  // AI 글 즉시 생성
  const handleGeneratePost = async (botUserId) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratingBotId(botUserId);
    try {
      const res = await fetch("/api/admin/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botUserId, adminUserId: adminId })
      });
      const data = await res.json();
      if (data.success) {
        alert(`글 생성 완료!\n\n[제목]: ${data.title}\n\n해당 글은 승인 대기글 탭에서 즉시 검수 및 발행할 수 있습니다.`);
      } else {
        alert(data.error || "AI 글 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("글 생성 도중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
      setGeneratingBotId("");
    }
  };

  // 대기글 승인 발행
  const handleApprovePost = async () => {
    if (!reviewPost) return;
    try {
      const res = await fetch("/api/admin/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: reviewPost.id,
          title: reviewTitle,
          content: reviewContent,
          category: reviewCategory,
          adminUserId: adminId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("게시글이 성공적으로 최종 발행되어 커뮤니티에 공개되었습니다.");
        setShowReviewModal(false);
        setPendingPosts(pendingPosts.filter(p => p.id !== reviewPost.id));
      } else {
        alert(data.error || "승인 처리에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  // 대기글 삭제 (반려)
  const handleRejectPost = async (postId) => {
    if (!confirm("정말 이 글을 반려하고 영구 삭제하시겠습니까?")) return;
    try {
      const res = await fetch("/api/posts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: adminId })
      });
      const data = await res.json();
      if (data.success) {
        alert("해당 대기글이 삭제되었습니다.");
        setShowReviewModal(false);
        setPendingPosts(pendingPosts.filter(p => p.id !== postId));
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const openBotEditForm = (bot) => {
    setBotFormId(bot.id);
    setBotFormNickname(bot.nickname);
    setBotFormConcept(bot.concept);
    setBotFormInstruction(bot.prompt_instruction);
    setShowBotForm(true);
  };

  const openBotCreateForm = () => {
    setBotFormId("");
    setBotFormNickname("");
    setBotFormConcept("");
    setBotFormInstruction("");
    setShowBotForm(true);
  };

  const openReviewModal = (post) => {
    setReviewPost(post);
    setReviewTitle(post.title);
    setReviewContent(post.content);
    setReviewCategory(post.category || "탈모정보");
    setShowReviewModal(true);
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
          {/* 신규: 봇 관리 메뉴 */}
          <button 
            onClick={() => setActiveTab("bots")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bots' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Bot className="w-4 h-4" /> 자동화 봇 관리
          </button>
          {/* 신규: 대기글 검수 메뉴 */}
          <button 
            onClick={() => setActiveTab("pendingPosts")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pendingPosts' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText className="w-4 h-4" /> 승인 대기 글
            {pendingPosts.length > 0 && (
              <span className="ml-auto bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                {pendingPosts.length}
              </span>
            )}
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
                          u.role === 'hospital' ? 'bg-blue-100 text-blue-700' : 
                          u.role === 'bot' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
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
                          <option value="bot">자동봇 (bot)</option>
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
                return (
                  <BannerSlotForm 
                    key={slot.id} 
                    slot={slot} 
                    user={user}
                    initialData={existingBanner} 
                    onSave={async (bannerData) => {
                      const res = await fetch("/api/admin/banners", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: slot.id, ...bannerData, userId: user?.id || "" })
                      });
                      if (res.ok) {
                        alert("저장되었습니다.");
                        fetch("/api/admin/banners").then(r => r.json()).then(data => {
                          if (data.success) setBanners(data.banners);
                        });
                      } else {
                        alert("저장에 실패했습니다.");
                      }
                    }} 
                    onDelete={async () => {
                      if (!confirm("정말 이 배너 슬롯을 삭제하시겠습니까?")) return;
                      const res = await fetch(`/api/admin/banners?id=${slot.id}&userId=${user?.id || ""}`, {
                        method: "DELETE"
                      });
                      if (res.ok) {
                        alert("삭제되었습니다.");
                        fetch("/api/admin/banners").then(r => r.json()).then(data => {
                          if (data.success) setBanners(data.banners);
                        });
                      } else {
                        alert("삭제에 실패했습니다.");
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 신규: 자동화 봇 관리 탭 UI */}
        {activeTab === "bots" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">글 작성 자동화 봇 설정</h3>
                <p className="text-sm text-gray-500 mt-1">각 봇별 닉네임과 구체적인 프롬프트 지침을 설정하여 멀티 페르소나 자동 생성을 관리합니다.</p>
              </div>
              <button 
                onClick={openBotCreateForm}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> 신규 봇 추가
              </button>
            </div>

            {/* 봇 목록 테이블 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {bots.length === 0 ? (
                <div className="col-span-2 text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                  등록된 자동화 봇이 없습니다. 오른쪽 상단의 버튼을 눌러 첫 봇을 만들어 보세요!
                </div>
              ) : (
                bots.map(bot => (
                  <div key={bot.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{bot.nickname}</h4>
                            <span className="inline-block text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold mt-1">
                              컨셉: {bot.concept}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openBotEditForm(bot)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="정보 수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteBot(bot.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="봇 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-100">
                        <p className="font-bold text-gray-700 mb-1">AI 지침 프롬프트:</p>
                        <p className="line-clamp-3 whitespace-pre-wrap">{bot.prompt_instruction}</p>
                      </div>
                    </div>

                    <div className="mt-5 border-t pt-4 flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        bot.is_active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {bot.is_active ? '활성화 상태' : '비활성화 상태'}
                      </span>
                      
                      <button
                        onClick={() => handleGeneratePost(bot.id)}
                        disabled={isGenerating || !bot.is_active}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating && generatingBotId === bot.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            AI가 글감 조사 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            즉시 AI 글 생성 (Search Grounding)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 봇 생성/수정 간이 폼 모달 */}
            {showBotForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg w-[500px] shadow-lg border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-900 px-6 py-4">
                    <h4 className="font-bold text-white text-base">
                      {botFormId ? "봇 페르소나 정보 수정" : "신규 봇 등록"}
                    </h4>
                    <button onClick={() => setShowBotForm(false)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">봇 닉네임</label>
                      <input 
                        type="text" 
                        placeholder="예: 탈모학회 수석 연구원, 모락모락 주치의"
                        value={botFormNickname}
                        onChange={e => setBotFormNickname(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">핵심 컨셉</label>
                      <input 
                        type="text" 
                        placeholder="예: 최신뉴스 브리핑 / 홈케어 꿀팁 / 학술지 분석"
                        value={botFormConcept}
                        onChange={e => setBotFormConcept(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">AI 지침 프롬프트 (작성 어조 및 핵심 미션)</label>
                      <textarea 
                        rows={6}
                        placeholder="AI가 글을 쓸 때 지켜야 할 페르소나 가이드라인을 자유롭게 한글로 적어주세요.&#10;예시: 너는 탈모 자가 치료 전문가야. 최신 해외 논문이나 기사들을 기반으로 과학적으로 검증된 치료법 및 꿀팁들을 일반 사용자들이 이해하기 쉽게 작성해줘. 경어체(~해요, ~입니다)를 사용하여 신뢰감 있게 설명해야 해."
                        value={botFormInstruction}
                        onChange={e => setBotFormInstruction(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
                    <button 
                      onClick={() => setShowBotForm(false)}
                      className="px-4 py-2 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleSaveBot}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-bold"
                    >
                      {botFormId ? "수정 완료" : "봇 등록"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 신규: 승인 대기 글 관리 탭 UI */}
        {activeTab === "pendingPosts" && (
          <div className="flex flex-col gap-6">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">승인 대기 중인 글 검수</h3>
              <p className="text-sm text-gray-500 mt-1">자동화 봇이 생성한 초안들을 최종 검수하여, 필요한 부분을 수정한 뒤 커뮤니티에 실시간 발행(Publish)합니다.</p>
            </div>

            {/* 대기글 테이블 */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2 bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">카테고리</th>
                    <th className="px-4 py-3.5 font-bold">제목</th>
                    <th className="px-4 py-3.5 font-bold">작성 봇</th>
                    <th className="px-4 py-3.5 font-bold">이미지 여부</th>
                    <th className="px-4 py-3.5 font-bold">초안 생성일</th>
                    <th className="px-4 py-3.5 font-bold text-center">검수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                        대기 중인 게시글이 없습니다. 봇 탭에서 글감을 생성해 보세요.
                      </td>
                    </tr>
                  ) : (
                    pendingPosts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 max-w-[280px] truncate">
                          {post.title}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-teal-600">
                          {post.author}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">
                          {post.imageUrl ? (
                            <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded font-bold">
                              AI 이미지 포함
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded">
                              없음
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleString('ko-KR')}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button 
                            onClick={() => openReviewModal(post)}
                            className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold px-3 py-1.5 rounded transition-all"
                          >
                            열기 및 검수
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 검수 및 수정 모달 */}
            {showReviewModal && reviewPost && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-lg w-[850px] max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
                  {/* 모달 헤더 */}
                  <div className="flex items-center justify-between bg-gray-900 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        검수 모달
                      </span>
                      <h4 className="font-bold text-white text-base truncate">
                        작성자: {reviewPost.author} 봇의 초안 검토
                      </h4>
                    </div>
                    <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 모달 바디 (스크롤 제공) */}
                  <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
                    <div className="grid grid-cols-3 gap-4">
                      {/* 카테고리 선택 */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">게시판 카테고리</label>
                        <select 
                          value={reviewCategory}
                          onChange={e => setReviewCategory(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="탈모정보">탈모정보</option>
                          <option value="닥터칼럼">닥터칼럼</option>
                          <option value="탈모수다">탈모수다</option>
                          <option value="리얼후기">리얼후기</option>
                        </select>
                      </div>

                      {/* 제목 입력 */}
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">글 제목</label>
                        <input 
                          type="text" 
                          value={reviewTitle}
                          onChange={e => setReviewTitle(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* 본문 에디터 (HTML 원본 텍스트에리어 제공) */}
                    <div className="flex flex-col gap-1.5 flex-1 min-h-[300px]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700">글 내용 (HTML 편집기)</label>
                        <span className="text-[11px] text-gray-400">※ HTML 태그를 사용해 서식을 조정할 수 있습니다.</span>
                      </div>
                      <textarea 
                        value={reviewContent}
                        onChange={e => setReviewContent(e.target.value)}
                        className="w-full flex-1 px-3 py-2 border rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none min-h-[220px]"
                      />
                    </div>

                    {/* 이미지 및 레이아웃 미리보기 */}
                    <div className="border border-gray-100 bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-bold text-gray-700 mb-2">렌더링 미리보기</p>
                      <div className="bg-white border rounded p-4 max-h-[250px] overflow-y-auto">
                        <h1 className="text-xl font-bold text-gray-900 mb-3">{reviewTitle}</h1>
                        <div 
                          className="prose prose-sm max-w-none text-gray-800 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: reviewContent }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* 모달 푸터 */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t shrink-0">
                    <button 
                      onClick={() => handleRejectPost(reviewPost.id)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm font-bold transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> 반려 및 삭제
                    </button>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowReviewModal(false)}
                        className="px-4 py-2 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        검수창 닫기
                      </button>
                      <button 
                        onClick={handleApprovePost}
                        className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-bold transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" /> 승인 및 즉시 발행
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
