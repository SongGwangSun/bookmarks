"use client";

import { useState, useTransition } from "react";
import { updateRoleAction, deleteUserAction } from "@/app/admin/actions";

export type UserRow = {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  bookmark_count: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function UserTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [rows, setRows] = useState<UserRow[]>(users);
  const [pending, setPending] = useState<string | null>(null); // userId
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [, startTransition] = useTransition();

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleRoleChange(userId: string, newRole: "admin" | "user") {
    setPending(userId);
    startTransition(async () => {
      const result = await updateRoleAction(userId, newRole);
      if (result.error) {
        showToast(result.error, "err");
      } else {
        setRows((prev) =>
          prev.map((r) => (r.id === userId ? { ...r, role: newRole } : r))
        );
        showToast("권한이 변경됐습니다.", "ok");
      }
      setPending(null);
    });
  }

  function handleDelete(userId: string, email: string) {
    if (!confirm(`"${email}" 계정을 영구 삭제할까요?\n북마크 데이터도 모두 삭제됩니다.`)) return;
    setPending(userId);
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.error) {
        showToast(result.error, "err");
        setPending(null);
      } else {
        setRows((prev) => prev.filter((r) => r.id !== userId));
        showToast("유저가 삭제됐습니다.", "ok");
        setPending(null);
      }
    });
  }

  return (
    <div className="relative">
      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-card-hover transition-all
            ${toast.type === "ok" ? "bg-midnight text-white" : "bg-red-500 text-white"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">이메일</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">역할</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">북마크</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">가입일</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((user) => {
              const isMe = user.id === currentUserId;
              const isPendingRow = pending === user.id;

              return (
                <tr
                  key={user.id}
                  className={`transition-opacity ${isPendingRow ? "opacity-40" : "hover:bg-gray-50/60"}`}
                >
                  {/* 이메일 */}
                  <td className="py-3.5 px-4 font-medium text-gray-800 truncate max-w-[220px]">
                    {user.email}
                    {isMe && (
                      <span className="ml-2 text-xs bg-midnight-light text-midnight px-2 py-0.5 rounded-full font-semibold">나</span>
                    )}
                  </td>

                  {/* 역할 셀렉트 */}
                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      disabled={isPendingRow}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "user")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20 transition-colors disabled:opacity-50
                        ${user.role === "admin"
                          ? "bg-midnight-light text-midnight border-midnight/20"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                    >
                      <option value="admin">관리자</option>
                      <option value="user">일반 유저</option>
                    </select>
                  </td>

                  {/* 북마크 수 */}
                  <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                    {user.bookmark_count}
                  </td>

                  {/* 가입일 */}
                  <td className="py-3.5 px-4 text-gray-400 text-xs">
                    {formatDate(user.created_at)}
                  </td>

                  {/* 삭제 */}
                  <td className="py-3.5 px-4 text-right">
                    {!isMe && (
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={isPendingRow}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
