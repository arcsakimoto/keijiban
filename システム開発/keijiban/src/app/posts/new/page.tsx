import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewPostForm } from "@/components/NewPostForm";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        新規投稿
      </h1>
      <NewPostForm />
      <p>
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          ← 一覧に戻る
        </Link>
      </p>
    </div>
  );
}
