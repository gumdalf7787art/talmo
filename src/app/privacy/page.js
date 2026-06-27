"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white flex items-center justify-center px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="absolute left-4 p-1 -ml-1 text-gray-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">개인정보 처리방침</h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 pb-20">
        <div className="prose prose-sm text-gray-700 leading-relaxed max-w-none">
          <p className="mb-6 font-medium text-gray-900">
            탈모톡(이하 "회사")은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">1. 수집하는 개인정보 항목</h2>
          <p className="mb-6">
            회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
            <br />
            - 필수항목: 이메일 주소, 비밀번호, 닉네임
            <br />
            - 서비스 이용 과정이나 사업 처리 과정에서 자동으로 생성되어 수집될 수 있는 항목: 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보 등
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">2. 개인정보의 수집 및 이용 목적</h2>
          <p className="mb-6">
            회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
            <br />
            - 회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인
            <br />
            - 커뮤니티 운영: 게시판 활동을 위한 닉네임 노출, 1:1 상담 연결 시 식별
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용기간</h2>
          <p className="mb-6">
            원칙적으로, 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
            <br />
            - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래등에서의 소비자보호에 관한 법률)
          </p>

          <h2 className="text-lg font-bold text-gray-900 mb-4">4. 제3자 제공 및 동의 거부권</h2>
          <p className="mb-6">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 1:1 병원 상담 등 이용자가 사전에 동의한 경우에는 예외로 합니다.
            <br />
            이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며, 거부할 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.
          </p>

          <p className="text-xs text-gray-400 mt-10">
            시행일자: 2026년 6월 26일
          </p>
        </div>
      </div>
    </div>
  );
}
