"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Camera, User, FileText, MessageCircle, Heart, Lock, LogOut, ChevronRight, Activity, Users, X, Bookmark } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCMyPage from "@/components/pc/PCMyPage";
import { compressImage } from "@/lib/imageUtils";

export default function MyPage() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mock profile data
  const [profile, setProfile] = useState({
    nickname: "",
    email: "",
    gender: "미설정",
    birthYear: "미설정",
    familyHistory: "미설정"
  });

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("");

  // Password edit state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
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
      setNewNickname(parsed.nickname || "");
      setUser(parsed);

      // Initialize Kakao SDK
      if (typeof window !== "undefined" && window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init('f557c50a623379e0c2abb685232ade41');
        }
      }

      // Fetch fresh user data including tickets and referral_code
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

  // AI Profile edit state
  const [editProfileField, setEditProfileField] = useState(null); // 'gender' | 'birthYear' | 'familyHistory'

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

  const handleCheckNickname = async () => {
    if (!newNickname.trim()) return;
    setNicknameStatus("checking");
    setNicknameMessage("중복 확인 중...");
    try {
      const res = await fetch(`/api/user/check-nickname?nickname=${encodeURIComponent(newNickname)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "서버 에러");
      }
      if (data.available || newNickname === user.nickname) {
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
    if (!newNickname.trim() || nicknameStatus !== "available") return;
    
    // update backend
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, nickname: newNickname })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({ ...prev, nickname: newNickname }));
        const updatedUser = { ...user, nickname: newNickname };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditingNickname(false);
        setNicknameStatus("");
        setNicknameMessage("");
      } else {
        alert(data.error || "닉네임 변경 실패");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
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
        setIsEditingPassword(false);
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

  const handleProfileFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    const backendField = field === 'birthYear' ? 'birth_year' : field === 'familyHistory' ? 'family_history' : field;
    updateProfileInBackend({ [backendField]: value });
    setEditProfileField(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  if (isPC) return <PCMyPage />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-5 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-4">
          {/* Profile Image Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center border-2 border-white text-white hover:bg-teal-700 transition-colors"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">{profile.nickname}</h2>
              <button 
                onClick={() => {
                  setNewNickname(profile.nickname);
                  setIsEditingNickname(true);
                }}
                className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                변경
              </button>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              {profile.email}
              {user?.role === 'hospital' && (
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">병원 권한</span>
              )}
            </p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <Link href="/admin/dashboard" className="mt-4 flex w-full items-center justify-center py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
            마스터 시스템 접속
          </Link>
        )}
        {user?.role === 'hospital' && (
          <Link href="/hospital/settings" className="mt-4 flex w-full items-center justify-center py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            병원 설정
          </Link>
        )}
      </div>

      {/* Tickets & Referral Section */}
      <div className="bg-white p-5 border-b border-gray-100 mb-2 flex flex-col gap-4">
        <div className="flex justify-between items-center p-4 bg-teal-50 rounded-xl border border-teal-100">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-teal-800">보유한 AI 분석 티켓</span>
            <span className="text-xs text-teal-600 mt-1">기본 {user?.tickets_basic || 0}장 + 프리미엄 {user?.tickets_premium || 0}장</span>
          </div>
          <div className="text-2xl font-black text-teal-600">
            {(user?.tickets_basic || 0) + (user?.tickets_premium || 0)}<span className="text-sm font-bold ml-1">장</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3 border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-bold text-gray-800">🎁 친구 초대하고 티켓 받기!</span>
              <span className="text-[11px] text-gray-500">친구 가입 시 나도 4장, 친구도 4장!</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-[13px] font-mono font-bold text-gray-700">{user?.referral_code || '------'}</span>
              <span className="text-[10px] text-gray-400">내 코드</span>
            </div>
            <button 
              onClick={() => {
                const rawCode = user?.referral_code ? user.referral_code.trim() : '';
                const inviteUrl = `https://talmotalk.pages.dev/signup?ref=${rawCode}`;
                const safeInviteUrl = encodeURI(inviteUrl);
                
                const shareText = `🎁 탈모톡에 가입하고 AI 분석 티켓 4장을 무료로 받아보세요!\n\n가입 링크: ${safeInviteUrl}\n추천인 코드: ${rawCode}`;

                if (navigator.share) {
                  navigator.share({ 
                    title: '탈모톡 초대', 
                    text: shareText 
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert("초대 링크와 코드가 복사되었습니다!\n카카오톡에 붙여넣기 해주세요.");
                }
              }}
              className="bg-[#FEE500] text-black text-[12px] font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
            >
              카카오톡 초대
            </button>
          </div>
        </div>
      </div>

      {/* AI Health Profile Section */}
      <div className="bg-white mb-2 border-y border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-gray-900 text-[16px]">AI 분석 프로필</h3>
        </div>
        <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
          <p className="text-[12px] text-teal-800 mb-3 leading-relaxed">
            AI 두피 분석의 정확도를 높이기 위한 필수 의료 정보입니다. 연령대와 성별에 따라 분석 기준이 달라집니다.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setEditProfileField('gender')}
              className="flex justify-between items-center text-[14px] w-full py-1 hover:opacity-70 transition-opacity"
            >
              <span className="text-gray-500 font-medium">성별</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{profile.gender}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            <div className="w-full h-[1px] bg-gray-100"></div>
            
            <button 
              onClick={() => setEditProfileField('birthYear')}
              className="flex justify-between items-center text-[14px] w-full py-1 hover:opacity-70 transition-opacity"
            >
              <span className="text-gray-500 font-medium">출생 연도</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{profile.birthYear}년생</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            <div className="w-full h-[1px] bg-gray-100"></div>
            
            <button 
              onClick={() => setEditProfileField('familyHistory')}
              className="flex justify-between items-center text-[14px] w-full py-1 hover:opacity-70 transition-opacity"
            >
              <span className="text-gray-500 font-medium">유전적 가족력</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{profile.familyHistory}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* My Activity Section */}
      <div className="bg-white mb-2 border-y border-gray-100 py-3">
        <h3 className="font-bold text-gray-900 text-[16px] px-5 mb-2 pt-2">나의 활동</h3>
        <div className="flex flex-col">
          <Link href="/chat-list" className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">나의 1:1 탈모톡</span>
            </div>
            <div className="flex items-center gap-2">
              {unreadChatCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadChatCount > 99 ? '99+' : unreadChatCount}</span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>

          <Link href="/diagnosis-history" className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">AI 진단 기록 모아보기</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link href="/my-posts" className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">내가 작성한 글</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          
          <Link href="/my-bookmarks" className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">스크랩한 글</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white border-y border-gray-100 py-3">
        <h3 className="font-bold text-gray-900 text-[16px] px-5 mb-2 pt-2">계정 관리</h3>
        <div className="flex flex-col">
          <button onClick={() => setIsEditingPassword(true)} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <span className="text-[15px] font-medium text-gray-800">비밀번호 변경</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button onClick={handleLogout} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100 text-red-500">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-[15px] font-medium">로그아웃</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="px-5 py-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 text-[12px] text-gray-400 font-medium">
          <button className="hover:text-gray-600">이용약관</button>
          <span>|</span>
          <button className="hover:text-gray-600">개인정보 처리방침</button>
        </div>
        <span className="text-[11px] text-gray-400">앱 버전 1.0.0</span>
      </div>

      {/* Nickname Edit Modal (Bottom Sheet) */}
      {isEditingNickname && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setIsEditingNickname(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-gray-900">닉네임 변경</h3>
              <button onClick={() => setIsEditingNickname(false)} className="p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2 mb-8">
              <label className="text-[13px] font-medium text-gray-600">새로운 닉네임</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={newNickname}
                    onChange={(e) => {
                      setNewNickname(e.target.value);
                      if(e.target.value !== user?.nickname) {
                        setNicknameStatus("valid");
                        setNicknameMessage("중복확인을 진행해주세요.");
                      } else {
                        setNicknameStatus("available");
                        setNicknameMessage("");
                      }
                    }}
                    placeholder="2~10자 이내로 입력"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    maxLength={10}
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-medium">
                    {newNickname.length}/10
                  </span>
                </div>
                <button 
                  onClick={handleCheckNickname}
                  disabled={nicknameStatus !== 'valid'}
                  className={`px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${nicknameStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  중복확인
                </button>
              </div>
              {nicknameMessage && (
                <span className={`text-[12px] ml-1 ${nicknameStatus === 'available' ? 'text-teal-600' : nicknameStatus === 'valid' ? 'text-gray-500' : 'text-red-500'}`}>
                  {nicknameMessage}
                </span>
              )}
              <p className="text-[11px] text-gray-400 mt-1 pl-1">
                욕설이나 부적절한 단어 사용 시 계정이 정지될 수 있습니다.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsEditingNickname(false)}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-[15px] hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSaveNickname}
                disabled={nicknameStatus !== "available"}
                className={`w-full py-4 rounded-xl font-bold text-[15px] shadow-sm transition-colors ${nicknameStatus === "available" ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Edit Modal (Bottom Sheet) */}
      {isEditingPassword && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsEditingPassword(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-gray-900">비밀번호 변경</h3>
              <button onClick={() => setIsEditingPassword(false)} className="p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 mb-8">
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsEditingPassword(false)}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-[15px] hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSavePassword}
                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-[15px] shadow-sm hover:bg-teal-700 transition-colors"
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Profile Edit Modal (Bottom Sheet) */}
      {editProfileField && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setEditProfileField(null)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-gray-900">
                {editProfileField === 'gender' ? '성별 변경' : 
                 editProfileField === 'birthYear' ? '출생 연도 변경' : '가족력 변경'}
              </h3>
              <button onClick={() => setEditProfileField(null)} className="p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {editProfileField === 'gender' && (
                <>
                  {["남성", "여성"].map(option => (
                    <button 
                      key={option}
                      onClick={() => handleProfileFieldChange('gender', option)}
                      className={`py-4 rounded-xl font-bold text-[15px] transition-colors ${profile.gender === option ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {option}
                    </button>
                  ))}
                </>
              )}

              {editProfileField === 'birthYear' && (
                <>
                  <div className="relative mb-4">
                    <select 
                      defaultValue={profile.birthYear === "미설정" ? "" : profile.birthYear}
                      id="birthYearInput"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    >
                      <option value="" disabled>출생 연도를 선택해주세요</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}년</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      const val = document.getElementById('birthYearInput').value;
                      if(val) handleProfileFieldChange('birthYear', val);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
                  >
                    저장하기
                  </button>
                </>
              )}

              {editProfileField === 'familyHistory' && (
                <>
                  {["있음 (부계)", "있음 (모계)", "있음 (양가 모두)", "없음", "모름"].map(option => (
                    <button 
                      key={option}
                      onClick={() => handleProfileFieldChange('familyHistory', option)}
                      className={`py-3.5 rounded-xl font-bold text-[14px] transition-colors ${profile.familyHistory === option ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {option}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
