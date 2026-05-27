import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await AuthApi.login(form);
      login(resp);
      toast.success('Tekrar hoş geldiniz!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Giriş başarısız');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto card p-8 mt-10">
      <h1 className="text-2xl font-bold mb-1">Giriş yap</h1>
      <p className="text-sm text-slate-500 mb-6">ResumeIQ’ya tekrar hoş geldiniz.</p>
      <form onSubmit={submit} className="space-y-4">
        <input className="input" type="email" placeholder="E-posta"
               value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Şifre"
               value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-6">
        Hesabınız yok mu? <Link to="/register" className="text-brand-600 hover:underline">Hesap oluşturun</Link>
      </p>
    </div>
  );
}
