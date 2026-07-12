"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft, MessageCircle, Star, MapPin } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCSearch from "@/components/pc/PCSearch";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPC = useMediaQuery("(min-width: 1024px)");
  const initialQuery = searchParams.get('q') || "";

  const [query, setQuery] = useState(initialQuery);
  const [isSearched, setIsSearched] = useState(!!initialQuery);
  const [communityResults, setCommunityResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
      setIsSearched(!!initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isSearched && query) {
      setIsLoading(true);
      fetch(`/api/posts/list?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCommunityResults(data.posts);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isSearched, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearched(true);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };


  const hospitalResults = [
    { id: 1, name: "강남 득모의원", address: "서울 강남구 역삼동", tags: ["모발이식", "비대면진료"], rating: 4.8, reviews: 124 },
    { id: 3, name: "여의도 풍성한의원", address: "서울 영등포구 여의도동", tags: ["모발이식", "여성탈모"], rating: 4.9, reviews: 210 },
  ];

  const categoryColor = (cat) => {
    switch(cat) {
      case '탈모수다': return 'text-orange-500';
      case '리얼후기': return 'text-teal-500';
      case '탈모정보': return 'text-blue-500';
      case '닥터칼럼': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  if (isPC) {
    return <PCSearch initialQuery={initialQuery} communityResults={communityResults} hospitalResults={hospitalResults} isLoading={isLoading} />;
  }

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
                  onClick={() => { 
                    setQuery(keyword); 
                    setIsSearched(true);
                    router.push(`/search?q=${encodeURIComponent(keyword)}`);
                  }}
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
              <div className="flex flex-col bg-white border-y border-gray-100">
                {isLoading ? (
                  <div className="py-10 text-center text-sm text-gray-500">검색 중입니다...</div>
                ) : communityResults.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
                ) : (
                  communityResults.map(post => (
                  <Link key={post.id} href={`/community/detail?id=${post.id}`} className="py-3 px-4 border-b border-gray-100 active:bg-gray-50 transition-colors flex items-start gap-2 last:border-b-0">
                    <span className={`text-[11px] font-medium shrink-0 pt-[2px] w-[52px] ${categoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    
                    <div className="flex flex-col flex-1 min-w-0 pr-1">
                      <h3 className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 mb-1.5">
                        {post.title}
                        <span className="text-teal-600 font-bold ml-1.5 text-[13px]">[{post.comments || 0}]</span>
                      </h3>
                      <div className="flex items-center mt-auto">
                        <div className="flex items-center gap-2 text-[12px] text-gray-400">
                          <span>{post.author}</span>
                          <span className="text-gray-300">|</span>
                          <span>{post.time || '방금 전'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {post.imageUrl && (
                      <div className="w-[52px] h-[52px] shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 ml-1">
                        <img src={post.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </Link>
                  ))
                )}
              </div>
            </section>

            {/* 병원 결과 */}
            {false && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">로딩 중...</div>}>
      <SearchContent />
    </Suspense>
  );
}
