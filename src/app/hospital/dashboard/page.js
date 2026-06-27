"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PCHospitalDashboard from "@/components/pc/PCHospitalDashboard";

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === "hospital") {
        setUser(parsed);
        setIsAuthorized(true);
      } else {
        router.replace("/");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!isAuthorized) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">로딩중...</div>;

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Simple Header for Hospital */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-teal-700">탈모톡</span>
          <span className="text-gray-400 font-medium">|</span>
          <span className="font-bold text-gray-800">병원 관리자 센터</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">{user.nickname} 담당자님</span>
          <button 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("isLoggedIn");
              router.push("/login");
            }}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <PCHospitalDashboard user={user} />
      </main>
    </div>
  );
}
