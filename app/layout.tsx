import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * アプリケーションのメタデータ
 * SEO対策とソーシャルメディア共有用
 */
export const metadata: Metadata = {
  title: "Kiro Card Kit",
  description:
    "おもちゃや物品の写真からTCG風カードを自動生成するアプリケーション",
};

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体の基本構造を定義
 * モバイルファースト設計を考慮したレスポンシブ対応
 *
 * @param children - 子コンポーネント
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
