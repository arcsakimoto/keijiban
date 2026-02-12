import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PostActions } from "@/components/PostActions";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/types/database";
import type { Category, Priority } from "@/types/database";

const BADGE_CLASS: Record<Priority, string> = {
  normal: "badge-priority-normal",
  important: "badge-priority-important",
  urgent: "badge-priority-urgent",
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
      created_at,
      updated_at,
      profiles:author_id (display_name, email, company)
    `
    )
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  const profile = post.profiles as { display_name: string | null; email: string; company: string | null } | null;
  const isAuthor = user?.id === post.author_id;

  return (
    <article className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`inline rounded px-2 py-0.5 font-medium ${BADGE_CLASS[post.priority as Priority]}`}
            >
              {PRIORITY_LABELS[post.priority as Priority]}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {CATEGORY_LABELS[post.category as Category]}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {profile?.display_name ?? profile?.email ?? "不明"}
            {profile?.company && ` · ${profile.company}`} ·{" "}
            {post.created_at ? new Date(post.created_at).toLocaleString("ja-JP") : "—"}
          </p>
        </div>
        {isAuthor && (
          <PostActions postId={post.id} />
        )}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {post.body}
        </div>
      </div>
      <p>
        <Link
          href="/"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← 一覧に戻る
        </Link>
      </p>
    </article>
  );
}
