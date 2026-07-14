'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      setLoading(false);
    } else {
      // إذا نجح الدخول، يتم توجيهه للوحة التحكم
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 direction-rtl" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-800 p-8 text-center text-white">
          <Lock className="mx-auto mb-4 text-teal-400" size={48} />
          <h1 className="text-2xl font-bold">تسجيل الدخول للإدارة</h1>
          <p className="text-slate-400 mt-2">دليلك السياحي لولاية الوادي</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-200">
              {errorMsg}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3.5 text-gray-400" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" 
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3.5 text-gray-400" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50" 
                dir="ltr"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors"
          >
            {loading ? 'جاري التحقق...' : <><LogIn size={20} /> دخول للوحة التحكم</>}
          </button>
        </form>
      </div>
    </div>
  );
}
