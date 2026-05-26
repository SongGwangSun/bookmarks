"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkCard from "@/components/BookmarkCard";
import { tagColor } from "@/components/AddBookmarkForm";
import { getBookmarks, addBookmark, deleteBookmark } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { Bookmark } from "@/types/bookmark";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    getBookmarks().then(setBookmarks).finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleAdd(data: Omit<Bookmark, "id" | "created_at" | "user_id">) {
    const newBookmark = await addBookmark(data);
    if (newBookmark) setBookmarks((prev) => [newBookmark, ...prev]);
  }

  async function handleDelete(id: string) {
    await deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleTagClick(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setSearch("");
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => b.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [bookmarks]);

  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesTag = activeTag ? b.tags.includes(activeTag) : true;
      const q = search.toLowerCase();
      const matchesSearch = q
        ? b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
        : true;
      return matchesTag && matchesSearch;
    });
  }, [bookmarks, activeTag, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">내 북마크</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "불러오는 중..." : `저장된 링크 ${bookmarks.length}개`}
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400 truncate max-w-[160px]">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <AddBookmarkForm onAdd={handleAdd} />

          {/* 태그 필터 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  activeTag === null
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-opacity ${tagColor(tag)} ${
                    activeTag === tag ? "ring-2 ring-offset-1 ring-gray-400" : "hover:opacity-70"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* 검색 */}
          {bookmarks.length > 0 && (
            <input
              type="text"
              placeholder="검색..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveTag(null); }}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          )}

          {/* 목록 */}
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">불러오는 중...</div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onDelete={handleDelete}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔖</p>
              <p className="text-sm">아직 저장된 북마크가 없습니다.</p>
              <p className="text-sm">위 버튼을 눌러 첫 번째 북마크를 추가해보세요.</p>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-400 text-sm">
              {activeTag ? `'${activeTag}' 태그 북마크가 없습니다.` : "검색 결과가 없습니다."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
