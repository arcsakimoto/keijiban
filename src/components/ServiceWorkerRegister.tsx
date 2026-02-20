/**
 * Service Worker登録コンポーネント
 * アプリ起動時にService Workerをブラウザに登録する
 * PWA（ホーム画面追加）に必要な仕組み
 */
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // ブラウザがService Workerに対応している場合のみ登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 登録完了:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker 登録失敗:', error);
        });
    }
  }, []);

  // 画面には何も表示しない
  return null;
}
