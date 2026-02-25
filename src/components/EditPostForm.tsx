/* 投稿編集フォーム - 既存の投稿を更新する（画像アップロード対応） */
"use client";

import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { PostFormData } from "@/components/PostForm";
import type { Category, Priority } from "@/types/database";
import { generateImagePath } from "@/lib/imageUtils";
import { uploadImage, deleteImages } from "@/lib/storageUtils";

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
    deadline?: string | null;
    existingImageUrls?: string[];
  };
}) {

  const handleSubmit = async (data: PostFormData) => {
    const supabase = createClient();

    // 認証トークンを検証・更新してからDB操作を行う
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしてください。再度ログインしてからお試しください。");

    // 削除された既存画像を Storage から削除
    const removedUrls = (initial.existingImageUrls ?? []).filter(
      (url) => !(data.existingImageUrls ?? []).includes(url)
    );
    if (removedUrls.length > 0) {
      await deleteImages(supabase, removedUrls).catch(() => {});
    }

    // 新規画像のアップロード
    let newImageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      newImageUrls = await Promise.all(
        data.images.map(async (file) => {
          const path = generateImagePath(user.id);
          return uploadImage(supabase, file, path);
        })
      );
    }

    // 既存（残存）+ 新規を結合
    const finalImageUrls = [...(data.existingImageUrls ?? []), ...newImageUrls];

    const { data: updatedRows, error } = await supabase
      .from("posts")
      .update({
        title: data.title,
        body: data.body,
        category: data.category,
        priority: data.priority,
        target_company: data.target_company || null,
        target_department: data.target_department || null,
        deadline: data.deadline || null,
        image_urls: finalImageUrls.length > 0 ? finalImageUrls : null,
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
      initial={{
        ...initial,
        existingImageUrls: initial.existingImageUrls ?? [],
      }}
      onSubmit={handleSubmit}
      submitLabel="更新する"
    />
  );
}
