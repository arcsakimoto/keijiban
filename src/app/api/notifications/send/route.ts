/**
 * プッシュ通知 送信API
 * POST: 全購読者にプッシュ通知を送る（新しい投稿が作成された時に呼ばれる）
 */
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // VAPID鍵の設定（リクエスト時に実行）
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // ログインチェック（認証されたユーザーのみ通知を送信可能）
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { title, body, url } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "タイトルが必要です" }, { status: 400 });
    }

    // 管理者クライアントで全購読者を取得（RLSをバイパス）
    const adminClient = createAdminClient();
    const { data: subscriptions, error } = await adminClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (error) {
      console.error("購読者取得エラー:", error);
      return NextResponse.json({ error: "購読者の取得に失敗しました" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 });
    }

    // 通知の内容
    const payload = JSON.stringify({
      title: title,
      body: body ? body.substring(0, 100) : "",
      url: url || "/",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
    });

    // 全購読者に並列で通知を送信
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          // 410(Gone)や404は購読が無効になっている → 削除
          if (statusCode === 410 || statusCode === 404) {
            await adminClient
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
          throw err;
        }
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed });
  } catch (e) {
    console.error("通知送信APIエラー:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
