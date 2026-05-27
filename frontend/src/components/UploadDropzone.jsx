import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

export default function UploadDropzone({ onFile, file }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
    onDrop: (accepted) => accepted[0] && onFile(accepted[0]),
  });

  return (
    <motion.div
      {...getRootProps()}
      whileHover={{ scale: 1.005 }}
      className={`card p-10 cursor-pointer border-2 border-dashed transition
        ${isDragActive ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-900/20' : 'border-slate-300 dark:border-slate-700'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 grid place-items-center text-2xl">📄</div>
        <div className="text-lg font-semibold">
          {file ? file.name : (isDragActive ? 'CV’nizi buraya bırakın' : 'CV PDF’nizi sürükleyip bırakın')}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          ya da tıklayıp seçin — sadece PDF, en fazla 15 MB
        </div>
      </div>
    </motion.div>
  );
}
