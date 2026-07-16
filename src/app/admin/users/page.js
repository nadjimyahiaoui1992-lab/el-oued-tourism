"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, UserPlus, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ManageUsers() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const guard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      const { data: profile } = await supabase
        .from("assistants")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/admin/dashboard");
        return;
      }
      setCheckingAuth(false);
      fetchAssistants();
    };
    guard();
  }, [router]);

  const fetchAssistants = async () => {
    const res = await fetch("/api/admin/create-assistant");
    const result = await res.json();
    if (res.ok && result.assistants) {
      setAssistants(result.assistants);
    }
  };

  const handleAddAssistant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/admin/create-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const result = await res.json();

    if (!res.ok) {
      setMsg({ type: "error", text: `❌ فشل الإضافة: ${result.error || "خطأ غير معروف"}` });
    } else {
      setMsg({ type: "success", text: "✅ تم إضافة المساعد بنجاح!" });
      e.target.reset();
      fetchAssistants();
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-teal-700 font-bold mb-6 hover:underline">
          <ArrowRight size={20} /> العودة للوحة التحكم
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-slate-800 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <UserPlus className="text-teal-400" /> إضافة مساعد
            </h2>
            <p className="text-slate-400 text-sm mb-8">قم بإنشاء حساب للأشخاص الذين سيساعدونك في إدارة المعالم.</p>
            <form onSubmit={handleAddAssistant} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">اسم المساعد</label>
                <input type="text" name="name" required className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="block text-sm mb-1">البريد الإلكتروني</label>
                <input type="email" name="email" required dir="ltr" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-left outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="block text-sm mb-1">كلمة المرور (6 أحرف على الأقل)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" required dir="ltr" minLength="6"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-left outline-none focus:border-teal-400 pl-10"
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-60">
                {loading ? "جاري الإضافة..." : "إنشاء الحساب"}
              </button>
              {msg.text && (
                <div className={`p-3 rounded-lg text-sm font-bold mt-2 ${msg.type === "success" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                  {msg.text}
                </div>
              )}
            </form>
          </div>

          <div className="w-full md:w-2/3 p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-teal-600" /> قائمة الصلاحيات والمساعدين
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-slate-700">الاسم</th>
                    <th className="p-4 text-slate-700">البريد الإلكتروني</th>
                    <th className="p-4 text-slate-700">الدور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assistants.length === 0 ? (
                    <tr><td colSpan="3" className="p-6 text-center text-slate-500">لا يوجد مساعدين حالياً.</td></tr>
                  ) : (
                    assistants.map((ast) => (
                      <tr key={ast.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-800">{ast.name}</td>
                        <td className="p-4 text-slate-600" dir="ltr">{ast.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${ast.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>
                            {ast.role === "admin" ? "مسؤول كامل" : "مساعد"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
