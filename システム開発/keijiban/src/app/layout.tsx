/* ルートレイアウト - アプリ全体の共通構造（ヘッダー・テーマ・メインコンテンツ） */
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

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
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
