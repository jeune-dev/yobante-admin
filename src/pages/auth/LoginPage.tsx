import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/auth/hooks/useLogin';
import { useAuthStore } from '@/auth/store/auth.store';
import { toast } from 'react-toastify';
import '@/assets/css/Login.css';
import LOGO from '@/assets/images/logo.png';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useLogin();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/select-app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    login.mutate({ identifiant: email, password });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo + Brand */}
        <div className="login-logo-row">
          <img className="login-logo-img" src={LOGO} alt="YOBANTE" />
          <div>
            <div className="login-brand-name">YOBANTE</div>
            <div className="login-brand-sub">Administration</div>
          </div>
        </div>

        {/* Divider */}
        <div className="login-divider" />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-form-group">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={login.isPending}
            />
          </div>

          {/* Password */}
          <div className="login-form-group">
            <label className="login-label">Mot de passe</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={login.isPending}
            />
          </div>

          {/* Submit Button */}
          <button className="login-btn" type="submit" disabled={login.isPending}>
            {login.isPending && <span className="login-spinner" />}
            {login.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Footer */}
        <p className="login-foot">Accès réservé aux administrateurs</p>
      </div>
    </div>
  );
};
