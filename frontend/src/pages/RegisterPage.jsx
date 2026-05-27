import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await AuthApi.register(form);
      login(resp);
      toast.success('Hesap oluşturuldu!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kayıt başarısız');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto card p-8 mt-10">
      <h1 className="text-2xl font-bold mb-1">Hesap oluştur</h1>
      <p className="text-sm text-slate-500 mb-6">Saniyeler içinde CV’nizi puanlamaya başlayın.</p>
      <form onSubmit={submit} className="space-y-4">
        <input className="input" placeholder="Ad Soyad"
               value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
        <input className="input" type="email" placeholder="E-posta"
               value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Şifre (en az 8 karakter)"
               minLength={8}
               value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Oluşturuluyor…' : 'Hesap oluştur'}
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-6">
        Zaten hesabınız var mı? <Link to="/login" className="text-brand-600 hover:underline">Giriş yapın</Link>
      </p>
    </div>
  );
}
