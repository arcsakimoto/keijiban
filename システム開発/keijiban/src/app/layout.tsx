import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "お知らせ掲示板",
  description: "社内お知らせの閲覧・投稿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <Header />
          <main className="container mx-auto px-4 py-6 max-w-4xl">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
