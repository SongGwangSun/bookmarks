"use client";

import type { Bookmark } from "@/types/bookmark";
import { tagColor } from "@/lib/tag-color";

type Props = {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
};

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

export default function BookmarkCard({ bookmark, onDelete, onTagClick }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`}
            alt="" className="w-5 h-5 mt-0.5 flex-shrink-0 rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="min-w-0">
            <a
              href={bookmark.url} target="_blank" rel="noopener noreferrer"
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 block"
            >
              {bookmark.title}
            </a>
            <p className="text-xs text-blue-500 mt-0.5 truncate">{getDomain(bookmark.url)}</p>
            {bookmark.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bookmark.description}</p>
            )}
            {bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {bookmark.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-70 ${tagColor(tag)}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 text-lg leading-none"
          title="삭제"
        >×</button>
      </div>
      <p className="text-xs text-gray-400 mt-3">{formatDate(bookmark.created_at)}</p>
    </div>
  );
}
