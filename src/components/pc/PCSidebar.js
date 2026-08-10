"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, TrendingUp, MapPin, ChevronRight, Camera } from "lucide-react";

export default function PCSidebar() {
  const [hotPosts, setHotPosts] = useState([]);
  const [banners, setBanners] = useState({});
  const [user, setUser] = useState(null);

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

    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      });
  }, []);

  const handleInvite = () => {
    let currentUser = user;
    if (!currentUser) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { currentUser = JSON.parse(savedUser); } catch(e){}
      }
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
        imageUrl: 'https://talmotalk.com/og-image.jpg', // 사이트 기본 OG 이미지
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

  const hotKeywords = ["모발이식 비용", "핀페시아", "미녹시딜", "두피문신", "강남 병원"];

  return (
    <aside className="w-[280px] shrink-0 flex flex-col gap-2">
      {/* 2. 친구 초대 배너 (상단 고정 기능) */}
      <button 
        onClick={handleInvite} 
        className="bg-[#FEE500] rounded-lg p-5 shadow-sm overflow-hidden relative group block text-left w-full border border-[#f4dc00] hover:bg-[#F4DC00] transition-colors"
      >
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/40 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-white/50 transition-colors" />
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-black/10 p-2 rounded-lg backdrop-blur-sm">
              <MessageCircle className="w-5 h-5 text-black/80" />
            </div>
            <span className="text-black/80 text-[11px] font-bold">무료 분석권 이벤트</span>
          </div>
          <h3 className="text-black font-bold text-[16px] leading-snug mb-1">
            카톡으로 친구 초대하고<br/>분석권 받기
          </h3>
          <span className="text-black/70 text-[12px] flex items-center gap-1 group-hover:text-black transition-colors font-medium">
            초대 링크 보내기 <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </button>

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

      {/* 4. 네이버 탈모톡 카페 바로가기 배너 (이전에 상단에 있던 main_b_1 활용) */}
      {banners.main_b_1?.is_active ? (
        <Link href={banners.main_b_1.link_url || "#"} target="_blank" className="w-full rounded-lg shadow-sm overflow-hidden block border border-gray-200 group">
          <img src={banners.main_b_1.image_url} alt={banners.main_b_1.title} className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity" />
        </Link>
      ) : (
        <Link href="https://cafe.naver.com/bboyforeverhiphop" target="_blank" className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg p-5 shadow-sm overflow-hidden relative group block">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-white/20 transition-colors" />
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1 text-white text-[10px] font-bold">
                <span className="bg-white text-emerald-600 px-1 rounded-sm text-[8px] font-black">N</span> 카페
              </div>
            </div>
            <h3 className="text-white font-bold text-[16px] leading-snug mb-1">
              네이버 탈모톡 카페<br/>함께 나누고 해결해요!
            </h3>
            <span className="text-emerald-50 text-[12px] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity mt-1">
              바로가기 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      )}

    </aside>
  );
}
