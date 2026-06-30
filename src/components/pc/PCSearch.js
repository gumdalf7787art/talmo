"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, Star, MapPin } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCSearch({ initialQuery, communityResults, hospitalResults, isLoading }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery || "");
  const [isSearched, setIsSearched] = useState(!!initialQuery);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsSearched(true);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const categoryColor = (cat) => {
    switch(cat) {
      case '?덈え?섎떎': return 'text-orange-500 bg-orange-50';
      case '由ъ뼹?꾧린': return 'text-teal-600 bg-teal-50';
      case '?덈え?뺣낫': return 'text-blue-500 bg-blue-50';
      case '?ν꽣移쇰읆': return 'text-indigo-500 bg-indigo-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="紐⑤컻?댁떇, 遺?묒슜, 蹂묒썝 ?대쫫 寃?? 
              className="w-full bg-gray-100 rounded-md py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 transition-shadow" 
            />
          </div>
        </div>

        {!isSearched ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">?멸린 寃?됱뼱</h3>
            <div className="flex flex-wrap gap-2">
              {["紐⑤컻?댁떇 鍮꾩슜", "??섏떆??, "誘몃끃?쒕뵜", "?먰뵾臾몄떊", "媛뺣궓 蹂묒썝"].map(keyword => (
                <button 
                  key={keyword}
                  onClick={() => { 
                    setQuery(keyword); 
                    setIsSearched(true);
                    router.push(`/search?q=${encodeURIComponent(keyword)}`);
                  }}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Community Results */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">
                  而ㅻ??덊떚 寃?됯껐怨?<span className="text-teal-600 ml-1">{communityResults.length}</span>
                </h3>
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-[80px_1fr_120px_80px_60px] px-5 py-3 bg-gray-50 border-b border-gray-200 text-[13px] font-bold text-gray-500">
                <span>移댄뀒怨좊━</span>
                <span>?쒕ぉ</span>
                <span>?묒꽦??/span>
                <span className="text-center">議고쉶</span>
                <span className="text-center">?볤?</span>
              </div>

              {/* Table Rows */}
              {isLoading ? (
                <div className="py-10 text-center text-gray-500 text-sm">寃??以묒엯?덈떎...</div>
              ) : communityResults.length === 0 ? (
                <div className="py-10 text-center text-gray-500 text-sm">寃??寃곌낵媛 ?놁뒿?덈떎.</div>
              ) : (
                communityResults.map((post) => (
                  <Link key={post.id} href={`/community/detail?id=${post.id}`} className="grid grid-cols-[80px_1fr_120px_80px_60px] items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded w-fit ${categoryColor(post.category)}`}>{post.category}</span>
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <h3 className="font-semibold text-gray-900 text-[14px] line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                      {post.imageUrl && (
                        <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-200">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] text-gray-500 line-clamp-1">{post.author}</span>
                    <span className="text-[13px] text-gray-400 text-center">{post.views?.toLocaleString() || 0}</span>
                    <div className="flex items-center justify-center gap-1 text-teal-600 text-[13px] font-bold">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments || 0}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Hospital Results */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">
                  蹂묒썝 寃?됯껐怨?<span className="text-teal-600 ml-1">{hospitalResults.length}</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-5">
                {hospitalResults.map(hospital => (
                  <Link key={hospital.id} href={`/hospitals/${hospital.id}`} className="flex flex-col gap-3 group p-4 rounded-md border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-md bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                        <span className="text-xs font-bold text-teal-600">?ъ쭊</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-teal-600 transition-colors">{hospital.name}</h4>
                        <div className="flex items-center gap-1 text-[13px] text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{hospital.address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <div className="flex flex-wrap gap-1">
                        {hospital.tags.map(tag => (
                          <span key={tag} className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        {hospital.rating} <span className="text-gray-400 font-medium text-xs">({hospital.reviews})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sidebar */}
      <PCSidebar />
    </div>
  );
}

