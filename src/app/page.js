"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ChevronRight, MessageCircle, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import useMediaQuery from "@/hooks/useMediaQuery";
import PCHome from "@/components/pc/PCHome";
import MoltenMetal from "@/components/MoltenMetal";
import EchoText from "@/components/EchoText";

export default function Home() {
  const isPC = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [bannerType, setBannerType] = useState(null); // 'diagnosis' or 'community'
  const [mounted, setMounted] = useState(false);
  const [currentDoctorSlide, setCurrentDoctorSlide] = useState(0);

  const [doctors, setDoctors] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_doctors");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDoctorSlide((prev) => (prev + 1) % (doctors.length > 0 ? (doctors.length / 2) : 1));
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

  const [popularPhotos, setPopularPhotos] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_popular_photos");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [popularTextPosts, setPopularTextPosts] = useState(() => {
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
  const [expertPosts, setExpertPosts] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cache_expert");
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
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
        setPopularTextPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_popular_text", JSON.stringify(posts));
        }
      });
      
    fetch('/api/posts/list?category=리얼후기&limit=6')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setReviewPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_reviews", JSON.stringify(posts));
        }
      });
      
    fetch('/api/posts/list?category=탈모정보&limit=6')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setInfoPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_info", JSON.stringify(posts));
        }
      });
      
    fetch('/api/posts/list?category=전문가칼럼&limit=6')
      .then(res => res.json())
      .then(data => {
        const posts = data.posts || [];
        setExpertPosts(posts);
        if (typeof window !== "undefined") {
          localStorage.setItem("cache_expert", JSON.stringify(posts));
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
  }, []);



  const infoPhotos = infoPosts.filter(p => p.imageUrl).slice(0, 6);
  const infoTextPosts = infoPosts.filter(p => !p.imageUrl).slice(0, 4);
  const expertPhotos = expertPosts.filter(p => p.imageUrl).slice(0, 6);
  const expertTextPosts = expertPosts.filter(p => !p.imageUrl).slice(0, 4);

  const handleInvite = () => {
    let currentUser = null;
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { currentUser = JSON.parse(savedUser); } catch(e){}
    }

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }
    
    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init('f557c50a623379e0c2abb685232ade41');
      }
    } else {
      alert("카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const rawCode = currentUser.recommend_code || currentUser.id;
    const inviteUrl = `https://talmotalk.com/signup?ref=${rawCode}`;
    const safeInviteUrl = encodeURI(inviteUrl);
    const shareUrl = safeInviteUrl;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '탈모톡에 초대합니다!',
        description: `초대장을 클릭하고 간편가입 하시면 AI 탈모분석 티켓 5장(기본2+보너스3)이 즉시 발급됩니다.\n추천인 코드: ${rawCode}`,
        imageUrl: 'https://talmotalk.com/og-image.jpg',
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '무료 분석권 받기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  if (isPC) return <PCHome />;

  return (
    <div className="flex flex-col w-full">
      {/* Mobile Hero Section */}
      <div className="w-full h-[260px] relative overflow-hidden shrink-0 group bg-slate-900 border-b border-teal-900/50">
        <div className="absolute inset-0 z-0">
          <MoltenMetal
            color1="#1e1b4b"
            color2="#a855f7"
            color3="#faf5ff"
            speed={0.35}
            scale={4}
            detail={3}
            glow={1.6}
            coreSize={0.1}
            swirl={1}
            fold={-0.2}
            blackPoint={0.05}
            brightness={1.3}
            colorMode="molten"
            grain={true}
            grainIntensity={0.05}
            mouseInteraction={true}
            mouseStrength={0.3}
            opacity={1.0}
          />
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none bg-black/20">
          <div className="mb-4">
            <EchoText
              text="Ai 탈모분석"
              echoes={12}
              direction="diagonal"
              tint="#a855f7"
              color="#ffffff"
              fontSize="2.5rem"
              fontWeight={900}
            />
          </div>
          <p className="text-[13px] text-teal-50 font-medium mb-5 drop-shadow-md px-4 text-center break-keep">
            1000만 탈모인의 선택, 지금 바로 시작하세요
          </p>
          <div className="pointer-events-auto">
            <Link 
              href="/diagnosis" 
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 active:scale-95 text-white font-bold text-[13px] px-5 py-2.5 rounded-full shadow-lg transition-all"
            >
              무료 분석 시작하기
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <div className="flex flex-col gap-3">
      
      {/* Invite Friend Banner */}
      <section>
        <button 
          onClick={handleInvite} 
          className="w-full flex items-center justify-between bg-[#FEE500] rounded-xl py-3 px-4 shadow-sm overflow-hidden relative group text-left border border-[#F4DC00]"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/40 rounded-full blur-xl -mr-8 -mt-8"></div>
          <div className="flex flex-col gap-0.5 z-10">
            <span className="text-black/80 text-[11px] font-bold tracking-tight flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> 무료 분석권 이벤트
            </span>
            <h3 className="text-black font-bold text-[15px]">카톡으로 친구 초대하고<br/>분석권 받기</h3>
          </div>
          <div className="bg-black/5 text-black font-bold text-[11px] px-3 py-1.5 rounded-full z-10 shadow-sm flex items-center gap-1">
            초대하기 <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      </section>

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
        {popularPhotos.length > 0 ? (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
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
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            <div className="w-4 shrink-0 snap-start"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={`sk-pop-${i}`} className="flex-shrink-0 w-[25%] snap-start flex flex-col gap-1.5 mr-1.5 animate-pulse">
                <div className="w-full aspect-square rounded-md bg-gray-200 border border-gray-100"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-3/4 mx-0.5 mt-0.5"></div>
              </div>
            ))}
            <div className="w-4 shrink-0 snap-end"></div>
          </div>
        )}

        {/* Traditional Text Posts (4 items) */}
        {popularTextPosts.length > 0 ? (
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
        ) : (
          <div className="flex flex-col gap-2 py-1.5">
            {[1, 2, 3].map((i) => (
              <div key={`sk-pop-txt-${i}`} className="flex items-center justify-between py-1.5 animate-pulse">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0"></span>
                  <div className="h-3 bg-gray-200 rounded-sm w-2/3"></div>
                </div>
                <div className="w-8 h-3 bg-gray-200 rounded-sm"></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hair Loss Real Reviews */}
      <section className="flex flex-col gap-1 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base"><span className="text-gray-900">관리 및 이식</span> <span className="text-teal-600">리얼후기</span></h3>
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
                <h4 className="font-medium text-gray-800 text-[11px] leading-snug line-clamp-2 mt-1 break-keep px-0.5">{photo.title}</h4>
              </Link>
            ))}
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            <div className="w-4 shrink-0 snap-start"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={`sk-rev-${i}`} className="flex-shrink-0 w-[26%] snap-start flex flex-col gap-1.5 mr-2 animate-pulse">
                <div className="w-full aspect-square rounded-md bg-gray-200 border border-gray-100"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-3/4 mx-0.5 mt-1"></div>
              </div>
            ))}
            <div className="w-4 shrink-0 snap-end"></div>
          </div>
        )}
      </section>

      {/* Quote Banner */}
      <section className="mt-2.5 -mx-4 px-4">
        <button 
          onClick={() => alert("준비중입니다.")} 
          className="w-full text-left flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-md py-3 px-4 shadow-lg overflow-hidden relative group"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-colors"></div>
          <div className="flex flex-col gap-0.5 z-10">
            <span className="text-teal-400 text-[11px] font-bold tracking-tight">모발이식 비용, 직접 비교하세요!</span>
            <h3 className="text-white font-bold text-[15px]">비대면 견적받기</h3>
          </div>
          <div className="bg-teal-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10 shadow-md group-hover:bg-teal-400 transition-colors shrink-0">
            시작하기
          </div>
        </button>
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
        {/* Info Photos (6 items) */}
        {infoPhotos.length > 0 ? (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
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
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            <div className="w-4 shrink-0 snap-start"></div>
            {[1, 2, 3].map((i) => (
              <div key={`sk-info-${i}`} className="flex-shrink-0 w-[30%] snap-start flex flex-col gap-1.5 mr-2 animate-pulse">
                <div className="w-full aspect-square rounded-xl bg-gray-200 border border-gray-100"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-3/4 mx-0.5 mt-1"></div>
              </div>
            ))}
            <div className="w-4 shrink-0 snap-end"></div>
          </div>
        )}

        {/* Info Text Posts (4 items) */}
        {infoTextPosts.length > 0 ? (
          <div className="flex flex-col">
            {infoTextPosts.map((post) => (
              <Link key={`info-post-${post.id}`} href={`/community/detail?id=${post.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0"></span>
                  <h4 className="font-medium text-gray-800 text-[13px] leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">{post.title}</h4>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 ml-4">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-1.5">
            {[1, 2].map((i) => (
              <div key={`sk-info-txt-${i}`} className="flex items-center justify-between py-1.5 animate-pulse">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0"></span>
                  <div className="h-3 bg-gray-200 rounded-sm w-2/3"></div>
                </div>
                <div className="w-8 h-3 bg-gray-200 rounded-sm"></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cafe Banner */}
      <section className="mt-4 -mx-4 px-4">
        <Link 
          href="https://cafe.naver.com/bboyforeverhiphop" 
          target="_blank" 
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg p-4 shadow-sm overflow-hidden relative block group"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-white/20 transition-colors"></div>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1 mb-1">
              <div className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 text-white text-[9px] font-bold">
                <span className="bg-white text-emerald-600 px-1 rounded-sm text-[8px] font-black">N</span> 카페
              </div>
            </div>
            <h3 className="text-white font-bold text-[15px] leading-snug">
              네이버 탈모톡 카페<br/>함께 나누고 해결해요!
            </h3>
            <div className="mt-2 inline-flex items-center text-white/90 text-[11px] font-medium group-hover:text-white transition-colors">
              바로가기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>
      </section>

      {/* Doctor's Real Column */}
      <section className="flex flex-col gap-1 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base text-gray-900">전문가 칼럼</h3>
            <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">공식</span>
          </div>
          <Link href="/community?category=전문가칼럼" className="text-xs font-medium text-teal-600 flex items-center">
            더보기 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Photos (6 items) */}
        {expertPhotos.length > 0 ? (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            <div className="w-4 shrink-0 snap-start" aria-hidden="true"></div>
            {expertPhotos.map((photo) => (
              <Link 
                key={`expert-photo-${photo.id}`} 
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
            <div className="w-4 shrink-0 snap-end" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-2 -mx-4 snap-x hide-scrollbar">
            <div className="w-4 shrink-0 snap-start"></div>
            {[1, 2, 3].map((i) => (
              <div key={`sk-exp-${i}`} className="flex-shrink-0 w-[30%] snap-start flex flex-col gap-1.5 mr-2 animate-pulse">
                <div className="w-full aspect-square rounded-xl bg-gray-200 border border-gray-100"></div>
                <div className="h-3 bg-gray-200 rounded-sm w-3/4 mx-0.5 mt-1"></div>
              </div>
            ))}
            <div className="w-4 shrink-0 snap-end"></div>
          </div>
        )}

        {/* Text Posts (4 items) */}
        {expertTextPosts.length > 0 ? (
          <div className="flex flex-col">
            {expertTextPosts.map((post) => (
              <Link key={`expert-post-${post.id}`} href={`/community/detail?id=${post.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0"></span>
                  <h4 className="font-medium text-gray-800 text-[13px] leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">{post.title}</h4>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 ml-4">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-1.5">
            {[1, 2].map((i) => (
              <div key={`sk-exp-txt-${i}`} className="flex items-center justify-between py-1.5 animate-pulse">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0"></span>
                  <div className="h-3 bg-gray-200 rounded-sm w-2/3"></div>
                </div>
                <div className="w-8 h-3 bg-gray-200 rounded-sm"></div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* 1:1 Consultation */}
      {false && (
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
                  <Link key={`doc-${doc.id}`} href={`/consult/detail?id=${doc.id}`} className="flex-1 flex flex-col gap-2 group">
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-sm border border-gray-100 flex items-center justify-center bg-gray-50">
                      {doc.image_url ? (
                        <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <img src="/logo.jpg" alt="logo" className="w-1/2 h-1/2 opacity-20 grayscale group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-[13px]">{doc.name}</h4>
                        <span className="text-[10px] text-gray-500 line-clamp-1">{doc.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-teal-600 mt-0.5">
                        <MessageCircle className="w-3 h-3" /> 누적상담 {doc.consults}건
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-snug mt-1 break-keep">
                        {doc.description || "등록된 소개가 없습니다."}
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
      )}
      </div>
    </div>
  );
}
