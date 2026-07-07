import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://talmotalk.com'),
  title: "탈모톡 - 무료 실시간 AI 탈모 분석",
  description: "대한민국 리얼 탈모 커뮤니티",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "탈모톡",
  },
  openGraph: {
    title: "탈모톡 - 무료 실시간 AI 탈모 분석",
    description: "대한민국 리얼 탈모 커뮤니티",
    url: "https://talmotalk.com",
    siteName: "탈모톡 - 무료 실시간 AI 탈모 분석",
    images: [
      {
        url: "/og_thumbnail.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "탈모톡 썸네일",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "탈모톡 - 무료 실시간 AI 탈모 분석",
    description: "대한민국 리얼 탈모 커뮤니티",
    images: ["/og_thumbnail.jpg?v=2"],
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-gray-900">
        <LayoutShell>{children}</LayoutShell>
        <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
