import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScoreGauge from '../components/ScoreGauge.jsx';
import SkillChart from '../components/SkillChart.jsx';
import SkillTags from '../components/SkillTags.jsx';
import PdfViewer from '../components/PdfViewer.jsx';
import { ResumeApi } from '../services/api.js';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    ResumeApi.analysis(id).then(setAnalysis).catch(() => setAnalysis(null));
  }, [id]);

  if (!analysis) return <div className="text-slate-500">Analiz yükleniyor…</div>;

  let raw = {};
  try { raw = JSON.parse(analysis.rawJson || '{}'); } catch { /* noop */ }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">CV Analizi</h1>
        <p className="text-slate-500 mt-1">
          Tahmin edilen rol:{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {analysis.predictedRole || '—'}
          </span>{' '}
          · Güven: <span className="font-semibold">{(analysis.confidence * 100).toFixed(1)}%</span>
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <ScoreGauge score={analysis.atsScore} />
            <SkillChart components={raw.ats_components || {}} />
          </div>

          <SkillTags title={`Tespit edilen yetenekler (${raw.skills?.length || 0})`} skills={raw.skills || []} />

          {raw.job_match && (
            <div className="grid sm:grid-cols-2 gap-6">
              <SkillTags title="Eşleşen anahtar kelimeler" skills={raw.job_match.matched_keywords || []} variant="matched" />
              <SkillTags title="Eksik anahtar kelimeler" skills={raw.job_match.missing_keywords || []} variant="missing" />
            </div>
          )}

          <div className="card p-6">
            <h3 className="font-semibold mb-2">Mülakatçı simülasyonu</h3>
            <p className="text-lg font-bold text-brand-600">{raw.recruiter_simulation?.verdict}</p>
            <ul className="mt-3 list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {(raw.recruiter_simulation?.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <PdfViewer resumeId={analysis.resumeId} />
        </div>
      </div>
    </div>
  );
}
