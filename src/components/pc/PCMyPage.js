"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Camera, User, FileText, MessageCircle, Heart, Lock, LogOut, ChevronRight, Activity, Bookmark } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

export default function PCMyPage() {
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [profile, setProfile] = useState({ nickname: "", email: "", gender: "미설정", birthYear: "미설정", familyHistory: "미설정" });
  const [isUploading, setIsUploading] = useState(false);

  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [aiProfileModalOpen, setAiProfileModalOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [tempProfile, setTempProfile] = useState({ gender: "", birthYear: "", familyHistory: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setProfile({
        nickname: parsed.nickname || "닉네임 없음",
        email: parsed.email || "이메일 없음",
        gender: parsed.gender || "미설정",
        birthYear: parsed.birth_year || "미설정",
        familyHistory: parsed.family_history || "미설정"
      });
      if (parsed.profile_image) {
        setProfileImage(parsed.profile_image);
      }
      setUser(parsed);

      // Initialize Kakao SDK
      if (typeof window !== "undefined" && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init('f557c50a623379e0c2abb685232ade41');
        }
      }

      // Fetch fresh user data
      fetch(`/api/user/me?userId=${parsed.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setProfile({
              nickname: data.user.nickname || "닉네임 없음",
              email: data.user.email || "이메일 없음",
              gender: data.user.gender || "미설정",
              birthYear: data.user.birth_year || "미설정",
              familyHistory: data.user.family_history || "미설정"
            });
            if (data.user.profile_image) {
              setProfileImage(data.user.profile_image);
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/chat/list?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.rooms) {
            const total = data.rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
            setUnreadChatCount(total);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  const updateProfileInBackend = async (updates) => {
    if (!user) return;
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...updates })
      });
      if (res.ok) {
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditNickname = () => {
    setTempNickname(profile.nickname);
    setNicknameStatus("");
    setNicknameMessage("");
    setNicknameModalOpen(true);
  };

  const handleCheckNickname = async () => {
    if (!tempNickname || tempNickname.trim() === "") return;
    setNicknameStatus("checking");
    setNicknameMessage("중복 확인 중...");
    try {
      const res = await fetch(`/api/user/check-nickname?nickname=${encodeURIComponent(tempNickname)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "서버 에러");
      }
      if (data.available || tempNickname === user.nickname) {
        setNicknameStatus("available");
        setNicknameMessage("사용 가능한 닉네임입니다.");
      } else {
        setNicknameStatus("duplicate");
        setNicknameMessage("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      setNicknameStatus("error");
      setNicknameMessage(`오류: ${error.message}`);
    }
  };

  const handleSaveNickname = async () => {
    if (tempNickname && tempNickname.trim() !== "" && nicknameStatus === "available") {
      const newName = tempNickname.trim();
      
      // update backend first
      try {
        const res = await fetch('/api/user/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, nickname: newName })
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(prev => ({ ...prev, nickname: newName }));
          const updatedUser = { ...user, nickname: newName };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setNicknameModalOpen(false);
        } else {
          alert(data.error || "닉네임 변경 실패");
        }
      } catch (e) {
        console.error(e);
        alert("오류가 발생했습니다.");
      }
    }
  };

  const handleChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordModalOpen(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!user) return;
    
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "비밀번호가 성공적으로 변경되었습니다.");
        setPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (e) {
      alert("서버 오류가 발생했습니다.");
    }
  };

  const handleEditAiProfile = () => {
    setTempProfile({ gender: profile.gender, birthYear: profile.birthYear, familyHistory: profile.familyHistory });
    setAiProfileModalOpen(true);
  };

  const handleSaveAiProfile = () => {
    setProfile(prev => ({ ...prev, gender: tempProfile.gender, birthYear: tempProfile.birthYear, familyHistory: tempProfile.familyHistory }));
    updateProfileInBackend({ gender: tempProfile.gender, birth_year: tempProfile.birthYear, family_history: tempProfile.familyHistory });
    setAiProfileModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file, 400, 0.8);
      const res = await fetch(compressedBase64);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append("image", blob, file.name || "profile.jpg");
      
      const uploadRes = await fetch("/api/user/upload-profile", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
        setProfileImage(uploadData.url);
        updateProfileInBackend({ profile_image: uploadData.url });
      } else {
        alert(uploadData.error || "이미지 업로드 실패");
      }
    } catch (err) {
      console.error(err);
      alert("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>

      {/* Profile + AI Profile - 2 columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-5 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-400" />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center border-2 border-white text-white">
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                {profile.nickname}
                {user?.role === 'hospital' && (
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded">병원 권한</span>
                )}
              </h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleEditNickname} className="flex-1 py-2.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">닉네임 변경</button>
            <button onClick={handleChangePassword} className="flex-1 py-2.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">비밀번호 변경</button>
          </div>
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="mt-2 flex w-full items-center justify-center py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
              마스터 시스템 접속
            </Link>
          )}
          {user?.role === 'hospital' && (
            <Link href="/hospital/settings" className="mt-2 flex w-full items-center justify-center py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              병원 설정
            </Link>
          )}

          {/* Tickets & Referral Mini Card */}
          <div className="mt-5 p-4 bg-teal-50 rounded-xl border border-teal-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-teal-800">AI 분석 티켓</span>
              <div className="text-xl font-black text-teal-600">
                {(user?.tickets_basic || 0) + (user?.tickets_premium || 0)}<span className="text-sm font-bold ml-1">장</span>
              </div>
            </div>
            <p className="text-[11px] text-teal-600 -mt-2">기본 {user?.tickets_basic || 0}장 + 프리미엄 {user?.tickets_premium || 0}장</p>
            
            <div className="pt-3 border-t border-teal-100 flex flex-col gap-2">
              <span className="text-[12px] font-bold text-teal-800">🎁 친구 초대하고 티켓 받기!</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-teal-200 rounded-lg px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[12px] font-mono font-bold text-teal-700">{user?.referral_code || '------'}</span>
                </div>
                <button 
                  onClick={() => {
                    const inviteUrl = `${window.location.origin}/signup?ref=${user?.referral_code || ''}`;
                    if (typeof window !== "undefined" && window.Kakao && window.Kakao.isInitialized()) {
                      window.Kakao.Share.sendDefault({
                        objectType: 'feed',
                        content: {
                          title: '탈모톡에 가입하고 Ai 탈모분석 티켓을 받아보세요!',
                          description: `초대장을 클릭하고 간편가입을 하시면 Ai 탈모분석 티켓 6장이 즉시 발급됩니다.\n추천인 코드: ${user?.referral_code}`,
                          imageUrl: 'https://talmotalk.pages.dev/ai_diagnosis_banner.png',
                          link: {
                            mobileWebUrl: inviteUrl,
                            webUrl: inviteUrl,
                          },
                        },
                        buttons: [
                          {
                            title: '탈모톡 시작하기',
                            link: {
                              mobileWebUrl: inviteUrl,
                              webUrl: inviteUrl,
                            },
                          },
                        ],
                      });
                    } else {
                      const text = `탈모톡에 가입하고 AI 분석 티켓 6장을 무료로 받아보세요!\n\n가입 링크: ${inviteUrl}\n추천인 코드: ${user?.referral_code}`;
                      navigator.clipboard.writeText(text);
                      alert("초대 링크와 코드가 복사되었습니다!");
                    }
                  }}
                  className="bg-[#FEE500] text-black text-[11px] font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  카카오톡 공유
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Profile */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-gray-900 text-[16px]">AI 분석 프로필</h3>
            </div>
            <button onClick={handleEditAiProfile} className="text-[12px] font-bold text-gray-500 hover:text-teal-600 transition-colors bg-gray-100 hover:bg-teal-50 px-2.5 py-1 rounded-md">
              수정
            </button>
          </div>
          <div className="bg-teal-50/50 rounded-md p-4 border border-teal-100/50">
            <p className="text-[12px] text-teal-800 mb-4">AI 두피 분석의 정확도를 높이기 위한 필수 의료 정보입니다.</p>
            <div className="flex flex-col gap-3">
              {[{ label: "성별", value: profile.gender }, { label: "출생 연도", value: `${profile.birthYear}년생` }, { label: "유전적 가족력", value: profile.familyHistory }].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-[14px] text-gray-500 font-medium">{item.label}</span>
                  <span className="font-bold text-gray-900 text-[14px]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Grid - 4 columns */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-4">나의 활동</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { href: "/chat-list", icon: MessageCircle, label: "나의 1:1 탈모톡", color: "bg-blue-50 text-blue-500", badge: unreadChatCount },
            { href: "/diagnosis-history", icon: FileText, label: "AI 분석 기록", color: "bg-teal-50 text-teal-600" },
            { href: "/my-posts", icon: FileText, label: "내가 작성한 글", color: "bg-orange-50 text-orange-500" },
            { href: "/my-bookmarks", icon: Bookmark, label: "스크랩한 글", color: "bg-purple-50 text-purple-500" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-3 p-5 rounded-md border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group relative">
              {item.badge > 0 && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{item.badge > 99 ? '99+' : item.badge}</span>}
              <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[14px] font-medium text-gray-800 group-hover:text-teal-600 transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Account + Footer */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="hover:text-gray-900">개인정보 처리방침</Link>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium">
          <LogOut className="w-4 h-4" /> 로그아웃
        </button>
      </div>

      {/* Modals */}
      {nicknameModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-lg w-full max-w-[400px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">닉네임 변경</h3>
            <div className="flex flex-col gap-1.5 mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tempNickname}
                  onChange={(e) => {
                    setTempNickname(e.target.value);
                    if(e.target.value !== user?.nickname) {
                      setNicknameStatus("valid");
                      setNicknameMessage("중복확인을 진행해주세요.");
                    } else {
                      setNicknameStatus("available");
                      setNicknameMessage("");
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  placeholder="새로운 닉네임을 입력하세요"
                />
                <button 
                  onClick={handleCheckNickname}
                  disabled={nicknameStatus !== 'valid'}
                  className={`px-4 py-3 rounded-md text-[14px] font-bold whitespace-nowrap transition-colors ${nicknameStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  중복확인
                </button>
              </div>
              {nicknameMessage && (
                <span className={`text-[12px] ml-1 ${nicknameStatus === 'available' ? 'text-teal-600' : nicknameStatus === 'valid' ? 'text-gray-500' : 'text-red-500'}`}>
                  {nicknameMessage}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNicknameModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-md hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleSaveNickname} disabled={nicknameStatus !== "available"} className={`flex-1 py-3 font-bold text-[14px] rounded-md transition-colors shadow-sm ${nicknameStatus === 'available' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-lg w-full max-w-[360px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">비밀번호 변경</h3>
            <div className="flex flex-col gap-3 mb-6">
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder-gray-400"
                placeholder="현재 비밀번호"
              />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder-gray-400"
                placeholder="새 비밀번호"
              />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder-gray-400"
                placeholder="새 비밀번호 확인"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPasswordModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-md hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleSavePassword} className="flex-1 py-3 bg-teal-600 text-white font-bold text-[14px] rounded-md hover:bg-teal-700 transition-colors shadow-sm">변경하기</button>
            </div>
          </div>
        </div>
      )}

      {aiProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-lg w-full max-w-[400px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">AI 분석 프로필 수정</h3>
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] text-gray-500 font-medium">성별</span>
                <div className="flex gap-2">
                  {["남성", "여성"].map(g => (
                    <button key={g} onClick={() => setTempProfile(prev => ({ ...prev, gender: g }))} className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${tempProfile.gender === g ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] text-gray-500 font-medium">출생 연도</span>
                <select 
                  value={tempProfile.birthYear === "미설정" ? "" : tempProfile.birthYear} 
                  onChange={(e) => setTempProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-900"
                >
                  <option value="" disabled>연도 선택</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] text-gray-500 font-medium">유전적 가족력</span>
                <div className="flex flex-wrap gap-2">
                  {["있음 (부계)", "있음 (모계)", "없음", "모름"].map(h => (
                    <button key={h} onClick={() => setTempProfile(prev => ({ ...prev, familyHistory: h }))} className={`flex-1 min-w-[45%] py-2.5 rounded-lg text-[12px] font-bold transition-colors ${tempProfile.familyHistory === h ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAiProfileModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-md hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleSaveAiProfile} className="flex-1 py-3 bg-teal-600 text-white font-bold text-[14px] rounded-md hover:bg-teal-700 transition-colors shadow-sm">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
