import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewForm from "./NewForm";
import type { Category } from "@/types/bookmark";

export default async function NewBookmarkPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("categories")
    .select("id, name, user_id, created_at")
    .order("created_at", { ascending: true });

  const categories: Category[] = data ?? [];

  return <NewForm categories={categories} />;
}
