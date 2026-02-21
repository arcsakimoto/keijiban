/* お知らせ詳細ページ - 個別投稿の全文表示と編集・削除操作 */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PostActions } from "@/components/PostActions";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/types/database";
import type { Category, Priority } from "@/types/database";

const BADGE_CLASS: Record<Priority, string> = {
  normal: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  important: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      author_id,
      title,
      body,
      category,
      priority,
      target_company,
      target_department,
      deadline,
      created_at,
      updated_at,
      profiles:author_id (display_name, email, company)
    `
    )
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  const rawProfiles = post.profiles as any;
  const profile = Array.isArray(rawProfiles) ? rawProfiles[0] ?? null : rawProfiles;
  const isAuthor = user?.id === post.author_id;

  return (
    <article className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        一覧に戻る
      </Link>

      {/* ヘッダー部分 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            {/* バッジ */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${BADGE_CLASS[post.priority as Priority]}`}
              >
                {post.priority === "urgent" && (
                  <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                )}
                {PRIORITY_LABELS[post.priority as Priority]}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                {CATEGORY_LABELS[post.category as Category]}
              </span>
            </div>

            {/* 対象会社・対象部署のバッジ */}
            {(post.target_company || post.target_department) && (
              <div className="flex flex-wrap items-center gap-2">
                {post.target_company && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                    {post.target_company}
                  </span>
                )}
                {post.target_department && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    {post.target_department}
                  </span>
                )}
              </div>
            )}

            {/* タイトル */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {post.title}
            </h1>

            {/* 投稿者・日付情報 */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>{profile?.display_name ?? profile?.email ?? "不明"}</span>
              </div>
              {profile?.company && (
                <>
                  <span className="text-gray-300 dark:text-slate-600">|</span>
                  <span>{profile.company}</span>
                </>
              )}
              <span className="text-gray-300 dark:text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>
                  {post.created_at ? new Date(post.created_at).toLocaleString("ja-JP") : "—"}
                </span>
              </div>
            </div>

            {/* 締切日 */}
            {post.deadline && (() => {
              const deadlineDate = new Date(post.deadline);
              const now = new Date();
              const isPast = deadlineDate < now;
              const diffMs = deadlineDate.getTime() - now.getTime();
              const isNear = !isPast && diffMs < 3 * 24 * 60 * 60 * 1000;
              return (
                <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isPast
                    ? "bg-gray-100 text-gray-500 line-through dark:bg-slate-700 dark:text-slate-400"
                    : isNear
                      ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                }`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  締切: {deadlineDate.toLocaleString("ja-JP")}
                  {isPast && " （締切済み）"}
                </div>
              );
            })()}
          </div>

          {/* 編集・削除ボタン */}
          {isAuthor && (
            <PostActions postId={post.id} />
          )}
        </div>

        {/* 本文 */}
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-slate-300">
            {post.body}
          </div>
        </div>
      </div>
    </article>
  );
}
