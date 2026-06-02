import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditForm from "./EditForm";
import type { Category } from "@/types/bookmark";

export default async function EditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: bookmark }, { data: catData }] = await Promise.all([
    supabase.from("bookmarks").select("*").eq("id", params.id).single(),
    supabase.from("categories").select("id, name, user_id, created_at").order("created_at", { ascending: true }),
  ]);

  if (!bookmark) redirect("/dashboard");

  const categories: Category[] = catData ?? [];

  return <EditForm bookmark={bookmark} categories={categories} />;
}
