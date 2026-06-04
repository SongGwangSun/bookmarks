"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("이미 사용 중인 이메일 주소입니다.");
      } else if (signUpError.message.toLowerCase().includes("password")) {
        setError("비밀번호는 6자 이상이어야 합니다.");
      } else {
        setError("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMessage("가입 확인 이메일을 발송했습니다. 받은 편지함을 확인해주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-midnight rounded-2xl mb-4 shadow-card">
            <span className="text-2xl">🔖</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">송이네 북마크</h1>
          <p className="text-sm text-gray-500 mt-1">새 계정을 만들어보세요</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                이메일
              </label>
              <input
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight/20 focus:border-midnight transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="6자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight/20 focus:border-midnight transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                비밀번호 확인
              </label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight/20 focus:border-midnight transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-midnight hover:bg-midnight-dark disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors mt-1"
            >
              {loading ? "가입 중…" : "회원가입"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-midnight font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
