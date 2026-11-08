import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, ChevronRight, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseStore } from '../../db/store';
import { AdminCounters, Agendamento } from '../../types';
import { ProductIcon } from '../../components/ProductIcon';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDataHoraCurto } from '../../utils/date';

type FilterTab = 'PENDENTE' | 'CONFIRMADO' | 'SUGERIDO' | 'TODOS';

export const PainelConsultor: React.FC = () => {
  const { session, isConsultor } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<FilterTab>('PENDENTE');
  const [pedidos, setPedidos] = useState<Agendamento[]>([]);
  const [counters, setCounters] = useState<AdminCounters>({
    novos: 0,
    confirmados: 0,
    sugeridos: 0,
    todos: 0,
  });
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pageSize = 10;

  const loadData = useCallback(
    async (tab: FilterTab, pageNum: number, isInitial: boolean = false) => {
      if (!session || !isConsultor) return;
      try {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);
        setErrorMsg(null);

        const [listRes, countRes] = await Promise.all([
          DatabaseStore.admin_agendamentos(
            session.usuario_id,
            tab,
            undefined,
            pageSize,
            pageNum * pageSize
          ),
          DatabaseStore.admin_contadores(session.usuario_id),
        ]);

        if (isInitial) {
          setPedidos(listRes.items);
        } else {
          setPedidos((prev) => [...prev, ...listRes.items]);
        }
        setTotal(listRes.total);
        setCounters(countRes);
      } catch (err: any) {
        console.error('Error in consultant dashboard:', err);
        setErrorMsg(err?.message || 'Falha ao carregar pedidos do painel.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [session, isConsultor]
  );

  useEffect(() => {
    setPage(0);
    loadData(activeTab, 0, true);
  }, [activeTab, loadData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(activeTab, nextPage, false);
  };

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'PENDENTE', label: 'Novos', count: counters.novos },
    { key: 'CONFIRMADO', label: 'Confirmados', count: counters.confirmados },
    { key: 'SUGERIDO', label: 'Sugeridos', count: counters.sugeridos },
    { key: 'TODOS', label: 'Todos' },
  ];

  const getEmptyLabel = () => {
    if (activeTab === 'TODOS') return 'Ainda não chegou nenhum pedido.';
    const tabName = tabs.find((t) => t.key === activeTab)?.label.toLowerCase() || '';
    return `Não há pedidos com o status ${tabName}.`;
  };

  return (
    <div className="py-5 px-4 flex flex-col gap-5">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D0F14] tracking-tight mb-1">
          Painel do consultor
        </h2>
        <p className="text-sm text-[#5B6472]">
          Analise os pedidos e responda aos clientes.
        </p>
      </div>

      {/* Button: Configurar atendimento */}
      <button
        type="button"
        onClick={() => navigate('/consultor/configuracoes')}
        className="w-full h-12 rounded-[14px] bg-white border border-[#E3E6EC] hover:bg-gray-50 active:scale-[0.98] text-[#0D0F14] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
      >
        <Settings className="w-4 h-4 text-[#1A5FD6]" />
        <span>Configurar atendimento</span>
      </button>

      {/* Pill Filter Tabs (Horizontal Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const showCount = tab.count !== undefined && tab.count > 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`h-10 px-4 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#1A5FD6] text-white shadow-sm'
                  : 'bg-white text-[#5B6472] border border-[#E3E6EC] hover:text-[#0D0F14]'
              }`}
            >
              <span>{tab.label}</span>
              {showCount && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#E8F0FD] text-[#1A5FD6]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col gap-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[18px] p-4 card-shadow flex items-center gap-3.5 animate-pulse"
            >
              <div className="w-12 h-12 rounded-[14px] bg-[#E8F0FD]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        <div className="p-4 rounded-[18px] bg-[#FDF0EF] border border-[#F6C3C0] text-center my-4">
          <AlertCircle className="w-6 h-6 text-[#C62F2A] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#C62F2A] mb-3">{errorMsg}</p>
          <button
            type="button"
            onClick={() => loadData(activeTab, 0, true)}
            className="h-10 px-4 rounded-[9px] bg-[#C62F2A] text-white text-xs font-semibold hover:bg-[#b02824] transition-colors"
          >
            Tentar de novo
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-[#FDFDFE] rounded-[20px] p-8 card-shadow text-center my-4 flex flex-col items-center">
          <Shield className="w-12 h-12 text-[#5B6472]/40 mb-3" />
          <h4 className="text-base font-bold text-[#0D0F14] mb-1">
            Nenhum pedido aqui
          </h4>
          <p className="text-xs text-[#5B6472]">{getEmptyLabel()}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <button
              key={pedido.id}
              type="button"
              onClick={() => navigate(`/consultor/${pedido.id}`)}
              className="w-full text-left bg-[#FDFDFE] hover:bg-white rounded-[18px] p-4 card-shadow card-shadow-hover transition-all active:scale-[0.99] flex items-center gap-3.5 cursor-pointer border border-transparent hover:border-[#1A5FD6]/20 group"
            >
              {/* Product icon */}
              <div className="w-12 h-12 rounded-[14px] bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ProductIcon name={pedido.produto?.icone || ''} className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-[#1A5FD6] shrink-0" />
                    <span className="font-bold text-sm text-[#0D0F14] truncate">
                      {pedido.cliente?.nome || 'Cliente'}
                    </span>
                  </div>
                  <StatusBadge status={pedido.status} />
                </div>

                <p className="text-xs text-[#0D0F14] font-medium truncate mb-1">
                  {pedido.produto?.nome}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#5B6472]">
                  <span>{formatDataHoraCurto(pedido.data_agendada, pedido.hora)}</span>
                  <span>·</span>
                  <span>{pedido.local_tipo === 'DOMICILIO' ? 'Em casa' : 'Na empresa'}</span>
                  {pedido.fotos_count !== undefined && pedido.fotos_count > 0 && (
                    <>
                      <span>·</span>
                      <span className="font-medium text-[#1A5FD6]">{pedido.fotos_count} foto(s)</span>
                    </>
                  )}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#5B6472] group-hover:text-[#1A5FD6] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>
          ))}

          {pedidos.length < total && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="h-12 px-5 rounded-[12px] bg-white border border-[#E3E6EC] text-[#0D0F14] text-xs font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                {loadingMore ? 'Carregando mais...' : 'Carregar mais pedidos'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
