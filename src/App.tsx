import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Cadastro } from './pages/Cadastro';
import { Home } from './pages/Home';
import { ProdutoPage } from './pages/Produto';
import { Agendar } from './pages/Agendar';
import { MeusPedidos } from './pages/MeusPedidos';
import { DetalhePedido } from './pages/DetalhePedido';
import { Perfil } from './pages/Perfil';
import { PainelConsultor } from './pages/consultor/PainelConsultor';
import { PedidoConsultor } from './pages/consultor/PedidoConsultor';
import { Configuracoes } from './pages/consultor/Configuracoes';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { LOGO_DATA_URI } from './assets/logo';

// Route Guard for authenticated user
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, cliente, isConsultor, isLoading, loadError, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { info } = useToast();
  const guardInstalledRef = useRef<boolean>(false);

  // Section 3.9: Guarda de saída (quando o app é aberto na primeira entrada do histórico)
  useEffect(() => {
    if (session && !guardInstalledRef.current) {
      guardInstalledRef.current = true;
      window.history.replaceState({ rootGuard: true, page: 'root' }, '', window.location.href);
      window.history.pushState({ inApp: true }, '', window.location.href);

      const handleGuardPop = (e: PopStateEvent) => {
        if (e.state?.rootGuard) {
          navigate('/');
          info('Você já está no início. Use o botão Sair para encerrar.');
          // Re-push to maintain guard
          window.history.pushState({ inApp: true }, '', window.location.href);
        }
      };

      window.addEventListener('popstate', handleGuardPop);
      return () => {
        window.removeEventListener('popstate', handleGuardPop);
      };
    }
  }, [session, navigate, info]);

  // Loading Screen: Navy with white spinner (2.2)
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#061A45] flex flex-col items-center justify-center p-6 text-white text-center">
        <img
          src={LOGO_DATA_URI}
          alt="Logo"
          className="w-16 h-16 rounded-full object-cover mb-6 shadow-2xl border-2 border-white/20"
        />
        <RefreshCw className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-sm font-medium text-white/80">Carregando...</p>
      </div>
    );
  }

  // Load Failure Screen: "Não foi possível abrir o aplicativo", reason and retry button (2.2)
  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-[#061A45] flex flex-col items-center justify-center p-6 text-white text-center">
        <img
          src={LOGO_DATA_URI}
          alt="Logo"
          className="w-16 h-16 rounded-full object-cover mb-4 shadow-xl"
        />
        <AlertCircle className="w-10 h-10 text-[#F6C3C0] mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Não foi possível abrir o aplicativo</h3>
        <p className="text-xs text-white/70 max-w-xs mb-6 leading-relaxed">{loadError}</p>
        <button
          type="button"
          onClick={refreshSession}
          className="h-12 px-6 rounded-[12px] bg-[#1A5FD6] text-white font-semibold text-sm hover:bg-[#1450B8] active:scale-95 transition-all cursor-pointer shadow-md"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  // If no session, go to login
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user has no profile (cliente is null):
  // "Cliente sem cadastro: a barra inferior some e o conteúdo é a tela de Cadastro (2.4). Isso vale mesmo que ele tente abrir outra rota."
  if (!cliente) {
    return (
      <div className="min-h-screen w-full bg-[#F3F6FC] text-[#0D0F14] overflow-x-hidden flex justify-center">
        <div className="w-full max-w-lg min-h-screen bg-[#F3F6FC] flex flex-col relative overflow-x-hidden">
          <Header />
          <main className="w-full pt-14 pb-10 min-h-screen overflow-x-hidden">
            <Cadastro />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F3F6FC] text-[#0D0F14] overflow-x-hidden flex justify-center">
      <div className="w-full max-w-lg min-h-screen bg-[#F3F6FC] flex flex-col relative overflow-x-hidden">
        {/* Fixed Header (56px) */}
        <Header />

        {/* Main scrollable body */}
        <main className="w-full pt-14 pb-20 min-h-screen overflow-x-hidden">
          {children}
        </main>

        {/* Fixed Bottom Nav (64px) */}
        <BottomNav />
      </div>
    </div>
  );
};

// Consultant Guard for /consultor...
const ConsultantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConsultor } = useAuth();
  if (!isConsultor) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Public Route Guard (redirect to / if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useAuth();
  if (isLoading) {
    return null;
  }
  if (session) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              }
            />
            <Route
              path="/produto/:slug"
              element={
                <ProtectedLayout>
                  <ProdutoPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/agendar"
              element={
                <ProtectedLayout>
                  <Agendar />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos"
              element={
                <ProtectedLayout>
                  <MeusPedidos />
                </ProtectedLayout>
              }
            />
            <Route
              path="/pedidos/:id"
              element={
                <ProtectedLayout>
                  <DetalhePedido />
                </ProtectedLayout>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedLayout>
                  <Perfil />
                </ProtectedLayout>
              }
            />

            {/* Consultant Routes */}
            <Route
              path="/consultor"
              element={
                <ProtectedLayout>
                  <ConsultantRoute>
                    <PainelConsultor />
                  </ConsultantRoute>
                </ProtectedLayout>
              }
            />
            <Route
              path="/consultor/configuracoes"
              element={
                <ProtectedLayout>
                  <ConsultantRoute>
                    <Configuracoes />
                  </ConsultantRoute>
                </ProtectedLayout>
              }
            />
            <Route
              path="/consultor/:id"
              element={
                <ProtectedLayout>
                  <ConsultantRoute>
                    <PedidoConsultor />
                  </ConsultantRoute>
                </ProtectedLayout>
              }
            />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
