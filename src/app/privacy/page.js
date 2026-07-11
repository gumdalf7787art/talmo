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
            <strong>제1조 (목적)</strong><br />
            탈모톡(이하 "회사" 또는 "서비스")은 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 개인정보보호법 제30조에 따라 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제2조 (개인정보의 처리 목적, 항목 및 보유기간)</h2>
          <p className="mb-6">
            회사는 다음의 목적을 위해 필요한 최소한의 개인정보를 수집 및 처리합니다. 수집된 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우 사전 동의를 구할 예정입니다.
            <br /><br />
            <strong>1. 서비스 제공 및 AI 분석</strong><br />
            - 수집 항목: 이용자 성별, 연령(또는 생년월일), 두피 및 모발 촬영 이미지 데이터, ASI(AI Scalp Index) 분석 결과 및 리포트 데이터<br />
            - 수집 목적: 성별·유형별 맞춤형 AI 두피/모발 패턴 분석(ASI-M/F 지수 산출) 및 개인 맞춤형 리포트 생성, 서비스 고도화<br />
            - 보유 및 이용기간: 회원 탈퇴 시까지 또는 이용자의 삭제 요청 시까지 (단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 법령이 정한 기간까지 보유)
            <br /><br />
            <strong>2. 고객 상담 및 고충 처리</strong><br />
            - 수집 항목: 이메일 주소, 서비스 이용 기록, 문의 내용<br />
            - 수집 목적: 이용자 문의에 대한 답변 및 안내, 서비스 오류 개선<br />
            - 보유 및 이용기간: 문의 해결 후 3년간 보관 (전자상거래 등에서의 소비자보호에 관한 법률 적용 시)
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제3조 (개인정보의 제3자 제공)</h2>
          <p className="mb-6">
            회사는 이용자의 개인정보를 제3조에서 명시한 범위 내에서만 처리하며, 이용자의 사전 동의 없이는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다.
            <br />
            1. 이용자가 사전에 제3자 제공에 동의한 경우<br />
            2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제4조 (개인정보 처리의 위탁)</h2>
          <p className="mb-6">
            ① 회사는 원활한 서비스 제공, 유저 상담 및 알림 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 외부 전문업체에 위탁하여 운영하고 있습니다. 회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 수탁자의 책임 등 법령에 따른 필수 사항을 규정하고 수탁자가 개인정보를 안전하게 처리하는지 감독하고 있습니다.<br />
            ② 회사의 개인정보 위탁업무 처리 기관 및 내용은 다음과 같습니다.<br />
            <br />
            <strong>1. 알림 서비스 제공</strong><br />
            - 위탁 대상자 (수탁자): (주)라온에스 (알리고)<br />
            - 위탁 업무 내용: 알림톡, 카카오톡 템플릿 메시지 및 문자(SMS) 발송 대행<br />
            - 위탁하는 개인정보 항목: 휴대폰 번호, 서비스 이용 관련 알림 정보<br />
            - 보유 및 이용기간: 회원 탈퇴 시 또는 위탁 계약 종료 시까지<br />
            <br />
            <strong>2. 고객 상담 및 응대</strong><br />
            - 위탁 대상자 (수탁자): (주)채널코퍼레이션 (채널톡)<br />
            - 위탁 업무 내용: 실시간 고객 상담(채팅/챗봇) 시스템 운영 및 유저 문의 응대<br />
            - 위탁하는 개인정보 항목: 이메일 주소, 휴대폰 번호, 상담 내용, 서비스 이용 기록<br />
            - 보유 및 이용기간: 회원 탈퇴 시 또는 위탁 계약 종료 시까지
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제5조 (이용자의 권리·의무 및 그 행사방법)</h2>
          <p className="mb-6">
            1. 이용자는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.<br />
            2. 권리 행사는 회사에 대한 서면, 이메일 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.<br />
            3. 이용자가 개인정보의 오류에 대한 정정을 요청한 경우, 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제6조 (개인정보의 파기절차 및 방법)</h2>
          <p className="mb-6">
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.<br />
            1. 파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.<br />
            2. 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제7조 (개인정보의 안전성 확보 조치)</h2>
          <p className="mb-6">
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.<br />
            1. 기술적 조치: 개인정보가 포함된 데이터의 암호화 저장 및 전송 시 암호화 통신(SSL/HTTPS) 적용, 해킹 등에 대비한 기술적 보안 솔루션 구축<br />
            2. 관리적 조치: 개인정보 취급 직원의 최소화 및 정기적인 보안 교육 수행
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제8조 (개인정보 보호책임자 및 고충처리 부서)</h2>
          <p className="mb-6">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 고충처리 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.<br />
            - 개인정보 보호책임자 / 담당 부서: 탈모톡 운영팀<br />
            - 이메일 연락처: goodduck2@naver.com
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6 mb-4">제9조 (개인정보 처리방침의 변경)</h2>
          <p className="mb-6">
            이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통해 고지할 것입니다.
          </p>

          <p className="text-xs text-gray-400 mt-10">
            • 공고일자: 2026년 7월 11일<br />
            • 시행일자: 2026년 7월 11일
          </p>
        </div>
      </div>
    </div>
  );
}
