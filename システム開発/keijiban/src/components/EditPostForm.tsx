/* 投稿編集フォーム - 既存の投稿を更新する（.select()追加でバグ修正済み） */
"use client";

import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { Category, Priority } from "@/types/database";

export function EditPostForm({
  postId,
  initial,
}: {
  postId: string;
  initial: {
    title: string;
    body: string;
    category: Category;
    priority: Priority;
    target_company?: string | null;
    target_department?: string | null;
  };
}) {

  const handleSubmit = async (data: {
    title: string;
    body: string;
    category: Category;
    priority: Priority;
    target_company?: string | null;
    target_department?: string | null;
  }) => {
    const supabase = createClient();

    // 認証トークンを検証・更新してからDB操作を行う
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしてください。再度ログインしてからお試しください。");

    const { data: updatedRows, error } = await supabase
      .from("posts")
      .update({
        title: data.title,
        body: data.body,
        category: data.category,
        priority: data.priority,
        target_company: data.target_company || null,
        target_department: data.target_department || null,
      })
      .eq("id", postId)
      .select();

    if (error) throw new Error(error.message);

    if (!updatedRows || updatedRows.length === 0) {
      throw new Error("更新に失敗しました。投稿が見つからないか、権限がありません。");
    }

    // フルページリロードで確実に更新後の内容を反映
    window.location.href = `/posts/${postId}`;
  };

  return (
    <PostForm
      initial={initial}
      onSubmit={handleSubmit}
      submitLabel="更新する"
    />
  );
}
