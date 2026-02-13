/* ルートレイアウト - アプリ全体の共通構造（ヘッダー・テーマ・メインコンテンツ）+ Noto Sans JP フォント */
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "社内連絡掲示板",
  description: "社内お知らせの閲覧・投稿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className={notoSansJP.variable}>
      <body className={`${notoSansJP.className} flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors`}>
        <ThemeProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white/60 py-6 text-center text-sm text-gray-400 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-500">
            &copy; 2025 ARCFEEL GROUP 社内連絡掲示板
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
