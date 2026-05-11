import { useState } from 'react';
import { Lock, X, LogIn, Eye, EyeOff, Shield } from 'lucide-react';

interface Props {
  onLogin: (username: string, password: string) => boolean;
  onClose: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = onLogin(username, password);
      if (!success) {
        setError("Identifiant ou mot de passe incorrect.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={28} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Espace Administration</h3>
          <p className="text-xs text-slate-400 mt-0.5">Connexion requise</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Identifiant
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre identifiant"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-sky-400 focus:bg-white transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-sky-400 focus:bg-white transition-all duration-200 outline-none text-sm text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 text-center font-medium">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors cursor-pointer"
            >
              <X size={15} />
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={15} />
              )}
              Connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
