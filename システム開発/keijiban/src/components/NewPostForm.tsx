/* 新規投稿フォーム - お知らせを新規作成（対象会社・部署フィールド対応） */
"use client";

import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { Category, Priority } from "@/types/database";

export function NewPostForm() {

  const handleSubmit = async (data: {
    title: string;
    body: string;
    category: Category;
    priority: Priority;
    target_company?: string | null;
    target_department?: string | null;
  }) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしてください");
    const { error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title: data.title,
        body: data.body,
        category: data.category,
        priority: data.priority,
        target_company: data.target_company || null,
        target_department: data.target_department || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    window.location.href = "/";
  };

  return <PostForm onSubmit={handleSubmit} submitLabel="投稿する" />;
}
