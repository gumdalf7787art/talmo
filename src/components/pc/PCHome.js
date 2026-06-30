"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, ChevronRight, MessageCircle, X, Search, TrendingUp, MapPin, Star } from "lucide-react";
import PCSidebar from "@/components/pc/PCSidebar";

export default function PCHome() {
  const [bannerType, setBannerType] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [popularPhotos, setPopularPhotos] = useState([]);
  const [textPosts, setTextPosts] = useState([]);
  const [reviewPosts, setReviewPosts] = useState([]);
  const [infoPosts, setInfoPosts] = useState([]);

  useEffect(() => {
    setMounted(true);
    const hasDiagnosed = localStorage.getItem("hasDiagnosed");
    setBannerType(hasDiagnosed ? "community" : "diagnosis");

    fetch('/api/posts/list?sort=popular&hasImage=true&limit=6')
      .then(res => res.json())
      .then(data => setPopularPhotos(data.posts || []));

    fetch('/api/posts/list?sort=popular&hasImage=false&limit=4')
      .then(res => res.json())
      .then(data => setTextPosts(data.posts || []));
      
    fetch('/api/posts/list?category=由ъ뼹?꾧린&limit=4')
      .then(res => res.json())
      .then(data => setReviewPosts(data.posts || []));
      
    fetch('/api/posts/list?category=?덈え?뺣낫&limit=4')
      .then(res => res.json())
    fetch('/api/posts/list?category=?덈え?뺣낫&limit=4')
      .then(res => res.json())
      .then(data => setInfoPosts(data.posts || []));
      
    fetch('/api/hospital/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDoctors(data.clinics || []);
        }
      });
  }, []);

  const handleDismissDiagnosis = () => {
    localStorage.setItem("hasDiagnosed", "true");
    setBannerType("community");
  };



  const reviewPhotos = reviewPosts.slice(0, 4);
  const infoPhotos = infoPosts.slice(0, 4);

  const columnPhotos = [
    { id: 201, title: "?덇컻 vs 鍮꾩젅媛?, imgUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=200&h=200&fit=crop" },
    { id: 202, title: "3000紐??댁떇 怨쇱젙", imgUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop" },
    { id: 203, title: "?댁떇 ???앹갑瑜?, imgUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&h=200&fit=crop" },
    { id: 204, title: "蹂묒썝 怨좊Ⅴ??轅??, imgUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&h=200&fit=crop" },
  ];

  const [doctors, setDoctors] = useState([]);

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Hero Banner */}
        {mounted && bannerType === "diagnosis" && (
          <section className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-700 rounded-lg p-8 text-white shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-white/20 p-3 rounded-md backdrop-blur-sm">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">???덈え???됯퇏?쇨퉴?</h2>
                  <p className="text-teal-100 text-sm mt-1">AI媛 ???곕졊/?깅퀎 ?됯퇏怨?鍮꾧탳 遺꾩꽍?대뱶由쎈땲??/p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/diagnosis" onClick={handleDismissDiagnosis} className="bg-white text-teal-600 font-bold px-6 py-2.5 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                  臾대즺 AI 遺꾩꽍 ?쒖옉
                </Link>
                <button onClick={handleDismissDiagnosis} className="text-white/70 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          </section>
        )}

        {mounted && bannerType === "community" && (
          <section className="relative overflow-hidden bg-gray-900 rounded-lg p-8 text-white shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-teal-500/20 p-3 rounded-md backdrop-blur-sm border border-teal-500/30">
                  <MessageCircle className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-teal-50">1000留??덈え??怨좊??닿껐</h2>
                  <p className="text-gray-400 text-sm mt-1">?덈え而ㅻ??덊떚 <span className="text-teal-400 font-bold">?덈え??/span>?먯꽌 ?④퍡 ?섎닠??/p>
                </div>
              </div>
              <Link href="/community" className="bg-teal-600 text-white font-bold px-6 py-2.5 rounded-md shadow-sm hover:bg-teal-700 transition-colors">
                而ㅻ??덊떚 ?낆옣
              </Link>
            </div>
            <div className="absolute right-0 top-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />
          </section>
        )}

        {/* ?덈え 由ъ뼹?꾧린 + ?덈え ?뺣낫 - 2??*/}
        <div className="grid grid-cols-2 gap-3">
          {/* 由ъ뼹?꾧린 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base"><span className="text-gray-900">愿由?諛??댁떇</span> <span className="text-teal-600">由ъ뼹?꾧린</span></h3>
              <Link href="/reviews" className="text-xs font-medium text-teal-600 flex items-center">?붾낫湲?<ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {reviewPhotos.map((photo) => (
                <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                  <div className={`w-full aspect-square rounded-md overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${!photo.imageUrl && 'bg-gray-50'}`}>
                    {photo.imageUrl ? (
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">?ъ쭊 ?놁쓬</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 text-[12px] leading-snug line-clamp-2 mt-0.5">{photo.title}</h4>
                </Link>
              ))}
            </div>
          </section>

          {/* ?덈え ?뺣낫 */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">?덈え ?뺣낫</h3>
              <Link href="/community?category=?덈え?뺣낫" className="text-xs font-medium text-teal-600 flex items-center">?붾낫湲?<ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {infoPhotos.map((photo) => (
                <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                  <div className={`w-full aspect-square rounded-md overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${!photo.imageUrl && 'bg-gray-50'}`}>
                    {photo.imageUrl ? (
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">?ъ쭊 ?놁쓬</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 text-[12px] leading-snug line-clamp-2 mt-0.5">{photo.title}</h4>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ?ㅼ떆媛??멸린湲 - Grid */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-gray-900">?ㅼ떆媛??멸린湲</h3>
            <Link href="/community" className="text-sm font-medium text-teal-600 flex items-center hover:text-teal-700">
              ?붾낫湲?<ChevronRight className="w-4 h-4" />
            </Link>
          </div>
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
        </section>

        {/* 寃ъ쟻 諛곕꼫 */}
        <Link href="/quote" className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg py-6 px-8 shadow-lg group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-colors" />
          <div className="flex flex-col gap-1 z-10">
            <span className="text-teal-400 text-sm font-bold">紐⑤컻?댁떇 鍮꾩슜, 吏곸젒 鍮꾧탳?섏꽭??</span>
            <h3 className="text-white font-bold text-xl">鍮꾨?硫?寃ъ쟻諛쏄린</h3>
          </div>
          <div className="bg-teal-500 text-white font-bold px-6 py-2.5 rounded-md z-10 shadow-md group-hover:bg-teal-400 transition-colors">?쒖옉?섍린</div>
        </Link>

        {/* ?먯옣??移쇰읆 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900">?먯옣??由ъ뼹 移쇰읆</h3>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">怨듭떇</span>
            </div>
            <Link href="/transplant" className="text-sm font-medium text-teal-600 flex items-center">?붾낫湲?<ChevronRight className="w-4 h-4" /></Link>
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

        {/* 1:1 ?곷떞 ?섏궗 紐⑸줉 */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900">紐⑤컻?댁떇 1:1 ?곷떞</h3>
              <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded">臾대즺</span>
            </div>
            <Link href="/consult" className="text-sm font-medium text-teal-600 flex items-center">?꾩껜蹂닿린 <ChevronRight className="w-4 h-4" /></Link>
          </div>
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
                    <MessageCircle className="w-3 h-3" /> ?꾩쟻?곷떞 {doc.consults}嫄?
                  </div>
                  <p className="text-[12px] text-gray-600 line-clamp-1 mt-1">{doc.description || "?뚭컻媛 ?놁뒿?덈떎."}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <PCSidebar />
    </div>
  );
}

