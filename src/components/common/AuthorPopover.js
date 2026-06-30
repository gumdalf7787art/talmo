"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, AlertTriangle, List, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthorPopover({ author, authorImage, authorId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const popoverRef = useRef(null);

  // Profile Data
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Report Data
  const reportCategories = [
    "무의미한 도배글",
    "광고, 홍보, 방문유도 게시글",
    "성희롱, 욕설, 비방, 정치, 반사회적 게시글",
    "저작권법 위반 게시글",
    "게시판 성격과 맞지 않음"
  ];
  const [reportCategory, setReportCategory] = useState(reportCategories[0]);
  const [reportContent, setReportContent] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleProfileClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setShowProfile(true);
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/user/profile?nickname=${encodeURIComponent(author)}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setShowReport(true);
  };

  const handleAllPostsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    router.push(`/community/user/${encodeURIComponent(author)}`);
  };

  const submitReport = async () => {
    if (!reportContent.trim()) {
      alert("신고 내용을 입력해주세요.");
      return;
    }
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsReporting(true);
    try {
      const res = await fetch('/api/report/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          targetNickname: author,
          category: reportCategory,
          content: reportContent
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("신고가 접수되었습니다.");
        setShowReport(false);
        setReportContent("");
      } else {
        alert(data.error || "신고 처리에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={popoverRef}>
        <button 
          type="button"
          onClick={handleToggle}
          className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer focus:outline-none truncate inline-block align-bottom max-w-[120px]"
        >
          {author}
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden">
            <button onClick={handleProfileClick} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 flex items-center gap-2 transition-colors">
              <User className="w-4 h-4" /> 자기소개
            </button>
            <button onClick={handleReportClick} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 flex items-center gap-2 transition-colors">
              <AlertTriangle className="w-4 h-4" /> 신고하기
            </button>
            <button onClick={handleAllPostsClick} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 flex items-center gap-2 transition-colors border-t border-gray-100">
              <List className="w-4 h-4" /> 전체게시물
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={(e) => { e.stopPropagation(); setShowProfile(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">회원 정보</h3>
              <button onClick={() => setShowProfile(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {loadingProfile ? (
                <div className="text-center py-10 text-gray-500 text-sm">정보를 불러오는 중입니다...</div>
              ) : profileData ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl mb-4 overflow-hidden shadow-sm">
                    {authorImage ? (
                      <img src={authorImage} alt={author} className="w-full h-full object-cover" />
                    ) : (
                      author.charAt(0)
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-6">{profileData.nickname}</h4>
                  
                  <div className="w-full grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="text-[11px] text-gray-500 font-medium mb-1">게시글</div>
                      <div className="font-bold text-gray-900">{profileData.posts_count?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="text-[11px] text-gray-500 font-medium mb-1">댓글</div>
                      <div className="font-bold text-gray-900">{profileData.comments_count?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="text-[11px] text-gray-500 font-medium mb-1">받은 추천</div>
                      <div className="font-bold text-red-500">{profileData.likes_received?.toLocaleString() || 0}</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-3 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">회원가입일</span>
                      <span className="text-gray-900 font-semibold">{profileData.created_at || '정보 없음'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">최종접속일</span>
                      <span className="text-gray-900 font-semibold">{profileData.last_login || '정보 없음'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">정보를 찾을 수 없습니다.</div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
               <button onClick={(e) => { e.stopPropagation(); setShowProfile(false); router.push(`/community/user/${encodeURIComponent(author)}`); }} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors">
                작성한 글 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={(e) => { e.stopPropagation(); setShowReport(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> 신고하기
              </h3>
              <button onClick={() => setShowReport(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">신고대상</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900">{author}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">신고내용 분류</label>
                <div className="relative">
                  <select 
                    value={reportCategory} 
                    onChange={e => setReportCategory(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {reportCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">신고내용 입력</label>
                <textarea 
                  value={reportContent}
                  onChange={e => setReportContent(e.target.value)}
                  placeholder="신고 사유를 상세히 적어주세요. (최소 10자 이상)"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg">
                허위 신고 시 서비스 이용이 제한될 수 있습니다.<br/>
                신고된 내용은 관리자 검토 후 처리됩니다.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowReport(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-bold text-sm transition-colors">
                취소하기
              </button>
              <button onClick={submitReport} disabled={isReporting} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50">
                {isReporting ? '처리 중...' : '신고하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
