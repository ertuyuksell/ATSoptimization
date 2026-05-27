import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
               : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 8 }} className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold">R</motion.div>
          <span className="font-extrabold tracking-tight text-lg">ResumeIQ</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {token && <NavLink to="/dashboard" className={link}>Panel</NavLink>}
          {token && <NavLink to="/upload" className={link}>CV Yükle</NavLink>}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="btn-ghost !px-3 !py-2 text-sm" title="Tema değiştir">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {token ? (
            <>
              <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                {user?.fullName || user?.email}
              </span>
              <button className="btn-ghost text-sm" onClick={() => { logout(); navigate('/'); }}>Çıkış</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Giriş yap</Link>
              <Link to="/register" className="btn-primary text-sm">Hemen başla</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
