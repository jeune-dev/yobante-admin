import { useState } from 'react';
import { useLogin } from '@/auth/hooks/useLogin';
import { toast } from 'react-toastify';
import Icon from '@/shared/components/dashboard/Icon';
import '@/assets/css/Login.css';
import LOGO from '@/assets/images/logo.png';

const FEATURES = [
  'Boutique en ligne & catalogue produits',
  'Expédition, conteneurs & suivi colis',
  "Pilotage de l'application mobile",
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    login.mutate({ email, password });
  };

  return (
    <div className="auth-page auth-fit">
      <div className="auth-shell">
        {/* ── Panneau de marque ── */}
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <div className="auth-logo-tile">
              <img src={LOGO} alt="Yobante" />
            </div>
            <h1>
              Pilotez tout <span className="accent">Yobante</span> depuis un seul endroit
            </h1>
            <p className="auth-brand-lead">
              La plateforme d'administration unifiée pour votre boutique, vos expéditions et votre
              application mobile.
            </p>
            <ul className="auth-features">
              {FEATURES.map((f) => (
                <li className="auth-feature" key={f}>
                  <span className="auth-feature-ic"><Icon name="check" size={12} /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="auth-brand-foot">© {new Date().getFullYear()} Yobante · Administration</div>
        </aside>

        {/* ── Formulaire ── */}
        <main className="auth-form-side">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Connexion</h2>
            <p className="auth-form-sub">Accédez à votre espace d'administration</p>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-ic"><Icon name="mail" size={16} /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={login.isPending}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Mot de passe</label>
              <div className="auth-input-wrap">
                <span className="auth-input-ic"><Icon name="lock" size={16} /></span>
                <input
                  className="auth-input"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={login.isPending}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Icon name={showPwd ? 'eye-off' : 'eye'} size={15} />
                </button>
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={login.isPending}>
              {login.isPending ? <span className="auth-spinner" /> : 'Se connecter'}
            </button>

            <p className="auth-foot">Accès réservé aux administrateurs Yobante</p>
          </form>
        </main>
      </div>
    </div>
  );
};
