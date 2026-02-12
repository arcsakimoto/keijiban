"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { Category, Priority } from "@/types/database";

export function EditPostForm({
  postId,
  initial,
}: {
  postId: string;
  initial: { title: string; body: string; category: Category; priority: Priority };
}) {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    body: string;
    category: Category;
    priority: Priority;
  }) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({
        title: data.title,
        body: data.body,
        category: data.category,
        priority: data.priority,
      })
      .eq("id", postId);
    if (error) throw new Error(error.message);
    router.push(`/posts/${postId}`);
    router.refresh();
  };

  return (
    <PostForm
      initial={initial}
      onSubmit={handleSubmit}
      submitLabel="更新する"
    />
  );
}
