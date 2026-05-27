import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const LABELS = {
  length: 'Uzunluk',
  sections: 'Bölümler',
  skills: 'Yetenekler',
  formatting: 'Format',
  job_match: 'İlan Eşleşmesi',
};

export default function SkillChart({ components = {} }) {
  const data = Object.entries(components).map(([k, v]) => ({
    metric: LABELS[k] || k,
    value: v,
  }));

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">ATS Bileşen Dağılımı</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 10 }} />
            <Radar name="Skor" dataKey="value" stroke="#3a6ff0" fill="#3a6ff0" fillOpacity={0.45} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
