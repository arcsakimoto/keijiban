/**
 * プッシュ通知 購読登録・解除API
 * POST: ブラウザの購読情報をSupabaseに保存する
 * DELETE: 購読を解除する
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "購読情報が不正です" }, { status: 400 });
    }

    // 購読情報をSupabaseに保存（同じユーザー・エンドポイントの場合は更新）
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      console.error("購読保存エラー:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("購読APIエラー:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: "エンドポイントが必要です" }, { status: 400 });
    }

    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("購読解除APIエラー:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
