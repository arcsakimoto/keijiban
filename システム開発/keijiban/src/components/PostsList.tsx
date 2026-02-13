/* お知らせ一覧コンポーネント - 検索・フィルター機能付きの投稿カードリスト */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/types/database";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/types/database";

type PostWithProfile = Post & {
  profiles?: { display_name: string | null; email: string; company: string | null } | null;
};

export function PostsList({
  initialPosts,
  isLoggedIn,
}: {
  initialPosts: PostWithProfile[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [priority, setPriority] = useState<string>(searchParams.get("priority") ?? "all");

  // 緊急のお知らせを抽出
  const urgentPosts = useMemo(
    () => initialPosts.filter((p) => p.priority === "urgent"),
    [initialPosts]
  );

  // フィルタリング
  const filtered = useMemo(() => {
    let list = [...initialPosts];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (priority !== "all") {
      list = list.filter((p) => p.priority === priority);
    }
    return list;
  }, [initialPosts, search, category, priority]);

  const updateQuery = useCallback(
    (updates: { q?: string; category?: string; priority?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) params.set("q", updates.q);
      if (updates.category !== undefined) params.set("category", updates.category);
      if (updates.priority !== undefined) params.set("priority", updates.priority);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  // フィルターがアクティブかどうか
  const hasActiveFilter = search.trim() !== "" || category !== "all" || priority !== "all";

  // フィルターをリセット
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setPriority("all");
    router.push("/");
  };

  // 相対時刻を計算（「〇分前」「〇時間前」「〇日前」形式）
  const timeAgo = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "たった今";
    if (diffMin < 60) return `${diffMin}分前`;
    if (diffHour < 24) return `${diffHour}時間前`;
    if (diffDay < 30) return `${diffDay}日前`;
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  };

  // 投稿者の頭文字を取得（アバター用）
  const getAuthorInitial = (post: PostWithProfile) => {
    const name = post.profiles?.display_name;
    if (name) return name.charAt(0);
    const email = post.profiles?.email;
    if (email) return email.charAt(0).toUpperCase();
    return "?";
  };

  // 重要度に応じたカードの左ボーダー色
  const cardBorderClass = (p: PostWithProfile["priority"]) => {
    if (p === "urgent") return "border-l-4 border-l-red-500";
    if (p === "important") return "border-l-4 border-l-amber-400";
    return "";
  };

  // 重要度バッジのスタイル（pill型: rounded-full）
  const badgeClass = (p: PostWithProfile["priority"]) => {
    if (p === "urgent")
      return "bg-red-500 text-white dark:bg-red-600";
    if (p === "important")
      return "bg-amber-400 text-amber-900 dark:bg-amber-500 dark:text-amber-950";
    return "bg-emerald-500 text-white dark:bg-emerald-600";
  };

  // カテゴリバッジのスタイル
  const categoryBadgeClass =
    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

  return (
    <div className="space-y-5">
      {/* 緊急のお知らせバナー */}
      {urgentPosts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/30">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              緊急のお知らせが {urgentPosts.length} 件あります
            </p>
            <ul className="mt-1 space-y-0.5">
              {urgentPosts.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-sm text-red-700 underline decoration-red-300 hover:text-red-900 hover:decoration-red-500 dark:text-red-400 dark:decoration-red-700 dark:hover:text-red-200"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 検索バー + 新規投稿ボタン */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="お知らせを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => updateQuery({ q: search || undefined })}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateQuery({ q: search || undefined });
            }}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
          />
        </div>
        {isLoggedIn && (
          <Link
            href="/posts/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新規投稿
          </Link>
        )}
      </div>

      {/* フィルター行 */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateQuery({ category: e.target.value === "all" ? undefined : e.target.value });
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
        >
          <option value="all">すべてのカテゴリ</option>
          <option value="general">{CATEGORY_LABELS.general}</option>
          <option value="safety">{CATEGORY_LABELS.safety}</option>
          <option value="site">{CATEGORY_LABELS.site}</option>
          <option value="admin_hr">{CATEGORY_LABELS.admin_hr}</option>
          <option value="other">{CATEGORY_LABELS.other}</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            updateQuery({ priority: e.target.value === "all" ? undefined : e.target.value });
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
        >
          <option value="all">すべての重要度</option>
          <option value="normal">{PRIORITY_LABELS.normal}</option>
          <option value="important">{PRIORITY_LABELS.important}</option>
          <option value="urgent">{PRIORITY_LABELS.urgent}</option>
        </select>

        {/* フィルター解除ボタン */}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            フィルター解除
          </button>
        )}

        {/* 件数表示 */}
        <span className="ml-auto text-sm text-gray-500 dark:text-slate-400">
          {filtered.length} 件のお知らせ
        </span>
      </div>

      {/* 投稿カード一覧 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 dark:border-slate-700 dark:bg-slate-800/50">
          <svg className="mb-3 h-12 w-12 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            該当するお知らせはありません
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            検索条件やフィルターを変更してみてください
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className={`group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 ${cardBorderClass(post.priority)}`}
              >
                {/* 上段：バッジ群 + 日付（右寄せ） */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass(post.priority)}`}
                  >
                    {post.priority === "urgent" && (
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                    )}
                    {PRIORITY_LABELS[post.priority]}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryBadgeClass}`}
                  >
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">
                    {timeAgo(post.created_at)}
                  </span>
                </div>

                {/* 中段：タイトル */}
                <h2 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>

                {/* 本文プレビュー（2行で切り捨て） */}
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                  {post.body}
                </p>

                {/* 下段：投稿者アバター + 名前 · 会社名 */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    {getAuthorInitial(post)}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {post.profiles?.display_name ?? post.profiles?.email ?? "不明"}
                    {post.profiles?.company && ` · ${post.profiles.company}`}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
