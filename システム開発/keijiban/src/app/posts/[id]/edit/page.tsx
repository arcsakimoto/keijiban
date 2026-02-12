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
    .select("id, author_id, title, body, category, priority")
    .eq("id", id)
    .single();

  if (error || !post) notFound();
  if (post.author_id !== user.id) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        お知らせを編集
      </h1>
      <EditPostForm
        postId={post.id}
        initial={{
          title: post.title,
          body: post.body,
          category: post.category,
          priority: post.priority,
        }}
      />
      <p>
        <Link href={`/posts/${id}`} className="text-blue-600 hover:underline dark:text-blue-400">
          ← 記事に戻る
        </Link>
      </p>
    </div>
  );
}
