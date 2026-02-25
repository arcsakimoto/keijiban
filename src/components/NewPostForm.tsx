/* 新規投稿フォーム - お知らせを新規作成（画像アップロード対応） */
"use client";

import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { PostFormData } from "@/components/PostForm";
import { generateImagePath } from "@/lib/imageUtils";
import { uploadImage } from "@/lib/storageUtils";

export function NewPostForm() {

  const handleSubmit = async (data: PostFormData) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("ログインしてください");

    // 画像アップロード
    let imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      imageUrls = await Promise.all(
        data.images.map(async (file) => {
          const path = generateImagePath(user.id);
          return uploadImage(supabase, file, path);
        })
      );
    }

    const { data: newPost, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title: data.title,
        body: data.body,
        category: data.category,
        priority: data.priority,
        target_company: data.target_company || null,
        target_department: data.target_department || null,
        deadline: data.deadline || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // プッシュ通知を全購読者に送信（失敗しても投稿自体は成功させる）
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          body: data.body.substring(0, 100),
          url: `/posts/${newPost?.id}`,
        }),
      });
    } catch {
      // 通知送信の失敗は無視
    }

    window.location.href = "/";
  };

  return <PostForm onSubmit={handleSubmit} submitLabel="投稿する" />;
}
