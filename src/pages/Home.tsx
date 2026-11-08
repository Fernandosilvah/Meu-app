import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Clock, MapPin, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseStore } from '../db/store';
import { Produto } from '../types';
import { LOGO_DATA_URI } from '../assets/logo';
import { ProductIcon } from '../components/ProductIcon';
import { HomeServiceBadge } from '../components/HomeServiceBadge';

export const Home: React.FC = () => {
  const { cliente, empresa } = useAuth();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const list = await DatabaseStore.produtos_listar();
      setProdutos(list);
    } catch (err: any) {
      console.error('Error fetching produtos:', err);
      setErrorMsg('Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  const firstName = cliente?.nome ? cliente.nome.split(' ')[0] : '';

  return (
    <div className="py-5 px-4 flex flex-col gap-6">
      {/* Welcome Card in Navy */}
      <div className="bg-[#061A45] text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={LOGO_DATA_URI}
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-white/20 shadow-md"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
              {firstName ? `Olá, ${firstName}!` : 'Olá!'}
            </h2>
          </div>
        </div>

        <p className="text-sm text-white/85 leading-relaxed mb-6 font-normal">
          {empresa.mensagem || 'Atendimento com hora marcada, sem filas e sem enrolação.'}
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => navigate('/agendar')}
          className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer mb-5"
        >
          <CalendarPlus className="w-5 h-5" />
          <span>Agendar atendimento</span>
        </button>

        {/* Support lines */}
        <div className="flex flex-col gap-2 pt-3 border-t border-white/10 text-xs text-white/80">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#8EB5F8] shrink-0" />
            <span>Escolha o dia e a hora em poucos toques</span>
          </div>
          {empresa.atende_domicilio && (
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#8EB5F8] shrink-0" />
              <span>Atendemos na empresa ou na sua casa</span>
            </div>
          )}
        </div>
      </div>

      {/* Credit Products Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-0.5">
          <h3 className="text-base font-semibold text-[#0D0F14] tracking-tight">
            Nossos produtos de crédito
          </h3>
          <span className="text-xs text-[#5B6472]">{produtos.length} opções</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[18px] p-4 card-shadow flex items-center gap-3.5 animate-pulse"
              >
                <div className="w-12 h-12 rounded-[12px] bg-[#E8F0FD]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-[18px] bg-[#FDF0EF] border border-[#F6C3C0] text-center my-2">
            <AlertCircle className="w-6 h-6 text-[#C62F2A] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#C62F2A] mb-3">{errorMsg}</p>
            <button
              type="button"
              onClick={loadProdutos}
              className="h-10 px-4 rounded-[9px] bg-[#C62F2A] text-white text-xs font-semibold hover:bg-[#b02824] transition-colors"
            >
              Tentar de novo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {produtos.map((produto) => (
              <button
                key={produto.id}
                type="button"
                onClick={() => navigate(`/produto/${produto.slug}`)}
                className="w-full text-left bg-[#FDFDFE] hover:bg-white rounded-[18px] p-4 card-shadow card-shadow-hover transition-all active:scale-[0.99] flex items-center gap-3.5 cursor-pointer group border border-transparent hover:border-[#1A5FD6]/15"
              >
                {/* 48px square with primary-bg */}
                <div className="w-12 h-12 rounded-[14px] bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ProductIcon name={produto.icone} className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-sm text-[#0D0F14] truncate">
                      {produto.nome}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5B6472] truncate mb-1">
                    {produto.subtitulo}
                  </p>
                  {produto.atende_domicilio && empresa.atende_domicilio && (
                    <HomeServiceBadge />
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-[#5B6472] group-hover:text-[#1A5FD6] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
