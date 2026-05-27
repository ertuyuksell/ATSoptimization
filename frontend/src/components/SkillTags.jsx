import { motion } from 'framer-motion';

export default function SkillTags({ title, skills = [], variant = 'default' }) {
  const colors = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
    matched: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    missing: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  };
  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      {skills.length === 0 ? (
        <div className="text-sm text-slate-500">Sonuç yok.</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <motion.span
              key={s + i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${colors[variant]}`}
            >
              {s}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
