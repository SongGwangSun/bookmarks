"use client";

import { useState, useRef } from "react";
import type { Bookmark } from "@/types/bookmark";

type Props = {
  onAdd: (data: Omit<Bookmark, "id" | "created_at" | "user_id">) => void;
};

const TAG_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export function tagColor(tag: string) {
  let hash = 0;
  for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export default function AddBookmarkForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const tagRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const tag = value.trim().replace(/,+$/, "");
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tagInput.trim()) addTag(tagInput);

    if (!title.trim()) return setError("제목을 입력해주세요.");
    if (!url.trim()) return setError("URL을 입력해주세요.");

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;
    try { new URL(finalUrl); } catch { return setError("올바른 URL 형식이 아닙니다."); }

    onAdd({ title: title.trim(), url: finalUrl, description: description.trim(), tags });
    setTitle(""); setUrl(""); setDescription(""); setTags([]); setTagInput(""); setError("");
    setOpen(false);
  }

  function handleClose() { setOpen(false); setError(""); }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 북마크 추가
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3"
    >
      <div className="flex justify-between items-center mb-1">
        <h2 className="font-semibold text-gray-800">새 북마크</h2>
        <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>

      <input
        type="text" placeholder="제목 *" value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="text" placeholder="URL * (예: https://example.com)" value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <textarea
        placeholder="메모 (선택)" value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />

      {/* 태그 입력 */}
      <div
        className="border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text focus-within:ring-2 focus-within:ring-blue-400 min-h-[40px]"
        onClick={() => tagRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)}`}>
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:opacity-60 leading-none">×</button>
          </span>
        ))}
        <input
          ref={tagRef}
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
          placeholder={tags.length === 0 ? "태그 입력 후 Enter (최대 5개)" : ""}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition-colors">
        저장
      </button>
    </form>
  );
}
