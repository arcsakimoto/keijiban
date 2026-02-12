"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between max-w-4xl">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-900 dark:text-white hover:opacity-80"
        >
          お知らせ掲示板
        </Link>
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={theme === "dark" ? "ライトモード" : "ダークモード"}
            >
              {theme === "dark" ? (
                <span className="text-xl">☀️</span>
              ) : (
                <span className="text-xl">🌙</span>
              )}
            </button>
          )}
          {user ? (
            <>
              <Link
                href="/posts/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                新規投稿
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
