"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ChevronRight, MessageCircle, X, Search, TrendingUp, MapPin, Star } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCHome() {
  const [mounted, setMounted] = useState(false);

  const [popularPhotos, setPopularPhotos] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_popular_photos");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [textPosts, setTextPosts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_popular_text");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [reviewPosts, setReviewPosts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_reviews");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [infoPosts, setInfoPosts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_info");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [doctors, setDoctors] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_doctors");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [banners, setBanners] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_banners");
        return cached ? JSON.parse(cached) : {};
      } catch { return {}; }
    }
    return {};
  });
  const [bannersLoaded, setBannersLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);

    fetch('/api/posts/list?sort=popular&hasImage=true&limit=6')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setPopularPhotos(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_popular_photos", JSON.stringify(posts));
        }
      });

    fetch('/api/posts/list?sort=popular&hasImage=false&limit=4')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setTextPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_popular_text", JSON.stringify(posts));
        }
      });
      
    fetch('/api/posts/list?category=리얼후기&limit=4')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setReviewPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_reviews", JSON.stringify(posts));
        }
      });
      
    fetch('/api/posts/list?category=탈모정보&limit=4')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setInfoPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_info", JSON.stringify(posts));
        }
      });
      
    fetch('/api/hospital/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const clinics = data.clinics || [];
          setDoctors(clinics);
          if (typeof window !== "undefined") {
            localStorage.setItem("cache_doctors", JSON.stringify(clinics));
          }
        }
      });

    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const bMap = {};
          data.banners.forEach(b => { bMap[b.id] = b; });
          setBanners(bMap);
          if (typeof window !== "undefined") {
            localStorage.setItem("cache_banners", JSON.stringify(bMap));
          }
        }
        setBannersLoaded(true);
      })
      .catch(() => {
        setBannersLoaded(true);
      });
  }, []);

  const reviewPhotos = reviewPosts.slice(0, 4);
  const infoPhotos = infoPosts.slice(0, 4);

  const columnPhotos = [
    { id: 201, title: "절개 vs 비절개", imgUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=200&h=200&fit=crop" },
    { id: 202, title: "3000모 이식 과정", imgUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop" },
    { id: 203, title: "이식 후 생착률", imgUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&h=200&fit=crop" },
    { id: 204, title: "병원 고르는 꿀팁", imgUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&h=200&fit=crop" },
  ];

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Hero Banner (main_a_1) */}
        {!bannersLoaded && !banners.main_a_1 ? (
          <div className="w-full h-[180px] rounded-lg bg-gray-200 animate-pulse shrink-0 border border-gray-100" />
        ) : banners.main_a_1?.is_active ? (
          <Link href={banners.main_a_1.link_url || "#"} className="relative overflow-hidden rounded-lg shadow-lg flex group w-full h-[180px] shrink-0 border border-gray-100">
            <img src={banners.main_a_1.image_url} alt={banners.main_a_1.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </Link>
        ) : (
          <section className="relative overflow-hidden rounded-lg shadow-lg flex bg-slate-950 group w-full h-[180px] shrink-0 border border-gray-100">
            <img 
              src="/ai_diagnosis_banner.png" 
              alt="AI 탈모분석 배경" 
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-102 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
            
            <div className="relative z-10 flex flex-col justify-center h-full pl-10 pr-6 w-full">
              <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-sm flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent font-black">Ai</span> 
                탈모분석
              </h2>
              <p className="text-gray-300 text-sm font-medium mt-1.5 drop-shadow">
                지금 바로 분석해보세요.
              </p>
              <div className="mt-3">
                <Link 
                  href="/diagnosis" 
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  분석 시작하기
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 탈모 리얼후기 + 탈모 정보 - 2열 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 리얼후기 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base"><span className="text-gray-900">관리 및 이식</span> <span className="text-teal-600">리얼후기</span></h3>
              <Link href="/reviews" className="text-xs font-medium text-teal-600 flex items-center">더보기 <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {reviewPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {reviewPhotos.map((photo) => (
                  <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                    <div className={`w-full aspect-square rounded-md overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${!photo.imageUrl && 'bg-gray-50'}`}>
                      {photo.imageUrl ? (
                        <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">사진 없음</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-800 text-[12px] leading-snug line-clamp-2 mt-0.5">{photo.title}</h4>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={`sk-pc-rev-${i}`} className="flex flex-col gap-2 animate-pulse">
                    <div className="w-full aspect-square rounded-md bg-gray-200 border border-gray-100 shadow-sm"></div>
                    <div className="h-3 bg-gray-200 rounded-sm w-3/4 mt-1"></div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 탈모 정보 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">탈모 정보</h3>
              <Link href="/community?category=탈모정보" className="text-xs font-medium text-teal-600 flex items-center">더보기 <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {infoPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {infoPhotos.map((photo) => (
                  <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                    <div className={`w-full aspect-square rounded-md overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${!photo.imageUrl && 'bg-gray-50'}`}>
                      {photo.imageUrl ? (
                        <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-gray-400 text-[10px]">사진 없음</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-800 text-[12px] leading-snug line-clamp-2 mt-0.5">{photo.title}</h4>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={`sk-pc-info-${i}`} className="flex flex-col gap-2 animate-pulse">
                    <div className="w-full aspect-square rounded-md bg-gray-200 border border-gray-100 shadow-sm"></div>
                    <div className="h-3 bg-gray-200 rounded-sm w-3/4 mt-1"></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 실시간 인기글 - Grid */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-gray-900">실시간 인기글</h3>
            <Link href="/community" className="text-sm font-medium text-teal-600 flex items-center hover:text-teal-700">
              더보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {popularPhotos.length > 0 ? (
            <div className="grid grid-cols-6 gap-3 mb-5">
              {popularPhotos.map((photo) => (
                <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                  <div className="w-full aspect-square rounded-md overflow-hidden border border-gray-100 shadow-sm">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h4 className="font-medium text-gray-800 text-[13px] line-clamp-1 group-hover:text-teal-600 transition-colors">{photo.title}</h4>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3 mb-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={`sk-pc-pop-${i}`} className="flex flex-col gap-2 animate-pulse">
                  <div className="w-full aspect-square rounded-md bg-gray-200 border border-gray-100 shadow-sm"></div>
                  <div className="h-3 bg-gray-200 rounded-sm w-3/4 mt-1"></div>
                </div>
              ))}
            </div>
          )}
          {textPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6">
              {textPosts.map((post) => (
                <Link key={post.id} href={`/community/detail?id=${post.id}`} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    <h4 className="font-medium text-gray-800 text-[14px] line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-[13px] shrink-0 ml-4">
                    <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={`sk-pc-pop-txt-${i}`} className="flex items-center justify-between py-2 animate-pulse">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0" />
                    <div className="h-4 bg-gray-200 rounded-sm w-2/3"></div>
                  </div>
                  <div className="w-8 h-4 bg-gray-200 rounded-sm"></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 견적 배너 (main_a_2) */}
        {banners.main_a_2?.is_active ? (
          <Link href={banners.main_a_2.link_url || "#"} className="w-full rounded-lg shadow-sm overflow-hidden block border border-gray-200 group">
             <img src={banners.main_a_2.image_url} alt={banners.main_a_2.title} className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity" />
          </Link>
        ) : (
          <Link href="/quote" className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg py-6 px-8 shadow-lg group relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-colors" />
            <div className="flex flex-col gap-1 z-10">
              <span className="text-teal-400 text-sm font-bold">모발이식 비용, 직접 비교하세요!</span>
              <h3 className="text-white font-bold text-xl">비대면 견적받기</h3>
            </div>
            <div className="bg-teal-500 text-white font-bold px-6 py-2.5 rounded-md z-10 shadow-md group-hover:bg-teal-400 transition-colors">시작하기</div>
          </Link>
        )}

        {/* 원장님 칼럼 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900">원장님 리얼 칼럼</h3>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">공식</span>
            </div>
            <Link href="/transplant" className="text-sm font-medium text-teal-600 flex items-center">더보기 <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {columnPhotos.map((photo) => (
              <Link key={photo.id} href={`/transplant/${photo.id}`} className="flex flex-col gap-2 group">
                <div className="w-full aspect-square rounded-md overflow-hidden border border-gray-100 shadow-sm">
                  <img src={photo.imgUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h4 className="font-medium text-gray-800 text-[13px] line-clamp-1">{photo.title}</h4>
              </Link>
            ))}
          </div>
        </section>

        {/* 1:1 상담 의사 목록 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900">모발이식 1:1 상담</h3>
              <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded">무료</span>
            </div>
            <Link href="/consult" className="text-sm font-medium text-teal-600 flex items-center">전체보기 <ChevronRight className="w-4 h-4" /></Link>
          </div>
          {doctors.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {doctors.slice(0, 4).map((doc) => (
                <Link key={doc.id} href={`/consult/detail?id=${doc.id}`} className="flex flex-col gap-3 group p-3 rounded-md border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
                  <div className="w-full aspect-square rounded-md overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50">
                    {doc.image_url ? (
                      <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <img src="/logo.jpg" alt="logo" className="w-1/2 h-1/2 opacity-20 grayscale group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 text-[14px]">{doc.name}</h4>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{doc.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-teal-600 mt-1">
                      <MessageCircle className="w-3 h-3" /> 누적상담 {doc.consults}건
                    </div>
                    <p className="text-[12px] text-gray-600 line-clamp-1 mt-1">{doc.description || "소개가 없습니다."}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={`sk-pc-doc-${i}`} className="flex flex-col gap-3 p-3 rounded-md border border-gray-100 animate-pulse">
                  <div className="w-full aspect-square rounded-md bg-gray-200 border border-gray-100 shadow-sm"></div>
                  <div className="h-4 bg-gray-200 rounded-sm w-1/2 mt-1"></div>
                  <div className="h-3 bg-gray-200 rounded-sm w-3/4"></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right Sidebar */}
      <PCSidebar />
    </div>
  );
}
