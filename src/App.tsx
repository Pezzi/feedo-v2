import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hooks e Serviços
import { useAuthStore } from './store';
import { supabase } from './services/supabase';
import { CampaignsPage } from './pages/CampaignsPage'; 
import { BillingPage } from './pages/BillingPage';

// Layout e Páginas
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmailConfirmation } from './pages/EmailConfirmation';
import { Dashboard } from './pages/Dashboard';
import { QRCodes } from './pages/QRCodes';
import { CreateQRCode } from './pages/CreateQRCode';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { PublicFeedbackPage } from './pages/PublicFeedbackPage';
import { Veepo } from './pages/Veepo';
import { Veepar } from './pages/Veepar';
import { Feedbacks } from './pages/FeedbacksWithSupabase';
import { CreateCampaignPage } from './pages/CreateCampaignPage';

const queryClient = new QueryClient();

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    initializeSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616]">
        <h1 className="text-2xl font-bold text-white animate-pulse">Carregando...</h1>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rota pública que não usa o Layout principal */}
          <Route path="/f/:qrCodeId" element={<PublicFeedbackPage />} />
          
          {/* Rotas de Autenticação para usuários não logados */}
          {!user && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
            </>
          )}

          {/* Rotas Privadas para usuários logados */}
          {user && (
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="qr-codes" element={<QRCodes />} />
              <Route path="qr-codes/create" element={<CreateQRCode />} />
              <Route path="settings" element={<AccountSettingsPage />} />
              <Route path="veepo" element={<Veepo />} />
              <Route path="veepar" element={<Veepar />} />
              <Route path="feedbacks" element={<Feedbacks />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="campaigns/create" element={<CreateCampaignPage />} />
              <Route path="billing" element={<BillingPage />} />
              {/* Adicione outras rotas privadas aqui */}
            </Route>
          )}

          {/* Rota "Catch-all" para redirecionar qualquer outra URL */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </QueryClientProvider>
  );
}

export default App;