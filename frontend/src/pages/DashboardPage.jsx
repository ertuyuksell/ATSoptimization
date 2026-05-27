import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ResumeApi } from '../services/api.js';

function StatCard({ label, value, hint }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    ResumeApi.dashboard().then(setData).catch(() => setData({ totalResumes: 0, averageAtsScore: 0, latestRole: '—', recent: [] }));
  }, []);

  if (!data) return <div className="text-slate-500">Yükleniyor…</div>;

  const chartData = (data.recent || []).slice().reverse().map((r, i) => ({
    name: `#${i + 1}`,
    score: r.atsScore ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel</h1>
          <p className="text-slate-500 mt-1">CV analitiklerinize tek bakışta hâkim olun.</p>
        </div>
        <Link to="/upload" className="btn-primary">+ CV yükle</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard label="Analiz edilen CV sayısı" value={data.totalResumes} />
        <StatCard label="Ortalama ATS skoru" value={data.averageAtsScore?.toFixed?.(1) ?? 0} hint="tüm yüklemeler için" />
        <StatCard label="Son tahmin edilen rol" value={data.latestRole || '—'} />
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Son ATS skorları</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#3a6ff0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Geçmiş</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(data.recent || []).map((r) => (
            <Link key={r.id} to={`/resumes/${r.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2">
              <div>
                <div className="font-medium">{r.filename}</div>
                <div className="text-xs text-slate-500">{new Date(r.uploadedAt).toLocaleString('tr-TR')}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">{r.predictedRole || '—'}</div>
                <div className="font-bold text-brand-600">{r.atsScore ?? '—'}</div>
              </div>
            </Link>
          ))}
          {(!data.recent || data.recent.length === 0) && (
            <div className="text-sm text-slate-500 py-6">Henüz CV yok — başlamak için bir tane yükleyin.</div>
          )}
        </div>
      </div>
    </div>
  );
}
