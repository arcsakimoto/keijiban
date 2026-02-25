"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { validateImageFile, processImage } from "@/lib/imageUtils";

type ImageUploadProps = {
  images: File[];
  existingUrls?: string[];
  onChange: (images: File[]) => void;
  onRemoveExisting?: (url: string) => void;
  maxImages?: number;
};

export function ImageUpload({
  images,
  existingUrls = [],
  onChange,
  onRemoveExisting,
  maxImages = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const totalCount = existingUrls.length + images.length;
  const canAdd = totalCount < maxImages;

  // プレビュー URL の生成・破棄
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);
      const remaining = maxImages - existingUrls.length - images.length;

      if (files.length > remaining) {
        setError(`追加できる画像は残り${remaining}枚です`);
        return;
      }

      // バリデーション
      for (const f of files) {
        const result = validateImageFile(f);
        if (!result.valid) {
          setError(result.error!);
          return;
        }
      }

      // 処理
      setProcessing(true);
      try {
        const processed = await Promise.all(
          files.map(async (f) => {
            const blob = await processImage(f);
            return new File([blob], f.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            });
          })
        );
        onChange([...images, ...processed]);
      } catch {
        setError("画像の処理に失敗しました。別の画像をお試しください。");
      } finally {
        setProcessing(false);
      }
    },
    [images, existingUrls.length, maxImages, onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // 同じファイルを再選択可能にする
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeNew = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* ドロップゾーン */}
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700"
          }`}
        >
          {processing ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              画像を処理中...
            </div>
          ) : (
            <>
              <svg className="mb-2 h-8 w-8 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                写真を追加
              </p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                タップして選択 / ドラッグ＆ドロップ（残り{maxImages - totalCount}枚）
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* エラー */}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      {/* プレビューグリッド */}
      {(existingUrls.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* 既存画像 */}
          {existingUrls.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-600 dark:bg-slate-700">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* 新規画像プレビュー */}
          {previews.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-600 dark:bg-slate-700">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
