import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/auth/components/LoginForm';
import { useAuthStore } from '@/auth/store/auth.store';

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/select-app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-4xl">🚀</div>
              <span className="text-3xl font-bold text-white">Yobante</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">Administration</h1>
            <p className="text-blue-100 text-sm">Gérez vos boutiques et expéditions</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {/* Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600 text-sm">
                Entrez vos identifiants pour accéder au tableau de bord
              </p>
            </div>

            {/* Form Component */}
            <LoginForm />

            {/* Footer Info */}
            <div className="mt-8 text-center text-sm text-gray-600 border-t pt-6">
              <p className="mb-2">
                Problème de connexion ?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Contactez le support
                </a>
              </p>
              <p className="text-xs text-gray-500">
                © 2024 Yobante. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-blue-100">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Connexion sécurisée SSL/TLS</span>
          </div>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
