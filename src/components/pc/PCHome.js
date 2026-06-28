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
      
    fetch('/api/posts/list?category=Î¶¨Ïñº?ÑÍ∏∞&limit=4')
      .then(res => res.json())
      .then(data => setReviewPosts(data.posts || []));
      
    fetch('/api/posts/list?category=?àÎ™®?ïÎ≥¥&limit=4')
      .then(res => res.json())
    fetch('/api/posts/list?category=?àÎ™®?ïÎ≥¥&limit=4')
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
    { id: 201, title: "?àÍ∞ú vs ÎπÑÏ†àÍ∞?, imgUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=200&h=200&fit=crop" },
    { id: 202, title: "3000Î™??¥Ïãù Í≥ºÏ†ï", imgUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&h=200&fit=crop" },
    { id: 203, title: "?¥Ïãù ???ùÏ∞©Î•?, imgUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&h=200&fit=crop" },
    { id: 204, title: "Î≥ëÏõê Í≥†Î•¥??ÍøÄ??, imgUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200&h=200&fit=crop" },
  ];

  const [doctors, setDoctors] = useState([]);

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Hero Banner */}
        {mounted && bannerType === "diagnosis" && (
          <section className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">???àÎ™®???âÍ∑†?ºÍπå?</h2>
                  <p className="text-teal-100 text-sm mt-1">AIÍ∞Ä ???∞Î†π/?±Î≥Ñ ?âÍ∑†Í≥?ÎπÑÍµê Î∂ÑÏÑù?¥ÎìúÎ¶ΩÎãà??/p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/diagnosis" onClick={handleDismissDiagnosis} className="bg-white text-teal-600 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                  Î¨¥Î£å AI Î∂ÑÏÑù ?úÏûë
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
          <section className="relative overflow-hidden bg-gray-900 rounded-2xl p-8 text-white shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-teal-500/20 p-3 rounded-xl backdrop-blur-sm border border-teal-500/30">
                  <MessageCircle className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-teal-50">1000Îß??àÎ™®??Í≥†Î??¥Í≤∞</h2>
                  <p className="text-gray-400 text-sm mt-1">?àÎ™®Ïª§Î??àÌã∞ <span className="text-teal-400 font-bold">?àÎ™®??/span>?êÏÑú ?®Íªò ?òÎà†??/p>
                </div>
              </div>
              <Link href="/community" className="bg-teal-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-teal-700 transition-colors">
                Ïª§Î??àÌã∞ ?ÖÏû•
              </Link>
            </div>
            <div className="absolute right-0 top-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />
          </section>
        )}

        {/* ?àÎ™® Î¶¨Ïñº?ÑÍ∏∞ + ?àÎ™® ?ïÎ≥¥ - 2??*/}
        <div className="grid grid-cols-2 gap-6">
          {/* Î¶¨Ïñº?ÑÍ∏∞ */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base"><span className="text-gray-900">Í¥ÄÎ¶?Î∞??¥Ïãù</span> <span className="text-teal-600">Î¶¨Ïñº?ÑÍ∏∞</span></h3>
              <Link href="/reviews" className="text-xs font-medium text-teal-600 flex items-center">?îÎ≥¥Í∏?<ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {reviewPhotos.map((photo) => (
                <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                  <div className={`w-full aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${!photo.imageUrl && 'bg-gray-50'}`}>
                    {photo.imageUrl ? (
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">?¨ÏßÑ ?ÜÏùå</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 text-[12px] leading-snug line-clamp-2 mt-0.5">{photo.title}</h4>
                </Link>
              ))}
            </div>
          </section>

          {/* ?àÎ™® ?ïÎ≥¥ */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">?àÎ™® ?ïÎ≥¥</h3>
              <Link href="/community?category=?àÎ™®?ïÎ≥¥" className="text-xs font-medium text-teal-600 flex items-center">?îÎ≥¥Í∏?<ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {infoPhotos.map((photo) => (
                <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                  <div className={`w-full aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${!photo.imageUrl && 'bg-gray-50'}`}>
                    {photo.imageUrl ? (
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">?¨ÏßÑ ?ÜÏùå</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 text-[12px] leading-snug line-clamp-2 mt-0.5">{photo.title}</h4>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ?§ÏãúÍ∞??∏Í∏∞Í∏Ä - Grid */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg text-gray-900">?§ÏãúÍ∞??∏Í∏∞Í∏Ä</h3>
            <Link href="/community" className="text-sm font-medium text-teal-600 flex items-center hover:text-teal-700">
              ?îÎ≥¥Í∏?<ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-6 gap-3 mb-5">
            {popularPhotos.map((photo) => (
              <Link key={photo.id} href={`/community/detail?id=${photo.id}`} className="flex flex-col gap-2 group">
                <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
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

        {/* Í≤¨Ï†Å Î∞∞ÎÑà */}
        <Link href="/quote" className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl py-6 px-8 shadow-lg group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-colors" />
          <div className="flex flex-col gap-1 z-10">
            <span className="text-teal-400 text-sm font-bold">Î™®Î∞ú?¥Ïãù ÎπÑÏö©, ÏßÅÏ†ë ÎπÑÍµê?òÏÑ∏??</span>
            <h3 className="text-white font-bold text-xl">ÎπÑÎ?Î©?Í≤¨Ï†ÅÎ∞õÍ∏∞</h3>
          </div>
          <div className="bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl z-10 shadow-md group-hover:bg-teal-400 transition-colors">?úÏûë?òÍ∏∞</div>
        </Link>

        {/* ?êÏû•??ÏπºÎüº */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900">?êÏû•??Î¶¨Ïñº ÏπºÎüº</h3>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">Í≥µÏãù</span>
            </div>
            <Link href="/transplant" className="text-sm font-medium text-teal-600 flex items-center">?îÎ≥¥Í∏?<ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {columnPhotos.map((photo) => (
              <Link key={photo.id} href={`/transplant/${photo.id}`} className="flex flex-col gap-2 group">
                <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={photo.imgUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h4 className="font-medium text-gray-800 text-[13px] line-clamp-1">{photo.title}</h4>
              </Link>
            ))}
          </div>
        </section>

        {/* 1:1 ?ÅÎã¥ ?òÏÇ¨ Î™©Î°ù */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900">Î™®Î∞ú?¥Ïãù 1:1 ?ÅÎã¥</h3>
              <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-0.5 rounded">Î¨¥Î£å</span>
            </div>
            <Link href="/consult" className="text-sm font-medium text-teal-600 flex items-center">?ÑÏ≤¥Î≥¥Í∏∞ <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {doctors.slice(0, 4).map((doc) => (
              <Link key={doc.id} href={`/consult/detail?id=${doc.id}`} className="flex flex-col gap-3 group p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
                <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50">
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
                    <MessageCircle className="w-3 h-3" /> ?ÑÏ†Å?ÅÎã¥ {doc.consults}Í±?                  </div>
                  <p className="text-[12px] text-gray-600 line-clamp-1 mt-1">{doc.description || "?åÍ∞úÍ∞Ä ?ÜÏäµ?àÎã§."}</p>
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
