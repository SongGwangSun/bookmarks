"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("관리자 권한이 필요합니다.");
  return user;
}

export async function updateRoleAction(
  userId: string,
  role: "admin" | "user"
): Promise<{ error?: string }> {
  try {
    const me = await assertAdmin();
    if (me.id === userId && role !== "admin") {
      return { error: "자신의 관리자 권한은 해제할 수 없습니다." };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) return { error: "권한 변경 중 오류가 발생했습니다." };
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteUserAction(
  userId: string
): Promise<{ error?: string }> {
  try {
    const me = await assertAdmin();
    if (me.id === userId) {
      return { error: "자신의 계정은 삭제할 수 없습니다." };
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { error: "유저 삭제 중 오류가 발생했습니다." };

    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
