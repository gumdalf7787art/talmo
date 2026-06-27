"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, MessageCircle, Star, ChevronRight } from "lucide-react";
export default function ConsultPage() {
  const [activeTab, setActiveTab] = useState("전체");

  const categories = ["전체", "모발이식", "두피문신(SMP)", "탈모치료"];

  const [clinics, setClinics] = useState([]);
  
  useEffect(() => {
    fetch('/api/hospital/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClinics(data.clinics || []);
        }
      });
  }, []);

  const filteredClinics = activeTab === "전체" ? clinics : clinics.filter(c => c.category === activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 items-center">
      <div className="w-full max-w-5xl bg-white min-h-screen border-x border-gray-100">
        {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-gray-900 mb-4">1:1 맞춤 상담</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="지역명이나 병원 이름을 검색해보세요" 
            className="w-full bg-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-shadow"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${
                activeTab === cat 
                  ? "bg-gray-900 text-white shadow-sm" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block px-2 py-0.5 bg-white/20 rounded text-[11px] font-bold mb-2">안심 상담</span>
            <h2 className="text-lg font-bold mb-1">탈모 고민, 혼자 앓지 마세요</h2>
            <p className="text-[13px] text-teal-50 opacity-90">인증된 전문 병원과 1:1 익명 상담을 시작해보세요.</p>
          </div>
          <MessageCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
        </div>
      </div>

      {/* Clinic List */}
      <div className="flex flex-col gap-3 px-4 mt-2">
        {filteredClinics.map((clinic) => (
          <div key={clinic.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  {clinic.isPremium && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">추천</span>
                  )}
                  <h3 className="font-bold text-gray-900 text-[16px]">{clinic.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-[12px] text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{clinic.address || "주소 미등록"}</span>
                  <span className="mx-1 text-gray-300">|</span>
                  <span className="text-teal-600 font-medium">{clinic.category}</span>
                </div>
                <p className="text-[13px] text-gray-700 line-clamp-1">{clinic.description || "등록된 한줄 소개가 없습니다."}</p>
              </div>
              
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                {clinic.image_url ? (
                  <img src={clinic.image_url} alt="hospital logo" className="w-full h-full object-cover" />
                ) : (
                  <img src="/logo.png" alt="hospital logo" className="w-8 h-8 opacity-40 grayscale" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-gray-500">누적 상담</span>
                  <span className="text-[12px] font-bold text-teal-600">{clinic.consults.toLocaleString()}건</span>
                </div>
                <div className="w-[1px] h-3 bg-gray-200"></div>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-gray-500">리얼 후기</span>
                  <span className="text-[12px] font-bold text-gray-900">{clinic.reviews}개</span>
                </div>
              </div>
              
              <Link href={`/consult/${clinic.id}`} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm active:bg-teal-800">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[13px] font-bold">상담하기</span>
                <ChevronRight className="w-3 h-3 ml-0.5 opacity-80" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
