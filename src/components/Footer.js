import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-500 py-8 px-5 text-xs md:text-sm border-t border-gray-200 mt-auto w-full">
      <div className="max-w-[1080px] mx-auto flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 font-semibold text-gray-600">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">개인정보처리방침</Link>
        </div>
        
        <div className="flex flex-col gap-1.5 leading-relaxed break-keep">
          <p className="font-bold text-gray-700 text-sm">주식회사 블루프라임</p>
          <p>대표자: 김덕규 | 사업자등록번호: 153-87-03544</p>
          <p>사업장 소재지: 서울특별시 노원구 상계로23다길 13-8, 101동 11층 1101호(상계동, 노원 아이파크)</p>
          <p className="mt-1">
            제휴 문의 및 고객센터:{' '}
            <a href="mailto:goodduck2@naver.com" className="text-blue-500 hover:underline">
              goodduck2@naver.com
            </a>
          </p>
        </div>

        <div className="mt-4 text-gray-400">
          <p>© {new Date().getFullYear()} Blueprime Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
