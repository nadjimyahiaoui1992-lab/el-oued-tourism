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
      setError("الإيميل أو كلمة السر غير صحيحة.");
      setLoading(false);
    } else {
      // توجيه للوحة التحكم فقط عند النجاح
      router.push("/admin/dashboard");
    }
  };

  return (
    <main dir="rtl" className="min-h-screen relative flex items-center justify-center p-4 bg-[#0f2b28]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <ShieldCheck size={40} className="mx-auto text-emerald-600 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">تسجيل الدخول</h1>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2">البريد الإلكتروني</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-left" dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2">كلمة السر</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 text-left" dir="ltr"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : "دخول"}
          </button>
        </form>
      </div>
    </main>
  );
}
