"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── 북마크 ───────────────────────────────────────────────

export async function addBookmarkAction(data: {
  url: string;
  title: string;
  description: string;
  tags: string[];
  category_id: string | null;
}): Promise<{ error: string } | void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("bookmarks").insert({
    url: data.url,
    title: data.title,
    description: data.description,
    tags: data.tags,
    category_id: data.category_id,
    user_id: user.id,
  });

  if (error) return { error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateBookmarkAction(
  id: string,
  data: {
    url: string;
    title: string;
    description: string;
    tags: string[];
    category_id: string | null;
  }
): Promise<{ error: string } | void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("bookmarks")
    .update({
      url: data.url,
      title: data.title,
      description: data.description,
      tags: data.tags,
      category_id: data.category_id,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteBookmarkAction(id: string) {
  const supabase = createClient();
  await supabase.from("bookmarks").delete().eq("id", id);
  revalidatePath("/dashboard");
}

// ─── 분류 ───────────────────────────────────────────────

export async function addCategoryAction(
  name: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), user_id: user.id });

  if (error) return { error: "분류 추가 중 오류가 발생했습니다." };
  revalidatePath("/dashboard");
  return {};
}

export async function deleteCategoryAction(
  id: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "분류 삭제 중 오류가 발생했습니다." };
  revalidatePath("/dashboard");
  return {};
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
