/* 新規投稿フォーム - お知らせを新規作成（画像＋PDF添付対応） */
"use client";

import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { PostFormData } from "@/components/PostForm";
import { generateImagePath } from "@/lib/imageUtils";
import { uploadImage } from "@/lib/storageUtils";

export function NewPostForm() {

  const handleSubmit = async (data: PostFormData, pdfFiles: File[]) => {
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

    // PDFファイルをSupabase Storageにアップロード
    if (pdfFiles.length > 0 && newPost) {
      for (const file of pdfFiles) {
        const timestamp = Date.now();
        const filePath = `${user.id}/${newPost.id}/${timestamp}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("post-attachments")
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("PDF upload error:", uploadError);
          continue;
        }

        // メタデータをDBに保存
        await supabase.from("post_attachments").insert({
          post_id: newPost.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
        });
      }
    }

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
