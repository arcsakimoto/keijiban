import { createClient } from "@/lib/supabase/server";
import { PostsList } from "@/components/PostsList";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id,
      author_id,
      title,
      body,
      category,
      priority,
      profiles:author_id (display_name, email, company)
    `
    )
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        お知らせ一覧
      </h1>
      <PostsList
        initialPosts={posts ?? []}
        isLoggedIn={!!user}
      />
    </div>
  );
}
