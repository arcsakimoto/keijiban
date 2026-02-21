/* 編集ページ - 既存のお知らせを編集するフォーム画面 */
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { EditPostForm } from "@/components/EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, author_id, title, body, category, priority, target_company, target_department, deadline")
    .eq("id", id)
    .single();

  if (error || !post) notFound();
  if (post.author_id !== user.id) notFound();

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Link
        href={`/posts/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        記事に戻る
      </Link>

      {/* フォームカード */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          お知らせを編集
        </h1>
        <EditPostForm
          postId={post.id}
          initial={{
            title: post.title,
            body: post.body,
            category: post.category,
            priority: post.priority,
            target_company: post.target_company,
            target_department: post.target_department,
            deadline: post.deadline,
          }}
        />
      </div>
    </div>
  );
}
