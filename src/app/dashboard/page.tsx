import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardBookmarkCard from "@/components/dashboard/BookmarkCard";
import type { Bookmark } from "@/types/bookmark";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  const list: Bookmark[] = bookmarks ?? [];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">내 북마크</h1>
            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xs">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs bg-midnight text-white hover:bg-midnight-dark px-3 py-1.5 rounded-xl font-semibold transition-colors"
              >
                관리자 패널
              </Link>
            )}
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl px-3 py-1.5 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>

        {/* 새 북마크 추가 버튼 */}
        <Link
          href="/dashboard/new"
          className="flex items-center justify-center gap-2 w-full py-3.5 mb-6 bg-midnight hover:bg-midnight-dark text-white rounded-2xl text-sm font-semibold transition-colors shadow-card"
        >
          <span className="text-base leading-none">+</span>
          새 북마크 추가
        </Link>

        {/* 북마크 목록 */}
        {list.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-midnight-light rounded-2xl mb-4">
              <span className="text-3xl">🔖</span>
            </div>
            <p className="text-base font-semibold text-gray-700">첫 북마크를 추가해보세요</p>
            <p className="text-sm text-gray-400 mt-1">위 버튼을 눌러 시작하세요</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-gray-400 mb-3">총 {list.length}개</p>
            <div className="flex flex-col gap-3">
              {list.map((bookmark) => (
                <DashboardBookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
