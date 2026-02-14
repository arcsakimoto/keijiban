/* ルートレイアウト - アプリ全体の共通構造（ヘッダー・テーマ・メインコンテンツ）+ Noto Sans JP フォント */
/* サーバー側でユーザープロフィールを取得し、ヘッダーに渡す */
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "ARCFEELGROUP連絡掲示板",
  description: "社内お知らせの閲覧・投稿",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // サーバー側でユーザーのプロフィールを取得（RLS問題を回避）
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let serverDisplayName: string | null = null;
  let serverEmail: string | null = null;
  if (user) {
    serverEmail = user.email ?? null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    serverDisplayName = profile?.display_name ?? null;
  }

  return (
    <html lang="ja" suppressHydrationWarning className={notoSansJP.variable}>
      <body className={`${notoSansJP.className} flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors`}>
        <ThemeProvider>
          <Header
            serverDisplayName={serverDisplayName}
            serverEmail={serverEmail}
            serverIsLoggedIn={!!user}
          />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white/60 py-6 text-center text-sm text-gray-400 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-500">
            &copy; 2025 ARCFEEL GROUP 連絡掲示板
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
