"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Camera, User, FileText, MessageCircle, Heart, Lock, LogOut, ChevronRight, Activity, Bookmark } from "lucide-react";

export default function PCMyPage() {
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ nickname: "", email: "", gender: "誘몄꽕??, birthYear: "誘몄꽕??, familyHistory: "誘몄꽕?? });

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
        nickname: parsed.nickname || "?됰꽕???놁쓬",
        email: parsed.email || "?대찓???놁쓬",
        gender: parsed.gender || "誘몄꽕??,
        birthYear: parsed.birth_year || "誘몄꽕??,
        familyHistory: parsed.family_history || "誘몄꽕??
      });
      if (parsed.profile_image) {
        setProfileImage(parsed.profile_image);
      }
      setUser(parsed);
    }
  }, []);

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
    setNicknameMessage("以묐났 ?뺤씤 以?..");
    try {
      const res = await fetch(`/api/user/check-nickname?nickname=${encodeURIComponent(tempNickname)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "?쒕쾭 ?먮윭");
      }
      if (data.available || tempNickname === user.nickname) {
        setNicknameStatus("available");
        setNicknameMessage("?ъ슜 媛?ν븳 ?됰꽕?꾩엯?덈떎.");
      } else {
        setNicknameStatus("duplicate");
        setNicknameMessage("?대? ?ъ슜 以묒씤 ?됰꽕?꾩엯?덈떎.");
      }
    } catch (error) {
      setNicknameStatus("error");
      setNicknameMessage(`?ㅻ쪟: ${error.message}`);
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
          alert(data.error || "?됰꽕??蹂寃??ㅽ뙣");
        }
      } catch (e) {
        console.error(e);
        alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
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
      alert("紐⑤뱺 ?꾨뱶瑜??낅젰?댁＜?몄슂.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("??鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.");
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
        alert(data.message || "鍮꾨?踰덊샇媛 ?깃났?곸쑝濡?蹂寃쎈릺?덉뒿?덈떎.");
        setPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "鍮꾨?踰덊샇 蹂寃쎌뿉 ?ㅽ뙣?덉뒿?덈떎.");
      }
    } catch (e) {
      alert("?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
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
    alert("濡쒓렇?꾩썐 ?섏뿀?듬땲??");
    window.location.href = "/";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        updateProfileInBackend({ profile_image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">留덉씠?섏씠吏</h1>

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
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded">蹂묒썝 沅뚰븳</span>
                )}
              </h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleEditNickname} className="flex-1 py-2.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">?됰꽕??蹂寃?/button>
            <button onClick={handleChangePassword} className="flex-1 py-2.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">鍮꾨?踰덊샇 蹂寃?/button>
          </div>
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="mt-2 flex w-full items-center justify-center py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
              留덉뒪???쒖뒪???묒냽
            </Link>
          )}
          {user?.role === 'hospital' && (
            <Link href="/hospital/settings" className="mt-2 flex w-full items-center justify-center py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              蹂묒썝 ?ㅼ젙
            </Link>
          )}
        </div>

        {/* AI Profile */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-gray-900 text-[16px]">AI 遺꾩꽍 ?꾨줈??/h3>
            </div>
            <button onClick={handleEditAiProfile} className="text-[12px] font-bold text-gray-500 hover:text-teal-600 transition-colors bg-gray-100 hover:bg-teal-50 px-2.5 py-1 rounded-md">
              ?섏젙
            </button>
          </div>
          <div className="bg-teal-50/50 rounded-md p-4 border border-teal-100/50">
            <p className="text-[12px] text-teal-800 mb-4">AI ?먰뵾 遺꾩꽍???뺥솗?꾨? ?믪씠湲??꾪븳 ?꾩닔 ?섎즺 ?뺣낫?낅땲??</p>
            <div className="flex flex-col gap-3">
              {[{ label: "?깅퀎", value: profile.gender }, { label: "異쒖깮 ?곕룄", value: `${profile.birthYear}?꾩깮` }, { label: "?좎쟾??媛議깅젰", value: profile.familyHistory }].map((item) => (
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
        <h3 className="font-bold text-gray-900 text-lg mb-4">?섏쓽 ?쒕룞</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { href: "/chat-list", icon: MessageCircle, label: "?섏쓽 1:1 ?덈え??, color: "bg-blue-50 text-blue-500", badge: 2 },
            { href: "/diagnosis-history", icon: FileText, label: "AI 遺꾩꽍 湲곕줉", color: "bg-teal-50 text-teal-600" },
            { href: "/my-posts", icon: FileText, label: "?닿? ?묒꽦??湲", color: "bg-orange-50 text-orange-500" },
            { href: "/my-bookmarks", icon: Bookmark, label: "?ㅽ겕?⑺븳 湲", color: "bg-purple-50 text-purple-500" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-3 p-5 rounded-md border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group relative">
              {item.badge && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{item.badge}</span>}
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
          <Link href="/terms" className="hover:text-gray-900">?댁슜?쎄?</Link>
          <span className="text-gray-300">|</span>
          <Link href="/privacy" className="hover:text-gray-900">媛쒖씤?뺣낫 泥섎━諛⑹묠</Link>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium">
          <LogOut className="w-4 h-4" /> 濡쒓렇?꾩썐
        </button>
      </div>

      {/* Modals */}
      {nicknameModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-lg w-full max-w-[400px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">?됰꽕??蹂寃?/h3>
            <div className="flex flex-col gap-1.5 mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={tempNickname}
                  onChange={(e) => {
                    setTempNickname(e.target.value);
                    if(e.target.value !== user?.nickname) {
                      setNicknameStatus("valid");
                      setNicknameMessage("以묐났?뺤씤??吏꾪뻾?댁＜?몄슂.");
                    } else {
                      setNicknameStatus("available");
                      setNicknameMessage("");
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  placeholder="?덈줈???됰꽕?꾩쓣 ?낅젰?섏꽭??
                />
                <button 
                  onClick={handleCheckNickname}
                  disabled={nicknameStatus !== 'valid'}
                  className={`px-4 py-3 rounded-md text-[14px] font-bold whitespace-nowrap transition-colors ${nicknameStatus === 'valid' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  以묐났?뺤씤
                </button>
              </div>
              {nicknameMessage && (
                <span className={`text-[12px] ml-1 ${nicknameStatus === 'available' ? 'text-teal-600' : nicknameStatus === 'valid' ? 'text-gray-500' : 'text-red-500'}`}>
                  {nicknameMessage}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNicknameModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-md hover:bg-gray-200 transition-colors">痍⑥냼</button>
              <button onClick={handleSaveNickname} disabled={nicknameStatus !== "available"} className={`flex-1 py-3 font-bold text-[14px] rounded-md transition-colors shadow-sm ${nicknameStatus === 'available' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>??ν븯湲?/button>
            </div>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-lg w-full max-w-[360px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">鍮꾨?踰덊샇 蹂寃?/h3>
            <div className="flex flex-col gap-3 mb-6">
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder-gray-400"
                placeholder="?꾩옱 鍮꾨?踰덊샇"
              />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder-gray-400"
                placeholder="??鍮꾨?踰덊샇"
              />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium placeholder-gray-400"
                placeholder="??鍮꾨?踰덊샇 ?뺤씤"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPasswordModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-md hover:bg-gray-200 transition-colors">痍⑥냼</button>
              <button onClick={handleSavePassword} className="flex-1 py-3 bg-teal-600 text-white font-bold text-[14px] rounded-md hover:bg-teal-700 transition-colors shadow-sm">蹂寃쏀븯湲?/button>
            </div>
          </div>
        </div>
      )}

      {aiProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-lg w-full max-w-[400px] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">AI 遺꾩꽍 ?꾨줈???섏젙</h3>
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] text-gray-500 font-medium">?깅퀎</span>
                <div className="flex gap-2">
                  {["?⑥꽦", "?ъ꽦"].map(g => (
                    <button key={g} onClick={() => setTempProfile(prev => ({ ...prev, gender: g }))} className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${tempProfile.gender === g ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] text-gray-500 font-medium">異쒖깮 ?곕룄</span>
                <select 
                  value={tempProfile.birthYear === "誘몄꽕?? ? "" : tempProfile.birthYear} 
                  onChange={(e) => setTempProfile(prev => ({ ...prev, birthYear: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-900"
                >
                  <option value="" disabled>?곕룄 ?좏깮</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}??/option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] text-gray-500 font-medium">?좎쟾??媛議깅젰</span>
                <div className="flex flex-wrap gap-2">
                  {["?덉쓬 (遺怨?", "?덉쓬 (紐④퀎)", "?놁쓬", "紐⑤쫫"].map(h => (
                    <button key={h} onClick={() => setTempProfile(prev => ({ ...prev, familyHistory: h }))} className={`flex-1 min-w-[45%] py-2.5 rounded-lg text-[12px] font-bold transition-colors ${tempProfile.familyHistory === h ? 'bg-teal-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAiProfileModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-[14px] rounded-md hover:bg-gray-200 transition-colors">痍⑥냼</button>
              <button onClick={handleSaveAiProfile} className="flex-1 py-3 bg-teal-600 text-white font-bold text-[14px] rounded-md hover:bg-teal-700 transition-colors shadow-sm">??ν븯湲?/button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

