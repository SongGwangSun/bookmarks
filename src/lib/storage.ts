import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/types/bookmark";

export async function getBookmarks(): Promise<Bookmark[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function addBookmark(
  bookmark: Omit<Bookmark, "id" | "created_at" | "user_id">
): Promise<Bookmark | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ ...bookmark, user_id: user.id })
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function deleteBookmark(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("bookmarks").delete().eq("id", id);
}
