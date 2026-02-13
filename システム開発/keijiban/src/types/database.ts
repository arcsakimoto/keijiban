export type Category = "general" | "safety" | "site" | "admin_hr" | "other";
export type Priority = "normal" | "important" | "urgent";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  company: string | null;
  role: string | null;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  general: "一般",
  safety: "安全",
  site: "現場",
  admin_hr: "管理・人事",
  other: "その他",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  normal: "通常",
  important: "重要",
  urgent: "緊急",
};
