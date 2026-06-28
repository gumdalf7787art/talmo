import { Geist, Geist_Mono } from "next/font/google";
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
  title: "탈모톡",
  description: "대한민국 리얼 탈모 커뮤니티",
  openGraph: {
    title: "탈모톡",
    description: "대한민국 리얼 탈모 커뮤니티",
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
      </body>
    </html>
  );
}
