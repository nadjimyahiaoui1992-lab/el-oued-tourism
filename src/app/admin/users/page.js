'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, UserPlus, Trash2, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ManageUsers() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    const { data } = await supabase.from('assistants').select('*').order('created_at', { ascending: false });
    if (data) setAssistants(data);
  };

  const handleAddAssistant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    // 1. إنشاء الحساب في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMsg({ type: 'error', text: `❌ فشل الإضافة: ${authError.message}` });
    } else {
      // 2. حفظ اسم المساعد في جدول assistants
      await supabase.from('assistants').insert([{ name, email }]);
      setMsg({ type: 'success', text: '✅ تم إضافة المساعد بنجاح!' });
      e.target.reset();
      fetchAssistants();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 direction-rtl" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-teal-700 font-bold mb-6 hover:underline">
          <ArrowRight size={20} /> العودة للوحة التحكم
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* قسم إضافة مساعد جديد */}
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
                <input type="text" name="password" required dir="ltr" minLength="6" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-left outline-none focus:border-teal-400" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                {loading ? 'جاري الإضافة...' : 'إنشاء الحساب'}
              </button>
              {msg.text && (
                <div className={`p-3 rounded-lg text-sm font-bold mt-2 ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {msg.text}
                </div>
              )}
            </form>
          </div>

          {/* قسم قائمة المساعدين */}
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
                        <td className="p-4"><span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">{ast.role}</span></td>
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