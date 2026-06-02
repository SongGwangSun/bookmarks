import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardBookmarkCard from "@/components/dashboard/BookmarkCard";
import CategorySidebar, { type CategoryWithCount } from "@/components/dashboard/CategorySidebar";
import type { Bookmark } from "@/types/bookmark";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const selectedCategory = searchParams.category ?? null;

  // 관리자 여부
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  // 분류 목록
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("id, name")
    .order("created_at", { ascending: true });

  // 전체 북마크 (분류 카운트용)
  const { data: allBookmarks } = await supabase
    .from("bookmarks")
    .select("id, category_id");

  const countMap: Record<string, number> = {};
  let uncategorizedCount = 0;
  for (const b of allBookmarks ?? []) {
    if (b.category_id) {
      countMap[b.category_id] = (countMap[b.category_id] ?? 0) + 1;
    } else {
      uncategorizedCount++;
    }
  }

  const categories: CategoryWithCount[] = (rawCategories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    count: countMap[c.id] ?? 0,
  }));

  // 필터된 북마크
  let query = supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  if (selectedCategory === "uncategorized") {
    query = query.is("category_id", null);
  } else if (selectedCategory) {
    query = query.eq("category_id", selectedCategory);
  }

  const { data: bookmarks } = await query;
  const list: Bookmark[] = bookmarks ?? [];
  const totalCount = (allBookmarks ?? []).length;

  const currentCategoryName =
    selectedCategory === "uncategorized"
      ? "미분류"
      : categories.find((c) => c.id === selectedCategory)?.name ?? null;

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* 상단 헤더 */}
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

        {/* 모바일 분류 필 */}
        <div className="lg:hidden mb-4">
          <CategorySidebar
            categories={categories}
            selectedId={selectedCategory}
            totalCount={totalCount}
            uncategorizedCount={uncategorizedCount}
          />
        </div>

        {/* 2컬럼 레이아웃 */}
        <div className="flex gap-6 items-start">

          {/* 데스크톱 사이드바 */}
          <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-8">
            <div className="bg-white rounded-2xl shadow-card p-3">
              <CategorySidebar
                categories={categories}
                selectedId={selectedCategory}
                totalCount={totalCount}
                uncategorizedCount={uncategorizedCount}
              />
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 min-w-0">
            {/* 새 북마크 추가 */}
            <Link
              href="/dashboard/new"
              className="flex items-center justify-center gap-2 w-full py-3.5 mb-5 bg-midnight hover:bg-midnight-dark text-white rounded-2xl text-sm font-semibold transition-colors shadow-card"
            >
              <span className="text-base leading-none">+</span>
              새 북마크 추가
            </Link>

            {/* 현재 분류 표시 */}
            {currentCategoryName && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-gray-700">{currentCategoryName}</span>
                <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">
                  × 전체 보기
                </Link>
              </div>
            )}

            {/* 북마크 목록 */}
            {list.length === 0 ? (
              <div className="text-center py-24">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-midnight-light rounded-2xl mb-4">
                  <span className="text-3xl">🔖</span>
                </div>
                <p className="text-base font-semibold text-gray-700">
                  {currentCategoryName
                    ? `"${currentCategoryName}"에 북마크가 없습니다`
                    : "첫 북마크를 추가해보세요"}
                </p>
                <p className="text-sm text-gray-400 mt-1">위 버튼을 눌러 시작하세요</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-gray-400 mb-3">{list.length}개</p>
                <div className="flex flex-col gap-3">
                  {list.map((bookmark) => (
                    <DashboardBookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
