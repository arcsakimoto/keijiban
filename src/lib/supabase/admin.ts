/**
 * Supabase管理者クライアント
 * Service Role Keyを使って、全ユーザーの購読データを読み書きする
 * ※ サーバーサイド（APIルート）でのみ使用。ブラウザでは使わないこと
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
