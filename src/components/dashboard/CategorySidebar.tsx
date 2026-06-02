"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addCategoryAction, deleteCategoryAction } from "@/app/dashboard/actions";

export type CategoryWithCount = {
  id: string;
  name: string;
  count: number;
};

type Props = {
  categories: CategoryWithCount[];
  selectedId: string | null;
  totalCount: number;
  uncategorizedCount: number;
};

export default function CategorySidebar({
  categories,
  selectedId,
  totalCount,
  uncategorizedCount,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      await addCategoryAction(newName.trim());
      setNewName("");
      setIsAdding(false);
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 분류를 삭제할까요?\n북마크의 분류는 해제됩니다.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteCategoryAction(id);
      setDeletingId(null);
      router.refresh();
    });
  }

  const itemBase =
    "flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer group";
  const active = "bg-midnight text-white";
  const inactive = "text-gray-600 hover:bg-gray-100";

  const items = [
    { id: null, label: "전체", count: totalCount },
    ...(uncategorizedCount > 0
      ? [{ id: "uncategorized", label: "미분류", count: uncategorizedCount }]
      : []),
  ];

  // ─── 데스크톱: 세로 사이드바 ─────────────────────────────
  const SidebarList = (
    <nav className="flex flex-col gap-0.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-2">
        분류
      </p>

      {items.map((item) => {
        const isActive = selectedId === item.id;
        const href = item.id === null ? "/dashboard" : `/dashboard?category=${item.id}`;
        return (
          <Link key={String(item.id)} href={href} className={`${itemBase} ${isActive ? active : inactive}`}>
            <span className="truncate">{item.label}</span>
            <span className={`text-xs tabular-nums flex-shrink-0 ${isActive ? "text-white/70" : "text-gray-400"}`}>
              {item.count}
            </span>
          </Link>
        );
      })}

      {categories.map((cat) => {
        const isActive = selectedId === cat.id;
        const isDeleting = deletingId === cat.id;
        return (
          <div
            key={cat.id}
            className={`${itemBase} ${isActive ? active : inactive} ${isDeleting ? "opacity-40" : ""}`}
          >
            <Link
              href={`/dashboard?category=${cat.id}`}
              className="flex items-center justify-between gap-2 flex-1 min-w-0"
            >
              <span className="truncate">{cat.name}</span>
              <span className={`text-xs tabular-nums flex-shrink-0 ${isActive ? "text-white/70" : "text-gray-400"}`}>
                {cat.count}
              </span>
            </Link>
            <button
              onClick={(e) => { e.preventDefault(); handleDelete(cat.id, cat.name); }}
              disabled={isDeleting || isPending}
              className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none p-0.5 rounded
                ${isActive ? "hover:bg-white/20 text-white/70" : "hover:bg-gray-200 text-gray-400"}`}
              aria-label="분류 삭제"
            >
              ×
            </button>
          </div>
        );
      })}

      {/* 새 분류 추가 */}
      <div className="mt-1 pt-1 border-t border-gray-100">
        {isAdding ? (
          <form onSubmit={handleAdd} className="flex gap-1 px-2 pt-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="분류 이름"
              maxLength={20}
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-midnight/20 focus:border-midnight"
            />
            <button
              type="submit"
              disabled={isPending || !newName.trim()}
              className="flex-shrink-0 text-xs bg-midnight text-white px-2.5 py-1.5 rounded-lg disabled:opacity-50 hover:bg-midnight-dark transition-colors"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setNewName(""); }}
              className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1.5"
            >
              ×
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-midnight hover:bg-gray-50 rounded-xl transition-colors"
          >
            + 새 분류
          </button>
        )}
      </div>
    </nav>
  );

  // ─── 모바일: 가로 스크롤 필 ──────────────────────────────
  const MobilePills = (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {[
        { id: null, label: "전체", href: "/dashboard" },
        ...(uncategorizedCount > 0
          ? [{ id: "uncategorized", label: "미분류", href: "/dashboard?category=uncategorized" }]
          : []),
        ...categories.map((c) => ({ id: c.id, label: c.name, href: `/dashboard?category=${c.id}` })),
      ].map((item) => {
        const isActive = selectedId === item.id;
        return (
          <Link
            key={String(item.id)}
            href={item.href}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
              ${isActive ? "bg-midnight text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-midnight/30 hover:text-midnight"}`}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={() => setIsAdding(true)}
        className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:text-midnight hover:border-midnight/40 transition-colors"
      >
        + 분류
      </button>

      {/* 모바일 새 분류 입력 (오버레이) */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-6">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-card-hover">
            <p className="text-sm font-semibold text-gray-800 mb-3">새 분류 추가</p>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="분류 이름"
                maxLength={20}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-midnight/20 focus:border-midnight"
              />
              <button
                type="submit"
                disabled={isPending || !newName.trim()}
                className="text-sm bg-midnight text-white px-4 py-2.5 rounded-xl disabled:opacity-50 font-semibold"
              >
                추가
              </button>
            </form>
            <button
              onClick={() => { setIsAdding(false); setNewName(""); }}
              className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">{SidebarList}</div>
      <div className="lg:hidden">{MobilePills}</div>
    </>
  );
}
