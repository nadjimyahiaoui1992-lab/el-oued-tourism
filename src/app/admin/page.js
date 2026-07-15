"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("الإيميل أو كلمة السر غير صحيحة، أو ليس لديك صلاحية.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden bg-[#0f2b28]"
    >
      {/* خلفية زخرفية: تدرج + نمط قباب هندسي خفيف مستوحى من عمارة الوادي */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #d4a24e 0px, #d4a24e 2px, transparent 3px), radial-gradient(circle at 60% 60%, #d4a24e 0px, #d4a24e 2px, transparent 3px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2b28] via-[#14332f] to-[#0a201d]" style={{ zIndex: -1 }} />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

      {/* البطاقة */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl shadow-black/40 p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 rotate-6" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg">
                <ShieldCheck size={26} className="text-amber-50" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">لوحة تحكم عين الوادي</h1>
            <p className="text-xs text-slate-500 mt-1.5 tracking-wide">
              تسجيل دخول المسؤولين والمشرفين
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-5 font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 pr-11 pl-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm transition-all"
                  placeholder="admin@eloued.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                كلمة السر
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 pr-11 pl-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all mt-2 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          دليلك السياحي لولاية الوادي © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
