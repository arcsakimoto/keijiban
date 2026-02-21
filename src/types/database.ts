export type Category = "corporate_hq" | "safety_dept" | "general" | "other";
export type Priority = "normal" | "important" | "urgent";

/* グループ4社の会社型 */
export type Company =
  | "ARCFEEL GROUP"
  | "コスモスエンジニアリング"
  | "カネケン京葉コミュニティ";

/* 部署型 */
export type Department =
  | "経営管理部"
  | "営業部"
  | "工事部"
  | "総務部"
  | "技術部"
  | "その他";

/* 会社一覧（セレクトボックス用） */
export const COMPANY_LIST: Company[] = [
  "ARCFEEL GROUP",
  "コスモスエンジニアリング",
  "カネケン京葉コミュニティ",
];

/* 部署一覧（セレクトボックス用） */
export const DEPARTMENT_LIST: Department[] = [
  "経営管理部",
  "営業部",
  "工事部",
  "総務部",
  "技術部",
  "その他",
];

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  company: string | null;
  department: string | null;
  role: string | null;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: Category;
  priority: Priority;
  target_company: string | null;
  target_department: string | null;
  deadline?: string | null;
  is_pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  corporate_hq: "コーポレート本部",
  safety_dept: "安全監督部",
  general: "一般",
  other: "その他",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  normal: "通常",
  important: "重要",
  urgent: "緊急",
};
