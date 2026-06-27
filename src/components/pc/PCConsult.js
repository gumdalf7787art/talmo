"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, MessageCircle, ChevronRight } from "lucide-react";

export default function PCConsult() {
  const [activeTab, setActiveTab] = useState("전체");
  const categories = ["전체", "모발이식", "두피문신(SMP)", "탈모치료"];

  const clinics = [
    { id: 1, name: "모프로 탈모의원", location: "서울 강남구", description: "비절개 모발이식 1만 건 이상, 대표원장 1:1 책임진료", category: "모발이식", consults: 1540, reviews: 128, isPremium: true, wait_time: "보통" },
    { id: 2, name: "블랙라인 스튜디오", location: "서울 서초구", description: "자연스러운 헤어라인 교정, 무통증 두피문신 전문", category: "두피문신(SMP)", consults: 890, reviews: 85, isPremium: true, wait_time: "원활" },
    { id: 3, name: "풍성한 내과의원", location: "서울 종로구", description: "여성 탈모 및 스트레스성 탈모 집중 치료", category: "탈모치료", consults: 2100, reviews: 210, isPremium: false, wait_time: "혼잡" },
    { id: 4, name: "뉴헤어 모발이식센터", location: "부산 서면", description: "절개/비절개 맞춤형 디자인, 20년 경력 전문의", category: "모발이식", consults: 3250, reviews: 342, isPremium: true, wait_time: "보통" },
  ];

  const filtered = activeTab === "전체" ? clinics : clinics.filter(c => c.category === activeTab);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">1:1 맞춤 상담</h1>
        <p className="text-gray-500 text-sm mb-5">인증된 전문 병원과 1:1 익명 상담을 시작해보세요.</p>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="지역명이나 병원 이름을 검색해보세요" className="w-full bg-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === cat ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-sm font-bold mb-3">안심 상담</span>
          <h2 className="text-xl font-bold mb-1">탈모 고민, 혼자 앓지 마세요</h2>
          <p className="text-teal-50 opacity-90">인증된 전문 병원과 1:1 익명 상담을 시작해보세요.</p>
        </div>
        <MessageCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
      </div>

      {/* Clinic Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((clinic) => (
          <div key={clinic.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {clinic.isPremium && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[11px] font-bold rounded">추천</span>}
                  <h3 className="font-bold text-gray-900 text-[17px]">{clinic.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-[13px] text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5" /> {clinic.location}
                  <span className="mx-1 text-gray-300">|</span>
                  <span className="text-teal-600 font-medium">{clinic.category}</span>
                </div>
                <p className="text-[14px] text-gray-700">{clinic.description}</p>
              </div>
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border border-gray-100">
                <img src="/logo.png" alt="" className="w-8 h-8 opacity-40 grayscale" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-[13px] text-gray-500">누적 상담</span>
                  <span className="text-[13px] font-bold text-teal-600">{clinic.consults.toLocaleString()}건</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] text-gray-500">리얼 후기</span>
                  <span className="text-[13px] font-bold text-gray-900">{clinic.reviews}개</span>
                </div>
              </div>
              <Link href={`/consult/${clinic.id}`} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[13px] font-bold">상담하기</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
