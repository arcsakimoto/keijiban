/* 投稿フォームコンポーネント - お知らせの新規作成・編集で共通利用（対象会社・部署フィールド追加） */
"use client";

import { useState } from "react";
import type { Category, Priority } from "@/types/database";
import { CATEGORY_LABELS, PRIORITY_LABELS, COMPANY_LIST, DEPARTMENT_LIST } from "@/types/database";

type PostFormData = {
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  target_company?: string | null;
  target_department?: string | null;
  deadline?: string | null;
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
  const [targetCompany, setTargetCompany] = useState(initial?.target_company ?? "");
  const [targetDepartment, setTargetDepartment] = useState(initial?.target_department ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ? new Date(initial.deadline).toISOString().slice(0, 16) : "");
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
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        category,
        priority,
        target_company: targetCompany || null,
        target_department: targetDepartment || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/30";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/30">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          タイトル
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="お知らせのタイトル"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClass}>
            カテゴリ
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={inputClass}
          >
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className={labelClass}>
            重要度
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={inputClass}
          >
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 対象会社・対象部署（任意） */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="target_company" className={labelClass}>
            対象会社（任意）
          </label>
          <select
            id="target_company"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className={inputClass}
          >
            <option value="">全社共通</option>
            {COMPANY_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="target_department" className={labelClass}>
            対象部署（任意）
          </label>
          <select
            id="target_department"
            value={targetDepartment}
            onChange={(e) => setTargetDepartment(e.target.value)}
            className={inputClass}
          >
            <option value="">全部署</option>
            {DEPARTMENT_LIST.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="body" className={labelClass}>
          本文
        </label>
        <textarea
          id="body"
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="お知らせの内容を入力してください"
        />
      </div>

      {/* 締切日（任意） */}
      <div>
        <label htmlFor="deadline" className={labelClass}>
          締切日（任意）
        </label>
        <div className="flex items-center gap-3">
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          {deadline && (
            <button
              type="button"
              onClick={() => setDeadline("")}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              クリア
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              保存中...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
