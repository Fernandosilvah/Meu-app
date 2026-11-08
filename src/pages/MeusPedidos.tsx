import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CalendarPlus, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseStore } from '../db/store';
import { Agendamento } from '../types';
import { ProductIcon } from '../components/ProductIcon';
import { StatusBadge } from '../components/StatusBadge';
import { formatDataHoraCurto } from '../utils/date';

export const MeusPedidos: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<Agendamento[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pageSize = 10;

  const loadPedidos = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (!session) return;
      try {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);
        setErrorMsg(null);

        const res = await DatabaseStore.meus_agendamentos(
          session.usuario_id,
          undefined,
          pageSize,
          pageNum * pageSize
        );

        if (isInitial) {
          setPedidos(res.items);
        } else {
          setPedidos((prev) => [...prev, ...res.items]);
        }
        setTotal(res.total);
      } catch (err: any) {
        console.error('Error fetching meus pedidos:', err);
        setErrorMsg('Não foi possível carregar os pedidos.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [session]
  );

  useEffect(() => {
    loadPedidos(0, true);
  }, [loadPedidos]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPedidos(nextPage, false);
  };

  const hasMore = pedidos.length < total;

  return (
    <div className="py-5 px-4 flex flex-col gap-5">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D0F14] tracking-tight mb-1">
          Meus pedidos
        </h2>
        <p className="text-sm text-[#5B6472]">
          Acompanhe o andamento de cada atendimento.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 py-6">
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
            onClick={() => loadPedidos(0, true)}
            className="h-10 px-4 rounded-[9px] bg-[#C62F2A] text-white text-xs font-semibold hover:bg-[#b02824] transition-colors"
          >
            Tentar de novo
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-[#FDFDFE] rounded-[24px] p-8 card-shadow text-center my-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0D0F14] mb-2">
            Você ainda não tem pedidos
          </h3>
          <p className="text-sm text-[#5B6472] max-w-xs mb-6 leading-relaxed">
            Escolha um produto, o dia e a hora. Leva menos de 2 minutos.
          </p>
          <button
            type="button"
            onClick={() => navigate('/agendar')}
            className="w-full max-w-xs h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
          >
            <CalendarPlus className="w-5 h-5" />
            <span>Agendar agora</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <button
              key={pedido.id}
              type="button"
              onClick={() => navigate(`/pedidos/${pedido.id}`)}
              className="w-full text-left bg-[#FDFDFE] hover:bg-white rounded-[18px] p-4 card-shadow card-shadow-hover transition-all active:scale-[0.99] flex items-center gap-3.5 cursor-pointer border border-transparent hover:border-[#1A5FD6]/20 group"
            >
              {/* Product icon */}
              <div className="w-12 h-12 rounded-[14px] bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ProductIcon name={pedido.produto?.icone || ''} className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-[#0D0F14] truncate">
                    {pedido.produto?.nome || 'Atendimento'}
                  </h4>
                  <StatusBadge status={pedido.status} />
                </div>

                <p className="text-xs text-[#5B6472] font-medium mb-1">
                  {formatDataHoraCurto(pedido.data_agendada, pedido.hora)}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#5B6472]">
                  <span>{pedido.local_tipo === 'DOMICILIO' ? 'Em casa' : 'Na empresa'}</span>
                  {pedido.fotos_count !== undefined && pedido.fotos_count > 0 && (
                    <>
                      <span>·</span>
                      <span>{pedido.fotos_count} foto(s)</span>
                    </>
                  )}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#5B6472] group-hover:text-[#1A5FD6] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>
          ))}

          {/* Load more / Infinite scroll trigger */}
          {hasMore && (
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
