import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { LOGO_DATA_URI } from '../assets/logo';
import { isValidEmail } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrorMsg('Digite um e-mail válido.');
      return;
    }
    setErrorMsg('');
    setSent(true);
    success('Instruções de redefinição enviadas para o seu e-mail.');
  };

  return (
    <div className="min-h-screen w-full bg-[#061A45] text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-lg min-h-screen flex flex-col justify-between p-6 overflow-x-hidden">
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center py-6">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="self-start flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white mb-6 p-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao login</span>
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={LOGO_DATA_URI}
            alt="Logo"
            className="w-16 h-16 rounded-2xl object-cover shadow-xl border border-white/20 mb-3"
          />
          <h1 className="text-xl font-bold text-white">Redefinição de senha</h1>
          <p className="text-xs text-white/70 mt-1">
            Digite seu e-mail cadastrado para receber as instruções de acesso.
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-[18px] bg-[#0D2A66] border border-white/20 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#0F7A52] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">E-mail enviado!</h3>
            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              Se houver uma conta com o e-mail informado, você receberá um link para redefinir sua senha.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-[12px] bg-[#1A5FD6] text-white font-semibold text-sm hover:bg-[#1450B8] transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {errorMsg && (
              <div className="p-3 rounded-[12px] bg-[#FDF0EF] border border-[#F6C3C0] text-[#C62F2A] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="relative">
              <Mail className="w-5 h-5 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail cadastrado"
                required
                className="w-full h-12 pl-11 pr-4 rounded-[12px] bg-[#0D2A66] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#1A5FD6] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-[12px] bg-[#1A5FD6] hover:bg-[#1450B8] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Enviar link de redefinição</span>
            </button>
          </form>
        )}
      </div>

      </div>
    </div>
  );
};
