"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/types/database";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/types/database";

type PostWithProfile = Post & {
  profiles?: { display_name: string | null; email: string; company: string | null } | null;
};

const PRIORITY_CLASS = {
  normal: "badge-priority-normal card-priority-normal",
  important: "badge-priority-important card-priority-important",
  urgent: "badge-priority-urgent card-priority-urgent",
} as const;

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="search"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => updateQuery({ q: search || undefined })}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateQuery({ category: e.target.value === "all" ? undefined : e.target.value });
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">カテゴリすべて</option>
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
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">重要度すべて</option>
          <option value="normal">{PRIORITY_LABELS.normal}</option>
          <option value="important">{PRIORITY_LABELS.important}</option>
          <option value="urgent">{PRIORITY_LABELS.urgent}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
          該当するお知らせはありません
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className={`block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow dark:border-gray-700 dark:bg-gray-800 ${PRIORITY_CLASS[post.priority].split(" ")[1]}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={`inline rounded px-2 py-0.5 font-medium ${PRIORITY_CLASS[post.priority].split(" ")[0]}`}
                  >
                    {PRIORITY_LABELS[post.priority]}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {post.profiles?.display_name ?? post.profiles?.email ?? "不明"} ·{" "}
                    {post.created_at ? new Date(post.created_at).toLocaleDateString("ja-JP") : "—"}
                  </span>
                </div>
                <h2 className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {post.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
