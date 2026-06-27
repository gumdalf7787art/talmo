"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft, MessageCircle, Star, MapPin } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearched(true);
    }
  };

  // Mock Data
  const communityResults = [
    { id: 1, title: "M자 모발이식 3000모 후기 (강남)", category: "노하우", comments: 24, time: "어제" },
    { id: 2, title: "모발이식 생착률 높이는 방법 질문이요", category: "질문", comments: 5, time: "2일 전" },
  ];

  const hospitalResults = [
    { id: 1, name: "강남 득모의원", address: "서울 강남구 역삼동", tags: ["모발이식", "비대면진료"], rating: 4.8, reviews: 124 },
    { id: 3, name: "여의도 풍성한의원", address: "서울 영등포구 여의도동", tags: ["모발이식", "여성탈모"], rating: 4.9, reviews: 210 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-50">
        <Link href="/" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) setIsSearched(false);
            }}
            placeholder="모발이식, 부작용, 병원 이름 검색"
            className="w-full bg-gray-100 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </form>
      </div>

      {/* Search Results */}
      <div className="flex flex-col p-4 gap-6">
        {!isSearched ? (
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="font-bold text-gray-900 text-sm">인기 검색어</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {["모발이식 비용", "핀페시아", "미녹시딜", "두피문신", "강남 병원"].map(keyword => (
                <button 
                  key={keyword}
                  onClick={() => { setQuery(keyword); setIsSearched(true); }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* 커뮤니티 결과 */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  커뮤니티 검색결과 <span className="text-teal-600">{communityResults.length}</span>
                </h3>
                <button className="text-xs text-gray-500 hover:text-gray-900">더보기</button>
              </div>
              <div className="flex flex-col gap-2">
                {communityResults.map(post => (
                  <Link key={post.id} href={`/community/${post.id}`} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 hover:border-teal-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-sm">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-400">{post.time}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{post.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MessageCircle className="w-3.5 h-3.5" /> 댓글 {post.comments}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 병원 결과 */}
            <section className="flex flex-col gap-3">
               <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  병원 검색결과 <span className="text-teal-600">{hospitalResults.length}</span>
                </h3>
                <button className="text-xs text-gray-500 hover:text-gray-900">더보기</button>
              </div>
              <div className="flex flex-col gap-3">
                {hospitalResults.map(hospital => (
                  <Link key={hospital.id} href={`/hospitals/${hospital.id}`} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3 hover:border-teal-100">
                    <div className="w-16 h-16 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-teal-200">사진</span>
                    </div>
                    <div className="flex flex-col w-full">
                      <h4 className="font-bold text-gray-900 text-sm">{hospital.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {hospital.address}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                         <div className="flex gap-1">
                          {hospital.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-0.5 text-xs font-medium text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {hospital.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
