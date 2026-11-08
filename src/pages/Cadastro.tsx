import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, FileText, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  isValidCPF,
  maskCPF,
  isValidPhone,
  maskPhone,
  isValidFullName,
  isValidEmail,
} from '../utils/validation';

export const Cadastro: React.FC = () => {
  const { session, saveClienteProfile } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [nome, setNome] = useState<string>(session?.name || '');
  const [telefone, setTelefone] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [email, setEmail] = useState<string>(session?.email || '');

  const [errors, setErrors] = useState<{
    nome?: string;
    telefone?: string;
    cpf?: string;
    email?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!isValidFullName(nome)) {
      newErrors.nome = 'Digite seu nome completo.';
    }

    if (!isValidPhone(telefone)) {
      newErrors.telefone = 'Digite um telefone com DDD.';
    }

    if (!isValidCPF(cpf)) {
      newErrors.cpf = 'Esse CPF não parece válido.';
    }

    if (!isValidEmail(email)) {
      newErrors.email = 'Digite um e-mail válido.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await saveClienteProfile({ nome, telefone, cpf, email });
      success('Cadastro salvo.');
      navigate('/');
    } catch (err: any) {
      setErrors({ nome: err?.message || 'Erro ao salvar o cadastro.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 px-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0D0F14] tracking-tight mb-1">
          Vamos nos conhecer
        </h2>
        <p className="text-sm text-[#5B6472] leading-relaxed">
          Preencha seus dados uma única vez. Depois é só escolher o dia e a hora.
        </p>
      </div>

      <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">
              Nome completo
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-[#5B6472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (errors.nome) setErrors((prev) => ({ ...prev, nome: undefined }));
                }}
                placeholder="Ex.: Maria de Souza Oliveira"
                className={`w-full h-12 pl-11 pr-4 rounded-[12px] bg-white border text-sm text-[#0D0F14] placeholder-[#5B6472]/50 focus:outline-none focus:border-[#1A5FD6] transition-colors ${
                  errors.nome ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                }`}
              />
            </div>
            {errors.nome && (
              <p className="mt-1 text-xs text-[#C62F2A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.nome}</span>
              </p>
            )}
          </div>

          {/* Telefone com DDD */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">
              Telefone com DDD
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-[#5B6472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                inputMode="numeric"
                value={telefone}
                onChange={(e) => {
                  setTelefone(maskPhone(e.target.value));
                  if (errors.telefone) setErrors((prev) => ({ ...prev, telefone: undefined }));
                }}
                placeholder="(11) 99999-9999"
                className={`w-full h-12 pl-11 pr-4 rounded-[12px] bg-white border text-sm text-[#0D0F14] placeholder-[#5B6472]/50 focus:outline-none focus:border-[#1A5FD6] transition-colors ${
                  errors.telefone ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                }`}
              />
            </div>
            {errors.telefone && (
              <p className="mt-1 text-xs text-[#C62F2A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.telefone}</span>
              </p>
            )}
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">CPF</label>
            <div className="relative">
              <FileText className="w-5 h-5 text-[#5B6472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => {
                  setCpf(maskCPF(e.target.value));
                  if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: undefined }));
                }}
                placeholder="000.000.000-00"
                className={`w-full h-12 pl-11 pr-4 rounded-[12px] bg-white border text-sm text-[#0D0F14] placeholder-[#5B6472]/50 focus:outline-none focus:border-[#1A5FD6] transition-colors ${
                  errors.cpf ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                }`}
              />
            </div>
            {errors.cpf && (
              <p className="mt-1 text-xs text-[#C62F2A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.cpf}</span>
              </p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#5B6472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="seu.email@exemplo.com"
                className={`w-full h-12 pl-11 pr-4 rounded-[12px] bg-white border text-sm text-[#0D0F14] placeholder-[#5B6472]/50 focus:outline-none focus:border-[#1A5FD6] transition-colors ${
                  errors.email ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-[#C62F2A] flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-[12px] bg-[#1A5FD6] hover:bg-[#1450B8] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Salvando...' : 'Continuar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
