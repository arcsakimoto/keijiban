"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || null, company: company || null },
      },
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    // profiles は Supabase の trigger で自動作成される想定。未作成の場合はクライアントで upsert する
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        display_name: displayName || null,
        company: company || null,
      });
    }
    setLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-sm space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        新規登録
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="6文字以上"
          />
        </div>
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            表示名（任意）
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="山田 太郎"
          />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            会社・部署（任意）
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="株式会社〇〇 総務部"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {loading ? "登録中..." : "登録する"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        すでにアカウントをお持ちの方は
        <Link href="/login" className="ml-1 text-blue-600 hover:underline dark:text-blue-400">
          ログイン
        </Link>
      </p>
    </div>
  );
}
