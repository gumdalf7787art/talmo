"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white flex items-center justify-center px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="absolute left-4 p-1 -ml-1 text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">서비스 이용약관</h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 pb-20">
        <div className="prose prose-sm text-gray-700 leading-relaxed max-w-none">
          <h2 className="text-lg font-bold text-gray-900 mb-4">제 1 조 (목적)</h2>
          <p className="mb-6">
            이 약관은 탈모톡(이하 "회사"라 합니다)이 제공하는 온라인 서비스(이하 "서비스"라 합니다)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">제 2 조 (용어의 정의)</h2>
          <p className="mb-6">
            ① "서비스"라 함은 구현되는 단말기(PC, 휴대형 단말기 등의 각종 유무선 장치를 포함)와 상관없이 "회원"이 이용할 수 있는 탈모톡 관련 제반 서비스를 의미합니다.
            <br />
            ② "회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">제 3 조 (약관의 명시와 개정)</h2>
          <p className="mb-6">
            ① "회사"는 이 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
            <br />
            ② "회사"는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">제 4 조 (회원가입 및 계정 정보)</h2>
          <p className="mb-6">
            ① 회원가입은 "이용자"가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 "회사"가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
            <br />
            ② "회원"은 가입 시 기재한 사항에 변경이 있는 경우, 즉시 온라인 수정을 하거나 전자우편 기타 방법으로 "회사"에 그 변경사항을 알려야 합니다.
          </p>

          <p className="text-xs text-gray-400 mt-10">
            부칙: 이 약관은 2026년 6월 26일부터 시행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
