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
          <p className="text-sm text-gray-500 mb-6 text-right">시행일 : 2026년 7월 11일</p>
          
          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제1조 (목적)</h2>
          <p className="mb-4">
            본 약관은 탈모톡(이하 "회사")이 제공하는 AI 기반 두피·모발 분석 서비스 및 관련 커뮤니티 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제2조 (용어의 정의)</h2>
          <p className="mb-2">① 본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ul className="list-decimal pl-5 mb-4 space-y-2">
            <li>"회원"이란 회사의 서비스에 접속하여 본 약관에 동의하고, 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
            <li>"ASI (AI Scalp Index)"란 회사가 자체 개발한 컴퓨터 비전 AI 알고리즘을 통해 회원의 두피 및 모발 형태학적 패턴을 분석하여 도출한 탈모톡 고유의 형태 분류 지수(남성형 ASI-M, 여성형 ASI-F)를 의미합니다.</li>
            <li>"게시물"이란 회원이 서비스를 이용함에 있어 서비스 내에 게시한 문자, 문서, 그림, 이미지, 사진, 동영상, 댓글 등 일체의 정보를 의미합니다.</li>
          </ul>
          <p className="mb-4">② 본 약관에서 정의되지 않은 용어는 관계 법령 및 서비스별 안내에서 정하는 바에 따릅니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제3조 (약관의 효력 및 변경)</h2>
          <p className="mb-2">① 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 화면 또는 연결 화면에 게시합니다.</p>
          <p className="mb-2">② 회원은 회원가입 또는 서비스 이용 시 본 약관에 동의함으로써 회사와 회원 간의 서비스 이용 계약이 성립합니다.</p>
          <p className="mb-4">③ 회사는 관련 법령을 위배하지 않는 범위 내에서 본 약관을 개정할 수 있으며, 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 그 적용일자 7일 전부터 서비스 내에 공지합니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제4조 (회원가입 및 계정 관리)</h2>
          <p className="mb-2">① 회원가입은 회사가 지정한 인증 절차(이메일 인증, 카카오, 네이버, 구글, 토스 등 외부 간편 로그인 연동)를 통해 본 약관 및 개인정보 처리방침에 동의함으로써 완료됩니다.</p>
          <p className="mb-4">② 회원은 가입 신청 시 본인의 정확한 정보(성별, 생년월일 등)를 제공하여야 하며, 타인의 정보(계정, 명의, 사진 등)를 도용하여 가입하거나 허위 정보를 등록한 경우 서비스 이용이 제한되거나 계약이 해지될 수 있습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제5조 (의료행위의 부인 및 서비스의 한계)</h2>
          <p className="mb-2">① 회사는 의료기관이 아니며, 서비스 내에서 제공되는 일체의 분석 결과 및 정보는 의료법상의 '의료행위(질병의 진단, 처방, 치료, 의학적 상담)'에 해당하지 않습니다.</p>
          <p className="mb-2">② 회사가 제공하는 ASI 지수 및 분석 리포트는 회원이 업로드한 사진의 형태학적 특징만을 기반으로 학술적 통계와 매칭하여 제공하는 '단순 참고용 정보'입니다.</p>
          <p className="mb-4">③ 본 서비스의 분석 결과는 전문의의 진료를 대체할 수 없으며, 회원은 분석 결과만을 근거로 독자적인 의학적 판단을 내리거나 치료·복약 등을 결정해서는 안 됩니다. 정확한 진단 및 치료는 반드시 의료기관을 방문하여 피부과 전문의와 상담하시기 바랍니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제6조 (AI 탈모 분석 서비스 및 사진 업로드)</h2>
          <p className="mb-2">① 회원은 본인이 직접 촬영한 두피 및 모발 사진을 업로드하여 AI 분석 서비스를 이용할 수 있습니다.</p>
          <p className="mb-2">② 회원은 저작권법 등 관련 법령을 준수하여 본인에게 권리가 있는 정당한 사진만을 업로드해야 합니다. 다음 각 호에 해당하는 사진은 업로드가 금지되며, 회사는 사전 통보 없이 이를 삭제하거나 분석을 거부할 수 있습니다.</p>
          <ul className="list-decimal pl-5 mb-4 space-y-2">
            <li>타인의 신체나 얼굴을 무단으로 촬영하여 개인정보 및 초상권을 침해하는 사진</li>
            <li>음란성, 잔혹성, 범죄 유발 등 사회 미풍양속을 저해하는 사진</li>
            <li>서비스의 목적(두피 및 모발 분석)과 전혀 무관한 사진</li>
            <li>AI 분석 성능을 왜곡하거나 오류를 유도하기 위해 조작된 이미지</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제7조 (분석 결과의 이용 및 회원의 책임)</h2>
          <p className="mb-2">① 회원은 서비스가 제공한 ASI 분석 결과를 본인의 개인적인 참고 자료로만 이용하여야 하며, 이를 상업적으로 이용하거나 허위 사실을 가공하여 유포해서는 안 됩니다.</p>
          <p className="mb-4">② 회사는 회원이 서비스에서 제공한 참고 정보를 오인·남용하여 발생한 의사결정(자가 치료, 임의 복약 및 중단 등) 및 그로 인한 결과에 대하여 어떠한 책임도 지지 않습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제8조 (커뮤니티 이용 및 게시물의 제한)</h2>
          <p className="mb-2">① 회원은 서비스 내 커뮤니티 공간에 자유롭게 게시물을 작성할 수 있습니다. 다만, 안전한 커뮤니티 환경 조성을 위해 다음 각 호에 해당하는 게시물은 엄격히 금지됩니다.</p>
          <ul className="list-decimal pl-5 mb-4 space-y-2">
            <li>타인을 비방, 모욕하거나 명예를 훼손하는 내용</li>
            <li>욕설, 혐오 표현, 음란물 및 사행성을 조장하는 내용</li>
            <li>타인의 개인정보(연락처, 사진, 주소 등)를 무단으로 노출하는 내용</li>
            <li>의료법 위반 소지가 있는 불법 의료광고, 특정 병원/의사의 블랙컨슈머성 비방, 공인되지 않은 치료법 선동 행위</li>
            <li>대가성 홍보임에도 이를 숨긴 허위 치료 후기 및 허위 효과 게시물</li>
            <li>광고 도배 등 서비스의 정상적인 운영을 방해하는 내용</li>
          </ul>
          <p className="mb-4">② 회사는 상기 금지행위에 해당하는 게시물을 발견할 경우, 사전 통지 없이 즉시 임시조치(블라인드) 또는 삭제할 수 있으며 해당 회원의 커뮤니티 이용 권한을 제한할 수 있습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제9조 (게시물의 권리 및 활용)</h2>
          <p className="mb-2">① 회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 작성자에게 귀속됩니다.</p>
          <p className="mb-4">② 회원은 서비스의 운영, 개선, 홍보(서비스 내 노출 등) 목적으로 회사가 게시물을 비독점적으로 이용(복제, 수정, 배포 등)할 수 있도록 허용합니다. 단, 회사는 회원의 명시적인 동의 없이 게시물을 외부 유료 광고 마케팅 용도로 이용하지 않습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제10조 (회원의 의무 및 이용 제한)</h2>
          <p className="mb-2">① 회원은 관련 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 하며, 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</p>
          <p className="mb-4">② 회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우(매크로 프로그램 사용, 시스템 해킹 시도, 허위 신고 남발 등)에는 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제11조 (회사의 면책)</h2>
          <p className="mb-2">① 회사는 천재지변, 전쟁, 디도스(DDoS) 공격, IDC 장애, 통신선로 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우에는 서비스 미제공에 대한 책임을 지지 않습니다.</p>
          <p className="mb-2">② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애나 손해에 대하여 책임을 지지 않습니다.</p>
          <p className="mb-4">③ 회사는 회원이 서비스 내에 게시한 게시물(정보, 진술, 의견 등)의 신뢰도 및 정확성에 대해 보증하지 않으며, 회원 간 또는 회원과 제3자 상호 간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없고 이로 인한 손해를 배상할 책임이 없습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제12조 (개인정보 보호)</h2>
          <p className="mb-4">회사는 회원의 개인정보를 보호하기 위해 노력하며, 개인정보의 수집, 이용, 보관, 위탁 등 관련 처리에 관한 상세 사항은 회사가 별도로 고시한 [개인정보 처리방침]에 따릅니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제13조 (지식재산권의 귀속)</h2>
          <p className="mb-4">회사가 자체적으로 제작한 서비스 내 텍스트, 디자인, 로고, ASI 분석 로직 및 관련 지식재산권은 회사에 귀속됩니다. 회원은 회사의 서면 승인 없이 이를 무단으로 복제, 전송, 배포할 수 없습니다.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">제14조 (준거법 및 관할법원)</h2>
          <p className="mb-2">① 회사와 회원 간에 발생한 분쟁에 대해서는 대한민국 법률을 준거법으로 적용합니다.</p>
          <p className="mb-4">② 서비스 이용 중 발생한 소송 등 분쟁의 관할법원은 민사소송법에 의거하여 정합니다.</p>

          <div className="mt-10 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 mb-2">부칙</h3>
            <p className="text-sm text-gray-600">본 약관은 2026년 7월 11일부터 시행합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
