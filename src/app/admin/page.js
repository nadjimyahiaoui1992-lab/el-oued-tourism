"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ShieldAlert } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const noAccess = searchParams.get("error") === "no_access";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("الإيميل أو كلمة السر غير صحيحة.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("assistants")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (profileError || !profile) {
      setError("هذا الحساب لا يملك صلاحية الوصول للوحة التحكم.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم عين الوادي</h1>
          <p className="text-xs text-gray-500 mt-1">تسجيل دخول المسؤولين والمشرفين</p>
        </div>

        {noAccess && (
          <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-xl mb-4 font-medium text-center">
            هذا الحساب لا يملك صلاحية الوصول للوحة التحكم.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm"
              placeholder="admin@eloued.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">كلمة السر</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-sm"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors mt-2 disabled:opacity-60"
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}
