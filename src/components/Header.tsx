/* ヘッダーコンポーネント - ARCFEELGROUP連絡掲示板のナビゲーションバー */
/* サーバーから渡された名前を初期値として使用（クライアント側のRLS問題を回避） */
"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

type HeaderProps = {
  serverDisplayName?: string | null;
  serverEmail?: string | null;
  serverIsLoggedIn?: boolean;
};

export function Header({
  serverDisplayName = null,
  serverEmail = null,
  serverIsLoggedIn = false,
}: HeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(serverDisplayName);
  const [isLoggedIn, setIsLoggedIn] = useState(serverIsLoggedIn);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // セッションからユーザー状態をセット
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
      }
    });

    // 認証状態の変更を監視（ログアウト検知用）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setDisplayName(null);
        setIsLoggedIn(false);
        return;
      }
      setUser(session.user);
      setIsLoggedIn(true);
      // 名前の取得はサーバー側で行うため、クライアント側ではDB問い合わせしない
    });

    return () => subscription.unsubscribe();
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/";
  };

  // ユーザー名の頭文字を取得（アバター用）
  const getInitial = () => {
    if (displayName) return displayName.charAt(0);
    const email = user?.email || serverEmail;
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  // 表示用のメールアドレス
  const currentEmail = user?.email || serverEmail;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-md shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* 左側：アイコン + タイトル */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            ARCFEELGROUP連絡掲示板
          </span>
        </Link>

        {/* 右側：操作ボタン群 */}
        <div className="flex items-center gap-2">
          {/* ダークモード切替ボタン */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label={theme === "dark" ? "ライトモードに切替" : "ダークモードに切替"}
              title={theme === "dark" ? "ライトモード" : "ダークモード"}
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
          )}

          {isLoggedIn ? (
            <>
              {/* 新規投稿ボタン */}
              <Link
                href="/posts/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                新規投稿
              </Link>

              {/* ユーザーアバター（クリックでメニュー） */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 transition-colors hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-600"
                  title={displayName ?? currentEmail ?? "ユーザー"}
                >
                  {getInitial()}
                </button>

                {/* ドロップダウンメニュー */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-gray-100 px-4 py-2 dark:border-slate-700">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {displayName ?? "ユーザー"}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-slate-400">
                        {currentEmail}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                      </svg>
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
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
