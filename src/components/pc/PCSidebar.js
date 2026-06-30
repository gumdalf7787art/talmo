"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, TrendingUp, MapPin, ChevronRight, Camera } from "lucide-react";

export default function PCSidebar() {
  const [hotPosts, setHotPosts] = useState([]);
  const [banners, setBanners] = useState({});

  useEffect(() => {
    fetch('/api/posts/list?sort=popular&limit=5')
      .then(res => res.json())
      .then(data => setHotPosts(data.posts || []));

    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const bMap = {};
          data.banners.forEach(b => { bMap[b.id] = b; });
          setBanners(bMap);
        }
      });
  }, []);

  const hotKeywords = ["모발이식 비용", "핀페시아", "미녹시딜", "두피문신", "강남 병원"];

  return (
    <aside className="w-[280px] shrink-0 flex flex-col gap-2">
      {/* 실시간 인기글 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-[15px] text-gray-900">실시간 인기글</h3>
        </div>
        <div className="flex flex-col gap-0.5">
          {hotPosts.length > 0 ? hotPosts.map((post, idx) => (
            <Link
              key={post.id}
              href={`/community/detail?id=${post.id}`}
              className="flex items-center gap-3 py-2 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <span className={`text-[13px] font-black w-5 text-center ${idx < 3 ? 'text-teal-600' : 'text-gray-400'}`}>
                {idx + 1}
              </span>
              <span className="text-[13px] text-gray-700 font-medium line-clamp-1 flex-1 group-hover:text-teal-600 transition-colors">
                {post.title}
              </span>
            </Link>
          )) : (
            <div className="text-sm text-gray-400 py-2 text-center">인기글이 없습니다.</div>
          )}
        </div>
      </div>

      {/* 2. AI 진단 배너 (main_b_1) */}
      {banners.main_b_1?.is_active ? (
        <Link href={banners.main_b_1.link_url || "#"} className="w-full rounded-lg shadow-sm overflow-hidden block border border-gray-200 group">
          <img src={banners.main_b_1.image_url} alt={banners.main_b_1.title} className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity" />
        </Link>
      ) : (
        <Link href="/diagnosis" className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg p-5 shadow-sm overflow-hidden relative group block">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-white/20 transition-colors" />
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-teal-100 text-[11px] font-bold">무료 스마트 분석</span>
            </div>
            <h3 className="text-white font-bold text-[16px] leading-snug mb-1">
              내 탈모 상태,<br/>AI가 진단해드립니다
            </h3>
            <span className="text-teal-50 text-[12px] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              분석하기 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      )}

      {/* 3. 인기 검색어 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-[15px] text-gray-900 mb-3">인기 검색어</h3>
        <div className="flex flex-wrap gap-2">
          {hotKeywords.map((keyword) => (
            <Link
              key={keyword}
              href={`/search?q=${keyword}`}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-600 font-medium hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              {keyword}
            </Link>
          ))}
        </div>
      </div>

      {/* 4. 1:1 Ad Banner (main_b_2) */}
      {banners.main_b_2?.is_active ? (
        <Link href={banners.main_b_2.link_url || "#"} className="w-full rounded-lg shadow-sm overflow-hidden block border border-gray-200 group">
          <img src={banners.main_b_2.image_url} alt={banners.main_b_2.title} className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity" />
        </Link>
      ) : (
        <Link href="#" className="bg-gray-100 rounded-lg border border-gray-200 shadow-sm overflow-hidden aspect-square relative group block">
          <img 
            src="/shampoo_ad_banner.png" 
            alt="탈모 샴푸 추천 광고" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
            AD
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12">
            <span className="text-teal-400 text-[11px] font-bold mb-1 block">프리미엄 탈모 샴푸</span>
            <h3 className="text-white font-bold text-[16px] leading-snug">모근부터 튼튼하게,<br/>기적의 두피 케어</h3>
          </div>
        </Link>
      )}

    </aside>
  );
}
