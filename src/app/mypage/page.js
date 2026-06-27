"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Camera, User, FileText, MessageCircle, Heart, Lock, LogOut, ChevronRight, Activity, Users, X, Bookmark } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCMyPage from "@/components/pc/PCMyPage";

export default function MyPage() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // Mock profile data
  const [profile, setProfile] = useState({
    nickname: "득모기원",
    email: "talmo_user@gmail.com",
    gender: "남성",
    birthYear: "1992",
    familyHistory: "있음 (부계)"
  });

  // Nickname edit state
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("득모기원");

  // AI Profile edit state
  const [editProfileField, setEditProfileField] = useState(null); // 'gender' | 'birthYear' | 'familyHistory'

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSaveNickname = () => {
    if (!newNickname.trim()) return;
    setProfile(prev => ({ ...prev, nickname: newNickname }));
    setIsEditingNickname(false);
  };

  const handleProfileFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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
            <p className="text-sm text-gray-500">{profile.email}</p>
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
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
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
          <button className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100">
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
              <div className="relative">
                <input 
                  type="text" 
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="2~10자 이내로 입력해주세요"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  maxLength={10}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-medium">
                  {newNickname.length}/10
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 pl-1">
                욕설이나 부적절한 단어 사용 시 계정이 정지될 수 있습니다.
              </p>
            </div>

            <button 
              onClick={handleSaveNickname}
              disabled={!newNickname.trim() || newNickname === profile.nickname}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 transition-colors shadow-sm"
            >
              변경 완료
            </button>
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
                    <input 
                      type="number" 
                      defaultValue={profile.birthYear}
                      id="birthYearInput"
                      placeholder="예: 1990"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const val = document.getElementById('birthYearInput').value;
                      if(val && val.length === 4) handleProfileFieldChange('birthYear', val);
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
