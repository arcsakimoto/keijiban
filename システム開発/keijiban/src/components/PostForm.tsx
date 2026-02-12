"use client";

import { useState } from "react";
import type { Category, Priority } from "@/types/database";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "@/types/database";

type PostFormData = {
  title: string;
  body: string;
  category: Category;
  priority: Priority;
};

export function PostForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: PostFormData;
  onSubmit: (data: PostFormData) => Promise<void>;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "general");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "normal");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), body: body.trim(), category, priority });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="お知らせのタイトル"
        />
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          カテゴリ
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          重要度
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          本文
        </label>
        <textarea
          id="body"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="お知らせの内容"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
