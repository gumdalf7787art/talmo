"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PCAdminDashboard from "@/components/pc/PCAdminDashboard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === "admin") {
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
      <header className="h-16 bg-gray-900 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-teal-400">탈모톡</span>
          <span className="text-gray-600 font-medium">|</span>
          <span className="font-bold text-white">마스터 시스템</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-300">{user.nickname} 최고관리자님</span>
          <button 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("isLoggedIn");
              router.push("/login");
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <PCAdminDashboard user={user} />
      </main>
    </div>
  );
}
