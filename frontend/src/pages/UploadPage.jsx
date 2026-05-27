import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import UploadDropzone from '../components/UploadDropzone.jsx';
import { ResumeApi } from '../services/api.js';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!file) return toast.error('Önce bir PDF seçin');
    setLoading(true);
    try {
      const resp = await ResumeApi.upload(file, jd);
      toast.success('Analiz tamamlandı');
      navigate(`/resumes/${resp.resumeId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Yükleme başarısız');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CV analiz et</h1>
        <p className="text-slate-500 mt-1">Bir PDF bırakın ve (isteğe bağlı) bir iş ilanı ekleyin.</p>
      </div>
      <UploadDropzone onFile={setFile} file={file} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
        <label className="text-sm font-medium">İş ilanı (opsiyonel)</label>
        <textarea className="input mt-2 min-h-[160px]" placeholder="Semantik eşleşme için iş ilanını buraya yapıştırın…"
                  value={jd} onChange={e => setJd(e.target.value)} />
      </motion.div>
      <div className="flex justify-end">
        <button onClick={submit} disabled={loading} className="btn-primary">
          {loading ? 'Analiz ediliyor…' : 'Yapay zekâ analizini başlat'}
        </button>
      </div>
    </div>
  );
}
