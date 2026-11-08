import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle2, CalendarPlus, HelpCircle } from 'lucide-react';
import { DatabaseStore } from '../db/store';
import { useAuth } from '../contexts/AuthContext';
import { ProductIcon } from '../components/ProductIcon';
import { HomeServiceBadge } from '../components/HomeServiceBadge';

export const ProdutoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { empresa } = useAuth();

  const produto = useMemo(() => {
    const list = DatabaseStore.getProdutos();
    return list.find((p) => p.slug === slug && p.ativo);
  }, [slug]);

  // Se o slug for inexistente, redireciona para /
  if (!produto) {
    navigate('/', { replace: true });
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Separa a lista de documentos pelo caractere |
  const documentosList = produto.documentos
    .split('|')
    .map((doc) => doc.trim())
    .filter(Boolean);

  return (
    <div className="py-5 px-4 flex flex-col gap-5">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0D0F14] active:scale-95 transition-colors p-1 -ml-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="flex items-start gap-4">
        {/* 64px Icon in square primary-bg */}
        <div className="w-16 h-16 rounded-[18px] bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center shrink-0 shadow-sm">
          <ProductIcon name={produto.icone} className="w-8 h-8" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[#0D0F14] leading-tight mb-1">
            {produto.nome}
          </h2>
          <p className="text-xs text-[#5B6472] mb-2">{produto.subtitulo}</p>
          {produto.atende_domicilio && empresa.atende_domicilio && (
            <HomeServiceBadge />
          )}
        </div>
      </div>

      {/* 3 Information Cards */}
      <div className="flex flex-col gap-4">
        {/* Card 1: Como funciona */}
        <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60">
          <div className="flex items-center gap-2 mb-2 text-[#0D0F14]">
            <HelpCircle className="w-5 h-5 text-[#1A5FD6]" />
            <h3 className="text-base font-semibold">Como funciona</h3>
          </div>
          <p className="text-sm text-[#5B6472] leading-relaxed">
            {produto.resumo}
          </p>
        </div>

        {/* Card 2: Para quem serve */}
        <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60">
          <div className="flex items-center gap-2 mb-2 text-[#0D0F14]">
            <Users className="w-5 h-5 text-[#1A5FD6]" />
            <h3 className="text-base font-semibold">Para quem serve</h3>
          </div>
          <p className="text-sm text-[#5B6472] leading-relaxed">
            {produto.para_quem}
          </p>
        </div>

        {/* Card 3: O que você precisa levar */}
        <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60">
          <div className="flex items-center gap-2 mb-3 text-[#0D0F14]">
            <CheckCircle2 className="w-5 h-5 text-[#0F7A52]" />
            <h3 className="text-base font-semibold">O que você precisa levar</h3>
          </div>
          <ul className="flex flex-col gap-2.5">
            {documentosList.map((doc, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-[#0D0F14]">
                <CheckCircle2 className="w-4 h-4 text-[#0F7A52] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Primary Action Button (56px) */}
      <div className="pt-2 sticky bottom-20 z-10 pb-2">
        <button
          type="button"
          onClick={() => navigate(`/agendar?produto=${produto.slug}`)}
          className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer"
        >
          <CalendarPlus className="w-5 h-5" />
          <span>Agendar este atendimento</span>
        </button>
      </div>
    </div>
  );
};
