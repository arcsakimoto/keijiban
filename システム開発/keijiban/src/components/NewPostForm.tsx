"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";

export function NewPostForm() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    body: string;
    category: "general" | "safety" | "site" | "admin_hr" | "other";
    priority: "normal" | "important" | "urgent";
  }) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしてください");
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title: data.title,
        body: data.body,
        category: data.category,
        priority: data.priority,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    router.push(`/posts/${post.id}`);
    router.refresh();
  };

  return <PostForm onSubmit={handleSubmit} submitLabel="投稿する" />;
}
