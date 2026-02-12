"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("このお知らせを削除してもよろしいですか？")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", postId);
    setDeleting(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/posts/${postId}/edit`}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        編集
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-red-900/30 disabled:opacity-50"
      >
        {deleting ? "削除中..." : "削除"}
      </button>
    </div>
  );
}
