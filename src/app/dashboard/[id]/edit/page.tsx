import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditForm from "./EditForm";

export default async function EditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("id", params.id)
    .single();

  // RLS가 다른 유저 데이터를 걸러주므로 null이면 존재하지 않거나 권한 없음
  if (!bookmark) redirect("/dashboard");

  return <EditForm bookmark={bookmark} />;
}
