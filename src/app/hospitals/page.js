import Link from "next/link";
import { Star, MapPin, MessageCircle } from "lucide-react";

export default function HospitalsPage() {
  const hospitals = [
    { 
      id: 1, 
      name: "강남 득모의원", 
      address: "서울 강남구 역삼동", 
      rating: 4.8, 
      reviews: 124,
      tags: ["모발이식", "비대면진료"],
      image: "bg-teal-100"
    },
    { 
      id: 2, 
      name: "신촌 두피케어 센터", 
      address: "서울 서대문구 신촌동", 
      rating: 4.6, 
      reviews: 89,
      tags: ["두피스케일링", "약처방"],
      image: "bg-green-100"
    },
    { 
      id: 3, 
      name: "여의도 풍성한의원", 
      address: "서울 영등포구 여의도동", 
      rating: 4.9, 
      reviews: 210,
      tags: ["한방치료", "여성탈모"],
      image: "bg-orange-100"
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">맞춤 병원 찾기</h2>
        <p className="text-sm text-gray-500 mt-1">
          내 주변의 검증된 탈모 전문 병원을 확인해보세요.
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex gap-4">
              <div className={`w-20 h-20 rounded-xl ${hospital.image} flex items-center justify-center shrink-0`}>
                <span className="text-xs font-bold text-gray-500 opacity-50">사진</span>
              </div>
              <div className="flex flex-col justify-between w-full">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{hospital.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {hospital.address}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {hospital.rating}
                  </div>
                  <span className="text-xs text-gray-400">후기 {hospital.reviews}개</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1 mt-3">
              {hospital.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link href={`/hospitals/${hospital.id}`} className="flex-1 py-2 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                상세정보
              </Link>
              <Link href={`/chat?hospitalId=${hospital.id}`} className="flex-1 py-2 text-center text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-1">
                <MessageCircle className="w-4 h-4" />
                탈모톡 견적
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
