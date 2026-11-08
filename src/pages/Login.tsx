import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LOGO_DATA_URI } from '../assets/logo';
import { DatabaseStore } from '../db/store';
import { isValidEmail } from '../utils/validation';

export const Login: React.FC = () => {
  const { loginWithGoogle, loginWithMicrosoft, requestEmailCode, verifyEmailCode } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [codeRequested, setCodeRequested] = useState<boolean>(false);
  const [mockSentCode, setMockSentCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isEmailLoginEnabled = DatabaseStore.getIsEmailLoginEnabled();
  const isOpenRegistration = DatabaseStore.getIsOpenRegistration();
  const empresa = DatabaseStore.getEmpresa();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      await loginWithGoogle();
      toastSuccess('Entrando na conta...');
      navigate('/');
    } catch (err: any) {
      setLocalError(err?.message || 'Falha ao autenticar com a conta Google.');
      toastError(err?.message || 'Falha ao entrar com Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      await loginWithMicrosoft();
      toastSuccess('Entrando na conta...');
      navigate('/');
    } catch (err: any) {
      setLocalError(err?.message || 'Falha ao autenticar com a conta Microsoft.');
      toastError(err?.message || 'Falha ao entrar com Microsoft.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(emailInput)) {
      setLocalError('Digite um e-mail válido para receber o código.');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      const res = await requestEmailCode(emailInput);
      setCodeRequested(true);
      setMockSentCode(res.code);
      toastSuccess(`Código enviado para ${emailInput}`);
    } catch (err: any) {
      setLocalError(err?.message || 'Não foi possível enviar o código para este e-mail.');
      toastError(err?.message || 'Erro ao solicitar código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim() || codeInput.trim().length < 6) {
      setLocalError('Digite o código de 6 dígitos recebido por e-mail.');
      return;
    }

    try {
      setIsLoading(true);
      setLocalError(null);
      await verifyEmailCode(emailInput, codeInput);
      navigate('/');
    } catch (err: any) {
      setLocalError(err?.message || 'Código incorreto ou expirado.');
      toastError(err?.message || 'Código incorreto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#061A45] text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-lg min-h-screen flex flex-col justify-between p-6 overflow-x-hidden">
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center py-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <img
              src={LOGO_DATA_URI}
              alt="Logo"
              className="w-20 h-20 rounded-2xl object-cover shadow-2xl border-2 border-white/20"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
            {empresa.nome || 'CREDMAISPLUS'}
          </h1>
          <p className="text-sm text-white/70">Consultoria de Crédito & Soluções Financeiras</p>

          <div className="mt-4 px-4 py-2 rounded-full bg-[#0D2A66] border border-white/10">
            <p className="text-xs font-semibold text-[#8EB5F8] tracking-wide">
              Agende pelo app e vamos até você
            </p>
          </div>
        </div>

        {/* Error message */}
        {localError && (
          <div className="mb-5 p-3.5 rounded-[12px] bg-[#FDF0EF] border border-[#F6C3C0] text-[#C62F2A] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {!isOpenRegistration && (
          <div className="mb-4 p-3 rounded-[12px] bg-[#0D2A66] text-[#8EB5F8] text-xs text-center border border-white/10">
            Acesso somente para convidados.
          </div>
        )}

        {/* Auth Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 rounded-[12px] bg-white text-[#0D0F14] font-semibold text-sm flex items-center justify-center gap-3 shadow-md hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google</span>
          </button>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full h-14 rounded-[12px] bg-[#0D2A66] hover:bg-[#123682] text-white font-semibold text-sm flex items-center justify-center gap-3 border border-white/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            <span>Continuar com Microsoft</span>
          </button>
        </div>

        {/* Email Code Section */}
        {isEmailLoginEnabled && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider text-center mb-3">
              Ou entre com código por e-mail
            </p>

            {!codeRequested ? (
              <form onSubmit={handleRequestCode} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="w-5 h-5 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-[12px] bg-[#0D2A66] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#1A5FD6] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-[12px] bg-[#1A5FD6] hover:bg-[#1450B8] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>Receber código de 6 dígitos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                <div className="p-3 rounded-[12px] bg-[#0D2A66] border border-white/20 text-xs text-white/90">
                  <p>Enviamos um código de 6 dígitos para:</p>
                  <p className="font-semibold text-white mt-0.5">{emailInput}</p>
                  {mockSentCode && (
                    <p className="mt-2 text-[#8EB5F8] font-mono font-semibold">
                      Código de verificação: {mockSentCode}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <KeyRound className="w-5 h-5 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Digite os 6 dígitos"
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-[12px] bg-[#0D2A66] border border-white/20 text-white placeholder-white/40 text-sm tracking-widest font-mono text-center focus:outline-none focus:border-[#1A5FD6] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-[12px] bg-[#1A5FD6] hover:bg-[#1450B8] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Confirmar e Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCodeRequested(false)}
                  className="text-xs text-white/60 hover:text-white text-center py-1 transition-colors"
                >
                  Trocar e-mail ou reenviar
                </button>
              </form>
            )}
          </div>
        )}

      </div>

      </div>
    </div>
  );
};
