"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addBookmarkAction } from "@/app/dashboard/actions";
import type { Category } from "@/types/bookmark";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight/20 focus:border-midnight transition-colors disabled:bg-gray-50 disabled:text-gray-400";
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide";

export default function NewForm({ categories }: { categories: Category[] }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function validate() {
    const errs: Record<string, string> = {};
    if (!url.trim()) errs.url = "URL을 입력해주세요.";
    else if (!url.trim().startsWith("https://")) errs.url = "URL은 https://로 시작해야 합니다.";
    if (!title.trim()) errs.title = "제목을 입력해주세요.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});

    const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    startTransition(async () => {
      const result = await addBookmarkAction({
        url: url.trim(), title: title.trim(),
        description: description.trim(), tags: parsedTags,
        category_id: categoryId,
      });
      if (result?.error) setFormError(result.error);
    });
  }

  function clearError(field: string) {
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600 shadow-sm">←</Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">새 북마크 추가</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-7 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>URL <span className="text-red-400 normal-case tracking-normal">*</span></label>
            <input type="url" placeholder="https://example.com" value={url} disabled={isPending}
              onChange={(e) => { setUrl(e.target.value); clearError("url"); }} className={inputCls} />
            {fieldErrors.url && <p className="text-xs text-red-500">{fieldErrors.url}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>제목 <span className="text-red-400 normal-case tracking-normal">*</span></label>
            <input type="text" placeholder="페이지 제목을 입력하세요" value={title} disabled={isPending}
              onChange={(e) => { setTitle(e.target.value); clearError("title"); }} className={inputCls} />
            {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>설명</label>
            <textarea placeholder="간단한 메모나 설명을 남겨보세요" value={description} disabled={isPending}
              onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>태그</label>
            <input type="text" placeholder="개발, 디자인, 참고자료" value={tags} disabled={isPending}
              onChange={(e) => setTags(e.target.value)} className={inputCls} />
            <p className="text-xs text-gray-400">쉼표(,)로 구분해서 입력하세요</p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>분류</label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value || null)}
                disabled={isPending}
                className={inputCls}
              >
                <option value="">분류 없음</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {formError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{formError}</p>
          )}

          <div className="flex gap-2.5 pt-1">
            <Link href="/dashboard" className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium">취소</Link>
            <button type="submit" disabled={isPending} className="flex-1 py-3 bg-midnight hover:bg-midnight-dark disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
              {isPending ? "저장 중…" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
