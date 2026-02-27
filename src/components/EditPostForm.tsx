/* 投稿編集フォーム - 既存の投稿を更新する（画像＋PDF添付対応） */
"use client";

import { createClient } from "@/lib/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { PostFormData } from "@/components/PostForm";
import type { Category, Priority, PostAttachment } from "@/types/database";
import { generateImagePath } from "@/lib/imageUtils";
import { uploadImage, deleteImages } from "@/lib/storageUtils";

export function EditPostForm({
  postId,
  initial,
  initialAttachments,
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
  initialAttachments: PostAttachment[];
}) {

  const handleSubmit = async (data: PostFormData, pdfFiles: File[]) => {
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

    // 新規PDFファイルをアップロード
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const timestamp = Date.now();
        const filePath = `${user.id}/${postId}/${timestamp}-${file.name}`;

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

        await supabase.from("post_attachments").insert({
          post_id: postId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
        });
      }
    }

    // フルページリロードで確実に更新後の内容を反映
    window.location.href = `/posts/${postId}`;
  };

  const handleDeleteAttachment = async (attachment: PostAttachment) => {
    const supabase = createClient();

    // Storageからファイルを削除
    const { error: storageError } = await supabase.storage
      .from("post-attachments")
      .remove([attachment.file_path]);
    if (storageError) throw new Error("ファイルの削除に失敗しました");

    // DBからメタデータを削除
    const { error: dbError } = await supabase
      .from("post_attachments")
      .delete()
      .eq("id", attachment.id);
    if (dbError) throw new Error("添付情報の削除に失敗しました");
  };

  return (
    <PostForm
      initial={{
        ...initial,
        existingImageUrls: initial.existingImageUrls ?? [],
      }}
      initialAttachments={initialAttachments}
      onSubmit={handleSubmit}
      onDeleteAttachment={handleDeleteAttachment}
      submitLabel="更新する"
    />
  );
}
