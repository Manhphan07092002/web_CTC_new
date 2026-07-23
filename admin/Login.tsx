
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Lock, ArrowLeft, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';
import SEO from '../components/SEO';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Countdown timer for locked account
  useEffect(() => {
    if (lockCountdown > 0) {
      const timer = setInterval(() => {
        setLockCountdown(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockCountdown]);

  // Format countdown display
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRemainingAttempts(null);
    
    // Don't allow submit if locked
    if (isLocked) {
      return;
    }
    
    // Basic Password Strength Validation
    if (password.length < 6) {
      setError(t('login.weak_password'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/admin');
      } else {
        // Handle different error types
        if (result.code === 'ACCOUNT_LOCKED' && result.lockedUntil) {
          setIsLocked(true);
          setLockCountdown(result.lockedUntil);
          setError(result.error || 'Tài khoản tạm khóa');
        } else if (result.code === 'INVALID_CREDENTIALS') {
          setError(result.error || t('login.error'));
          if (result.remainingAttempts !== undefined) {
            setRemainingAttempts(result.remainingAttempts);
          }
        } else {
          setError(result.error || t('login.error'));
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-corporate flex items-center justify-center p-4 relative overflow-hidden">
      <SEO 
        title={t('login.title')} 
        description="Trang đăng nhập quản trị hệ thống."
        noindex={true}
      />

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
           <img 
              src="https://placehold.co/200x60/ffffff/003B5C?text=CTC&font=montserrat" 
              alt="Logo" 
              className="h-12 mx-auto mb-6 object-contain"
           />
           <h2 className="text-2xl font-bold text-gray-800">{t('login.title')}</h2>
           <p className="text-gray-500 text-sm mt-2">Welcome back, Administrator</p>
        </div>

        {/* Locked Account Warning */}
        {isLocked && lockCountdown > 0 && (
          <div className="bg-orange-50 text-orange-700 p-4 rounded-lg text-sm mb-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              <span className="font-bold">Tài khoản tạm khóa</span>
            </div>
            <p className="mb-2">Bạn đã đăng nhập sai quá 5 lần.</p>
            <div className="flex items-center justify-center gap-2 bg-orange-100 py-2 px-4 rounded-lg">
              <Clock size={18} />
              <span className="font-mono font-bold text-lg">{formatCountdown(lockCountdown)}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !isLocked && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
            {remainingAttempts !== null && remainingAttempts > 0 && (
              <p className="mt-2 text-xs text-red-500">
                Còn {remainingAttempts} lần thử trước khi tài khoản bị khóa
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="admin@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`w-full bg-corporate text-white font-bold py-3 rounded-lg hover:bg-primary transition-all shadow-lg transform hover:-translate-y-0.5 ${(isLoading || isLocked) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? t('common.loading') : isLocked ? `Đợi ${formatCountdown(lockCountdown)}...` : t('login.btn')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link to="/" className="text-gray-500 hover:text-primary text-sm flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} /> {t('login.back')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
