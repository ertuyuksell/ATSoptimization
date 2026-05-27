import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../services/api.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer({ resumeId }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [pages, setPages] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let revoked = false;
    let createdUrl = null;
    setError(null);
    setBlobUrl(null);

    api.get(`/resumes/${resumeId}/file`, { responseType: 'blob' })
      .then(res => {
        if (revoked) return;
        createdUrl = URL.createObjectURL(res.data);
        setBlobUrl(createdUrl);
      })
      .catch(err => setError(err?.response?.status === 401 ? 'Yetkisiz erişim' : 'PDF yüklenemedi.'));

    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [resumeId]);

  return (
    <div className="card p-4 overflow-auto max-h-[80vh]">
      {error && <div className="p-8 text-rose-500">{error}</div>}
      {!error && !blobUrl && <div className="p-8 text-slate-500">PDF yükleniyor…</div>}
      {blobUrl && (
        <Document
          file={blobUrl}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          loading={<div className="p-8 text-slate-500">PDF yükleniyor…</div>}
          error={<div className="p-8 text-rose-500">PDF yüklenemedi.</div>}
        >
          {Array.from({ length: pages }, (_, i) => (
            <Page key={i} pageNumber={i + 1} width={640} className="mb-4 shadow rounded-lg overflow-hidden" />
          ))}
        </Document>
      )}
    </div>
  );
}
