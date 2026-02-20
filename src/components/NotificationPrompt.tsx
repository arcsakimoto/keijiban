/**
 * プッシュ通知の許可を求めるバナー
 * ログインユーザーで、まだ通知を許可していない場合に表示
 * 「通知を有効にする」ボタンを押すとブラウザの許可ダイアログが出る
 */
"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/pushUtils";

export function NotificationPrompt({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // 通知がサポートされていない、またはログインしていない場合は非表示
    if (!isLoggedIn || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // 既に許可/拒否済みなら非表示
    if (Notification.permission === "default") {
      setShowPrompt(true);
    }

    // 既に許可済みの場合は、購読が有効か確認して必要なら再登録
    if (Notification.permission === "granted") {
      silentResubscribe();
    }
  }, [isLoggedIn]);

  // 既に許可済みだが購読が切れている場合に自動再登録
  const silentResubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (!existingSub) {
        await subscribeToPush();
      }
    } catch {
      // エラーは無視
    }
  };

  // プッシュ通知に購読する
  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ) as BufferSource,
    });

    // 購読情報をサーバーに送信
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });
  };

  // ボタンクリック時の処理
  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeToPush();
      }
      setShowPrompt(false);
    } catch (e) {
      console.error("通知の有効化に失敗:", e);
    } finally {
      setIsSubscribing(false);
    }
  };

  // 「後で」ボタン
  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6">
      <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-950/50">
        {/* ベルアイコン */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </div>

        {/* テキスト */}
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            お知らせの通知を受け取りますか？
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            新しい投稿があった時にスマホに通知が届きます
          </p>
        </div>

        {/* ボタン */}
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            後で
          </button>
          <button
            onClick={handleEnable}
            disabled={isSubscribing}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubscribing ? "設定中..." : "通知を有効にする"}
          </button>
        </div>
      </div>
    </div>
  );
}
