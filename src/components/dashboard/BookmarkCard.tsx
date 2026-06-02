"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteBookmarkAction } from "@/app/dashboard/actions";
import { tagColor } from "@/lib/tag-color";
import type { Bookmark } from "@/types/bookmark";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function DashboardBookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`"${bookmark.title}"을 삭제할까요?`)) return;
    startTransition(() => deleteBookmarkAction(bookmark.id));
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 p-5 ${
        isPending ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start gap-4">

        {/* 본문 */}
        <div className="min-w-0 flex-1">
          {/* 제목 + 도메인 */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-midnight transition-colors line-clamp-1 text-[15px]"
          >
            {bookmark.title}
          </a>
          <p className="text-xs text-midnight/60 mt-0.5 truncate font-medium">
            {getDomain(bookmark.url)}
          </p>

          {/* 설명 */}
          {bookmark.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {bookmark.description}
            </p>
          )}

          {/* 태그 */}
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${tagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 날짜 */}
          <p className="text-xs text-gray-300 mt-2.5">{formatDate(bookmark.created_at)}</p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <Link
            href={`/dashboard/${bookmark.id}/edit`}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs px-3 py-1.5 border border-red-100 rounded-xl text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
