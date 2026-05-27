import { motion } from 'framer-motion';

export default function ScoreGauge({ score = 0, label = 'ATS Skoru' }) {
  const pct = Math.max(0, Math.min(100, score));
  const dash = 2 * Math.PI * 52;
  const offset = dash - (dash * pct) / 100;
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="card p-6 flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <motion.circle
          cx="60" cy="60" r="52" stroke={color} strokeWidth="12" fill="none"
          strokeLinecap="round"
          strokeDasharray={dash}
          initial={{ strokeDashoffset: dash }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="66" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" fontSize="24" fontWeight="700">
          {pct}
        </text>
      </svg>
      <div>
        <div className="text-sm uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-2xl font-bold mt-1">
          {pct >= 80 ? 'Mükemmel' : pct >= 60 ? 'İyi' : 'Geliştirilmeli'}
        </div>
        <div className="text-sm text-slate-500 mt-1">100 üzerinden</div>
      </div>
    </div>
  );
}
