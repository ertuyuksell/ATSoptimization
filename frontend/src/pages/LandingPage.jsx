import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { title: 'Yapay Zekâ ATS Skoru', desc: 'Uzunluk, bölümler, yetenekler ve formatlama için alt-bileşen kırılımıyla 0-100 arası skor alın.' },
  { title: 'Yetenek Çıkarımı', desc: 'Sentence-BERT ve özel sözlüklerle CV’nizdeki teknik ve yumuşak becerileri otomatik tespit eder.' },
  { title: 'İş İlanı Eşleşmesi', desc: 'Bir iş ilanı yapıştırın; semantik benzerliği, eşleşen anahtar kelimeleri ve eksiklerinizi görün.' },
  { title: 'Mülakatçı Simülasyonu', desc: 'Kıdemli bir İK uzmanı gibi karar ve önceliklendirilmiş öneriler sunar.' },
];

export default function LandingPage() {
  return (
    <div className="space-y-20">
      <section className="grid md:grid-cols-2 gap-12 items-center pt-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight">
            ATS’i geç.<br/>
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              Daha hızlı işe gir.
            </span>
          </motion.h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-lg">
            CV’nizi yükleyin; yapay zekâ motorumuz onu modern ATS sistemlerine göre puanlasın,
            yeteneklerinizi çıkarsın ve neyi düzeltmeniz gerektiğini söylesin.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/register" className="btn-primary">CV’mi analiz et</Link>
            <Link to="/login" className="btn-ghost">Giriş yap</Link>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="card p-8">
          <div className="text-sm text-slate-500">Örnek ATS Skoru</div>
          <div className="text-6xl font-extrabold mt-2 bg-gradient-to-r from-emerald-500 to-brand-600 bg-clip-text text-transparent">
            87
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {[
              ['Uzunluk', 0], ['Bölümler', 1], ['Yetenekler', 2], ['Format', 3]
            ].map(([l, i]) => (
              <div key={l} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>{l}</span><span className="font-semibold">{Math.floor(70 + (i * 7) % 30)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Ciddi iş arayanlar için tasarlandı</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 grid place-items-center text-brand-600 dark:text-brand-300 font-bold mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
