"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ChevronRight, MessageCircle, X, Search } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCHome from "@/components/pc/PCHome";

export default function Home() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const [bannerType, setBannerType] = useState(null); // 'diagnosis' or 'community'
  const [mounted, setMounted] = useState(false);
  const [currentDoctorSlide, setCurrentDoctorSlide] = useState(0);

  const doctors = [
    { id: 1, name: "김원장", hospital: "강남 모발 의원", reviews: 156, desc: "15년 이상 비절개 집중 진료", imgUrl: "/doctor1.png" },
    { id: 2, name: "이원장", hospital: "신촌 두피 센터", reviews: 89, desc: "여성 헤어라인 교정 전문", imgUrl: "/doctor2.png" },
    { id: 3, name: "박원장", hospital: "압구정 이식 의원", reviews: 210, desc: "맞춤형 헤어라인 디자인 설계", imgUrl: "/doctor3.png" },
    { id: 4, name: "최원장", hospital: "홍대 탈모 피부과", reviews: 134, desc: "꼼꼼한 디자인과 철저한 사후관리", imgUrl: "/doctor4.png" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDoctorSlide((prev) => (prev + 1) % (doctors.length / 2));
    }, 4000);
    return () => clearInterval(timer);
  }, [doctors.length]);

  useEffect(() => {
    setMounted(true);
    const hasDiagnosed = localStorage.getItem("hasDiagnosed");
    if (!hasDiagnosed) {
      setBannerType("diagnosis");
    } else {
      setBannerType("community");
    }
  }, []);

  const handleDismissDiagnosis = () => {
    localStorage.setItem("hasDiagnosed", "true");
    setBannerType("community");
  };

  const [popularPosts, setPopularPosts] = useState([]);
  const [reviewPosts, setReviewPosts] = useState([]);
  const [infoPosts, setInfoPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts/list?sort=popular&limit=30')
      .then(res => res.json())
      .then(data => setPopularPosts(data.posts || []));
      
    fetch('/api/posts/list?category=리얼후기&limit=6')
      .then(res => res.json())
      .then(data => setReviewPosts(data.posts || []));
      
    fetch('/api/posts/list?category=탈모정보&limit=6')
      .then(res => res.json())
      .then(data => setInfoPosts(data.posts || []));
  }, []);

  const popularPhotos = popularPosts.filter(p => p.imageUrl).slice(0, 6);
  const popularTextPosts = popularPosts.filter(p => !p.imageUrl).slice(0, 4);

  const infoPhotos = infoPosts.filter(p => p.imageUrl).slice(0, 6);
  const infoTextPosts = infoPosts.filter(p => !p.imageUrl).slice(0, 4);

  if (isPC) return <PCHome />;

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6">
      <div className="flex flex-col gap-3">
        {/* Top Search Button */}
        <Link 
          href="/search" 
          className="flex items-center gap-2 bg-white border border-gray-900 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-gray-900" />
          <span className="text-xs font-medium">궁금한 탈모 정보를 검색해보세요</span>
        </Link>

      {/* Dynamic Banner Area */}
      {mounted && bannerType === "diagnosis" && (
        <section className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-700 rounded-none -mx-4 py-3 px-4 text-white shadow-sm flex items-center justify-between">
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">내 탈모는 평균일까?</h2>
              <p className="text-teal-100 text-[10px] mt-0.5">
                AI로 내 연령/성별 평균과 비교하기
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-2">
            <Link
              href="/diagnosis"
              onClick={handleDismissDiagnosis}
              className="bg-white text-teal-600 font-bold text-xs px-3 py-1.5 rounded-md shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              무료 진단
            </Link>
            <button 
              onClick={handleDismissDiagnosis}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </section>
      )}

      {mounted && bannerType === "community" && (
        <section className="relative overflow-hidden bg-gray-900 rounded-none -mx-4 py-3 px-4 text-white shadow-sm flex items-center justify-between">
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-teal-500/20 p-1.5 rounded-lg backdrop-blur-sm shrink-0 border border-teal-500/30">
              <MessageCircle className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-teal-50">1000만 탈모의 고민해결</h2>
              <p className="text-gray-400 text-[10px] mt-0.5">
                탈모커뮤니티 <span className="text-teal-400 font-bold">탈모톡</span>
              </p>
            </div>
          </div>
          
          <div className="relative z-10">
            <Link
              href="/community"
              className="bg-teal-600 text-white font-bold text-xs px-4 py-1.5 rounded-md shadow-sm hover:bg-teal-700 transition-colors whitespace-nowrap"
            >
              입장하기
            </Link>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
        </section>
      )}
      </div>

      {/* Popular Community Posts */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900">실시간 인기글</h3>
          <Link href="/community" className="text-xs font-medium text-teal-600 flex items-center">
            더보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Photo Posts (6 items) */}
        {popularPhotos.length > 0 && (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            {/* Left spacer matches parent px-4 (16px) and acts as snap target to prevent auto-scroll */}
            <div className="w-4 shrink-0 snap-start" aria-hidden="true"></div>
            {popularPhotos.map((photo) => (
              <Link 
                key={`photo-${photo.id}`} 
                href={`/community/detail?id=${photo.id}`} 
                className="flex-shrink-0 w-[25%] snap-start flex flex-col gap-1.5 group mr-1.5"
              >
                <div className={`w-full aspect-square rounded-md shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden relative`}>
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
                <h4 className="font-medium text-gray-800 text-xs line-clamp-1 px-0.5">{photo.title}</h4>
              </Link>
            ))}
            {/* Right spacer to ensure 16px right padding */}
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        )}

        {/* Traditional Text Posts (4 items) */}
        {popularTextPosts.length > 0 && (
          <div className="flex flex-col">
            {popularTextPosts.map((post) => (
              <Link key={`post-${post.id}`} href={`/community/detail?id=${post.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0"></span>
                  <h4 className="font-medium text-gray-800 text-[13px] leading-tight line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h4>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 ml-4">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Hair Loss Real Reviews */}
      <section className="flex flex-col gap-1 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900">탈모 리얼후기</h3>
          <Link href="/community?category=리얼후기" className="text-xs font-medium text-teal-600 flex items-center">
            더보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Review Photos (6 items) */}
        {reviewPosts.length > 0 ? (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            <div className="w-4 shrink-0 snap-start" aria-hidden="true"></div>
            {reviewPosts.map((photo) => (
              <Link 
                key={`review-photo-${photo.id}`} 
                href={`/community/detail?id=${photo.id}`} 
                className="flex-shrink-0 w-[26%] snap-start flex flex-col gap-1.5 group mr-2"
              >
                <div className={`w-full aspect-square rounded-md shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden relative ${!photo.imageUrl && 'bg-gray-50'}`}>
                  {photo.imageUrl ? (
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-[10px]">사진 없음</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-[9px] text-gray-400 font-light leading-none tracking-tight">{photo.author}</span>
                  <h4 className="font-medium text-gray-800 text-[11px] leading-snug line-clamp-2 mt-1 break-keep">{photo.title}</h4>
                </div>
              </Link>
            ))}
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-100">등록된 후기가 없습니다.</div>
        )}
      </section>

      {/* Quote Banner */}
      <section className="mt-2.5 -mx-4 px-4">
        <Link href="/quote" className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-md py-3 px-4 shadow-lg overflow-hidden relative group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-colors"></div>
          <div className="flex flex-col gap-0.5 z-10">
            <span className="text-teal-400 text-[11px] font-bold tracking-tight">모발이식 비용, 직접 비교하세요!</span>
            <h3 className="text-white font-bold text-[15px]">비대면 견적받기</h3>
          </div>
          <div className="bg-teal-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10 shadow-md group-hover:bg-teal-400 transition-colors shrink-0">
            시작하기
          </div>
        </Link>
      </section>

      {/* Hair Loss Information */}
      <section className="flex flex-col gap-1 mt-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-gray-900">탈모 정보</h3>
          <Link href="/community?category=탈모정보" className="text-xs font-medium text-teal-600 flex items-center">
            더보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Info Photos (6 items) */}
        {infoPhotos.length > 0 && (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            {/* Left spacer acts as snap target */}
            <div className="w-4 shrink-0 snap-start" aria-hidden="true"></div>
            {infoPhotos.map((photo) => (
              <Link 
                key={`info-photo-${photo.id}`} 
                href={`/community/detail?id=${photo.id}`} 
                className="flex-shrink-0 w-[30%] snap-start flex flex-col gap-1.5 group mr-2"
              >
                <div className={`w-full aspect-square rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden relative ${!photo.imageUrl && 'bg-gray-50'}`}>
                  {photo.imageUrl ? (
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-[10px]">사진 없음</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
                <h4 className="font-medium text-gray-800 text-xs leading-snug line-clamp-2 px-0.5 break-keep">{photo.title}</h4>
              </Link>
            ))}
            {/* Right spacer */}
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        )}

        {/* Info Text Posts (4 items) */}
        {infoTextPosts.length > 0 && (
          <div className="flex flex-col">
            {infoTextPosts.map((post) => (
              <Link key={`info-post-${post.id}`} href={`/community/detail?id=${post.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0"></span>
                  <h4 className="font-medium text-gray-800 text-[13px] leading-tight line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h4>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 ml-4">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Ad Banner */}
      <section className="mt-4 -mx-4">
        <Link href="#" className="block w-full aspect-[4/2.5] relative overflow-hidden bg-gray-100">
          <img 
            src="/shampoo_ad_banner.png" 
            alt="탈모 샴푸 추천 광고" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-3 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
            AD
          </div>
        </Link>
      </section>

      {/* Doctor's Real Column */}
      <section className="flex flex-col gap-1 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base text-gray-900">원장님 리얼 칼럼</h3>
            <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">공식</span>
          </div>
          <Link href="/transplant" className="text-xs font-medium text-teal-600 flex items-center">
            더보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Photos (6 items) */}
        <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
          <div className="w-4 shrink-0 snap-start" aria-hidden="true"></div>
          {[
            { id: 201, title: "절개 vs 비절개", imgUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=200&h=200&fit=crop" },
            { id: 202, title: "3000모 이식 과정", imgUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop" },
            { id: 203, title: "이식 후 생착률", imgUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&h=200&fit=crop" },
            { id: 204, title: "병원 고르는 꿀팁", imgUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&h=200&fit=crop" },
            { id: 205, title: "모발이식 부작용", imgUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&h=200&fit=crop" },
            { id: 206, title: "수술 전후 주의사항", imgUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop" },
          ].map((photo) => (
            <Link 
              key={`transplant-photo-${photo.id}`} 
              href={`/transplant/${photo.id}`} 
              className="flex-shrink-0 w-[25%] snap-start flex flex-col gap-1.5 group mr-1.5"
            >
              <div className={`w-full aspect-square rounded-md shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden relative`}>
                <img src={photo.imgUrl} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
              </div>
              <h4 className="font-medium text-gray-800 text-[11px] line-clamp-1 px-0.5">{photo.title}</h4>
            </Link>
          ))}
          <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
        </div>

        {/* Text Posts (4 items) */}
        <div className="flex flex-col">
          {[
            { id: 211, title: "3000모 비절개 모발이식 1년차 리얼 후기", comments: 128 },
            { id: 212, title: "모발이식 수술 전후 주의사항 총정리", comments: 45 },
            { id: 213, title: "터키 모발이식, 비용과 위험성 알아보기", comments: 82 },
            { id: 214, title: "20대 모발이식, 과연 빠를수록 좋을까?", comments: 64 },
          ].map((post) => (
            <Link key={`transplant-post-${post.id}`} href={`/transplant/${post.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0"></span>
                <h4 className="font-medium text-gray-800 text-[13px] leading-tight line-clamp-1 group-hover:text-teal-600 transition-colors">{post.title}</h4>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 ml-4">
                <MessageCircle className="w-3.5 h-3.5" />
                {post.comments}
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* 1:1 Consultation */}
      <section className="flex flex-col gap-3 mt-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base text-gray-900">모발이식 1:1 상담</h3>
            <span className="bg-teal-50 text-teal-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">무료</span>
          </div>
          <Link href="/consult" className="text-xs font-medium text-teal-600 flex items-center">
            전체보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="relative overflow-hidden w-full">
          <div 
            className="flex transition-transform duration-500 ease-in-out" 
            style={{ transform: `translateX(-${currentDoctorSlide * 100}%)` }}
          >
            {[0, 1].map((pageIndex) => (
              <div key={`doctor-page-${pageIndex}`} className="w-full shrink-0 flex gap-2">
                {doctors.slice(pageIndex * 2, pageIndex * 2 + 2).map((doc) => (
                  <Link key={`doc-${doc.id}`} href={`/consult/${doc.id}`} className="flex-1 flex flex-col gap-2 group">
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-sm border border-gray-100">
                      <img src={doc.imgUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-[13px]">{doc.name}</h4>
                        <span className="text-[10px] text-gray-500 line-clamp-1">{doc.hospital}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-teal-600 mt-0.5">
                        <MessageCircle className="w-3 h-3" /> 후기 {doc.reviews}개
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-snug mt-1 break-keep">
                        {doc.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
          
          {/* Pagination Indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1].map((idx) => (
              <div 
                key={`indicator-${idx}`} 
                className={`h-1.5 rounded-full transition-all duration-300 ${currentDoctorSlide === idx ? 'w-4 bg-teal-500' : 'w-1.5 bg-gray-200'}`}
              ></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
