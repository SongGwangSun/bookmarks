import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserTable, { type UserRow } from "@/components/admin/UserTable";

export default async function AdminPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 관리자 권한 확인
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") redirect("/dashboard");

  // 전체 유저 프로필 조회 (admin RLS 정책으로 허용)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  // 유저별 북마크 수 집계
  const { data: bookmarkCounts } = await supabase
    .from("bookmarks")
    .select("user_id");

  const countMap: Record<string, number> = {};
  for (const b of bookmarkCounts ?? []) {
    countMap[b.user_id] = (countMap[b.user_id] ?? 0) + 1;
  }

  const users: UserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    role: p.role as "admin" | "user",
    created_at: p.created_at,
    bookmark_count: countMap[p.id] ?? 0,
  }));

  const adminCount = users.filter((u) => u.role === "admin").length;
  const totalBookmarks = users.reduce((s, u) => s + u.bookmark_count, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600 shadow-sm"
              aria-label="대시보드로"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">관리자 패널</h1>
              <p className="text-xs text-gray-400 mt-0.5">유저 관리 및 권한 설정</p>
            </div>
          </div>
          <span className="text-xs bg-midnight text-white px-3 py-1.5 rounded-xl font-semibold">
            관리자
          </span>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "전체 유저", value: users.length, sub: "가입 계정" },
            { label: "관리자", value: adminCount, sub: "admin 권한" },
            { label: "전체 북마크", value: totalBookmarks, sub: "저장된 링크" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* 유저 테이블 */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">유저 목록</h2>
            <span className="text-xs text-gray-400">{users.length}명</span>
          </div>
          {users.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm">유저가 없습니다.</p>
          ) : (
            <UserTable users={users} currentUserId={user.id} />
          )}
        </div>

        {/* service role key 안내 */}
        {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4">
            ⚠️ <strong>SUPABASE_SERVICE_ROLE_KEY</strong>가 설정되지 않아 유저 삭제가 비활성화됩니다.
            Supabase 대시보드 → Project Settings → API → service_role 키를 Vercel 환경변수에 추가하세요.
          </p>
        )}
      </div>
    </div>
  );
}
