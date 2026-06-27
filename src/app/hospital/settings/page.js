"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, MapPin, Check } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

export default function HospitalSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Hospital Profile State
  const [hospitalInfo, setHospitalInfo] = useState({
    name: "",
    description: "",
    detail_description: "",
    address: "",
    category: "모발이식",
    contact: "",
    image_url: "",
  });

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const compressedBase64 = await compressImage(files[0], 500, 0.7);
      setHospitalInfo(prev => ({ ...prev, image_url: compressedBase64 }));
    } catch (err) {
      console.error("Image compression failed:", err);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === "hospital") {
        setUser(parsed);
        // Fetch existing data
        fetch(`/api/hospital/settings?userId=${parsed.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              setHospitalInfo(prev => ({ ...prev, ...data.data }));
            } else {
              // fallback default
              setHospitalInfo(prev => ({ ...prev, name: parsed.nickname || "" }));
            }
          })
          .catch(err => {
            console.error("Failed to fetch hospital info:", err);
            setHospitalInfo(prev => ({ ...prev, name: parsed.nickname || "" }));
          });
      } else {
        router.replace("/");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/hospital/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...hospitalInfo
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("병원 정보가 성공적으로 저장되었습니다.");
        router.back();
      } else {
        alert("저장에 실패했습니다: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩중...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white flex items-center px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700 mr-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px] text-gray-900">병원 설정 (소개 관리)</h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-5">
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
          
          {/* Logo / Cover Image */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-900 text-sm">병원 로고 / 대표 이미지</span>
            <div className="flex items-center gap-4 mt-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
              />
              <div 
                className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                {hospitalInfo.image_url ? (
                  <img src={hospitalInfo.image_url} alt="hospital logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gray-700 font-bold bg-white/80 px-2 py-1 rounded">변경</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-gray-500 mb-1">환자들에게 보여질 병원의 대표 로고나 이미지를 등록해주세요.</p>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="text-[12px] font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100"
                >
                  이미지 업로드
                </button>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Hospital Info Fields */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-900 text-sm">병원명</label>
              <input 
                type="text" 
                value={hospitalInfo.name}
                onChange={e => setHospitalInfo({...hospitalInfo, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                placeholder="예: 탈모톡 모발이식센터"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-900 text-sm">주요 진료 과목</label>
              <select 
                value={hospitalInfo.category}
                onChange={e => setHospitalInfo({...hospitalInfo, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              >
                <option value="모발이식">모발이식</option>
                <option value="두피문신(SMP)">두피문신(SMP)</option>
                <option value="탈모치료">탈모치료 (약물/주사)</option>
                <option value="종합탈모클리닉">종합 탈모 클리닉</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-900 text-sm">병원 한줄 소개</label>
              <input 
                type="text" 
                value={hospitalInfo.description}
                onChange={e => setHospitalInfo({...hospitalInfo, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                placeholder="예: 비절개 모발이식 1만 건 이상, 대표원장 1:1 책임진료"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-900 text-sm">상세 소개 (환자 안내용)</label>
              <textarea 
                rows={4}
                value={hospitalInfo.detail_description || ""}
                onChange={e => setHospitalInfo({...hospitalInfo, detail_description: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-teal-500 focus:bg-white transition-colors resize-none"
                placeholder="병원의 특장점, 진료 철학, 보유 장비 등을 상세히 적어주세요."
              ></textarea>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-900 text-sm">병원 주소</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={hospitalInfo.address}
                  onChange={e => setHospitalInfo({...hospitalInfo, address: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  placeholder="예: 서울 강남구 테헤란로 123"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-gray-900 text-sm">대표 연락처</label>
              <input 
                type="text" 
                value={hospitalInfo.contact}
                onChange={e => setHospitalInfo({...hospitalInfo, contact: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                placeholder="예: 02-1234-5678"
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-[15px] hover:bg-gray-200 transition-colors">
              취소
            </button>
            <button type="submit" className="flex-1 py-3.5 rounded-xl bg-teal-600 text-white font-bold text-[15px] flex items-center justify-center gap-1.5 hover:bg-teal-700 transition-colors">
              <Check className="w-5 h-5" />
              저장하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
