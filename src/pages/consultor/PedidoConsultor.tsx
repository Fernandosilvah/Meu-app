import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Home as HomeIcon,
  User,
  Phone,
  Mail,
  FileText,
  MessageCircle,
  Camera,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { DatabaseStore } from '../../db/store';
import { Agendamento, Documento } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { DateTimePicker } from '../../components/DateTimePicker';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatDataHoraCompleto, formatDataExtenso } from '../../utils/date';

export const PedidoConsultor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session, isConsultor } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const orderId = Number(id);

  const [pedido, setPedido] = useState<Agendamento | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Consultant decision state
  const [recado, setRecado] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Suggestion mode (linked to browser history)
  const [isSuggestingMode, setIsSuggestingMode] = useState<boolean>(false);
  const [sugeridaData, setSugeridaData] = useState<string>('');
  const [sugeridaHora, setSugeridaHora] = useState<string>('');

  // Confirmation modal for refusal
  const [showRefuseModal, setShowRefuseModal] = useState<boolean>(false);

  // Photo zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!session || !isConsultor || isNaN(orderId)) return;
    try {
      setLoading(true);
      const res = await DatabaseStore.admin_agendamentos(
        session.usuario_id,
        undefined,
        orderId,
        1,
        0
      );

      if (res.items.length === 0) {
        navigate('/consultor', { replace: true });
        return;
      }

      setPedido(res.items[0]);
      if (res.items[0].mensagem_consultor) {
        setRecado(res.items[0].mensagem_consultor);
      }

      const docs = await DatabaseStore.documentos_listar(session.usuario_id, orderId);
      setDocumentos(docs);
    } catch (err: any) {
      console.error('Error fetching consultant order detail:', err);
      toastError('Não foi possível carregar o pedido.');
      navigate('/consultor', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [session, isConsultor, orderId, navigate, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle browser back in suggestion mode
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.suggestingMode) {
        setIsSuggestingMode(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const openSuggestingMode = () => {
    window.history.pushState({ suggestingMode: true }, '', window.location.href);
    setIsSuggestingMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeSuggestingMode = () => {
    if (window.history.state?.suggestingMode) {
      window.history.back();
    } else {
      setIsSuggestingMode(false);
    }
  };

  const handleConfirm = async () => {
    if (!session || !pedido) return;
    try {
      setIsSubmitting(true);
      await DatabaseStore.admin_decidir(
        session.usuario_id,
        pedido.id,
        'CONFIRMAR',
        recado.trim() || null
      );
      success('Atendimento confirmado com sucesso!');
      navigate('/consultor');
    } catch (err: any) {
      toastError(err?.message || 'Erro ao confirmar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefuse = async () => {
    if (!session || !pedido) return;
    try {
      setIsSubmitting(true);
      await DatabaseStore.admin_decidir(
        session.usuario_id,
        pedido.id,
        'RECUSAR',
        recado.trim() || null
      );
      success('Pedido recusado.');
      setShowRefuseModal(false);
      navigate('/consultor');
    } catch (err: any) {
      toastError(err?.message || 'Erro ao recusar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendSuggestion = async () => {
    if (!session || !pedido) return;
    if (!sugeridaData || !sugeridaHora) {
      toastError('Escolha o dia e o novo horário sugerido.');
      return;
    }

    try {
      setIsSubmitting(true);
      await DatabaseStore.admin_decidir(
        session.usuario_id,
        pedido.id,
        'SUGERIR',
        recado.trim() || null,
        sugeridaData,
        sugeridaHora
      );
      success('Novo horário enviado ao cliente.');
      closeSuggestingMode();
      await loadData();
    } catch (err: any) {
      toastError(err?.message || 'Erro ao enviar novo horário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !pedido) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1A5FD6] border-t-transparent animate-spin mb-3" />
        <p className="text-sm text-[#5B6472]">Carregando pedido...</p>
      </div>
    );
  }

  const cleanPhone = pedido.cliente?.telefone ? pedido.cliente.telefone.replace(/\D/g, '') : '';
  const canWhatsApp = cleanPhone.length >= 10;
  const isOrderOpen =
    pedido.status === 'PENDENTE' ||
    pedido.status === 'SUGERIDO' ||
    pedido.status === 'CONFIRMADO';

  // Mode: Sugerir outro horário
  if (isSuggestingMode) {
    return (
      <div className="py-5 px-4 flex flex-col gap-5">
        <div>
          <button
            type="button"
            onClick={closeSuggestingMode}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0D0F14] transition-colors p-1 -ml-1 cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao pedido</span>
          </button>
          <h2 className="text-xl font-bold text-[#0D0F14]">Sugerir novo horário</h2>
          <p className="text-xs text-[#5B6472] mt-0.5">
            O cliente receberá sua sugestão e poderá aceitar ou escolher outro dia.
          </p>
        </div>

        <DateTimePicker
          selectedDate={sugeridaData}
          selectedTime={sugeridaHora}
          onSelect={(d, t) => {
            setSugeridaData(d);
            setSugeridaHora(t);
          }}
        />

        <div>
          <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">
            Recado para o cliente <span className="text-[#5B6472] font-normal">(opcional)</span>
          </label>
          <textarea
            maxLength={400}
            rows={2}
            value={recado}
            onChange={(e) => setRecado(e.target.value)}
            placeholder="Ex.: Sugiro este horário pois estarei na sua região..."
            className="w-full p-3 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] resize-none"
          />
        </div>

        <div className="pt-2 sticky bottom-20 z-10 pb-4">
          <button
            type="button"
            disabled={isSubmitting || !sugeridaData || !sugeridaHora}
            onClick={handleSendSuggestion}
            className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Enviando...' : 'Enviar novo horário'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-4 flex flex-col gap-5">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/consultor')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0D0F14] active:scale-95 transition-colors p-1 -ml-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao painel</span>
        </button>
      </div>

      {/* Cartão do pedido */}
      <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EC]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B6472]">
              Pedido nº {pedido.id}
            </span>
            <h3 className="text-base font-bold text-[#0D0F14] mt-0.5">
              {pedido.produto?.nome}
            </h3>
          </div>
          <StatusBadge status={pedido.status} />
        </div>

        {/* Dia e hora pedidos */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
              Dia e hora pedidos
            </span>
            <p className="text-sm font-semibold text-[#0D0F14]">
              {formatDataHoraCompleto(pedido.data_agendada, pedido.hora)}
            </p>
          </div>
        </div>

        {/* Horário sugerido ao cliente if SUGERIDO */}
        {pedido.status === 'SUGERIDO' && pedido.nova_data && pedido.nova_hora && (
          <div className="p-3.5 rounded-[14px] bg-[#EEF4FD] border border-[#C3D8F7]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F66C4]">
              Horário sugerido ao cliente
            </span>
            <p className="text-sm font-bold text-[#0D0F14] mt-0.5">
              {formatDataExtenso(pedido.nova_data)} às {pedido.nova_hora}
            </p>
          </div>
        )}

        {/* Local */}
        <div className="flex items-start gap-3">
          {pedido.local_tipo === 'DOMICILIO' ? (
            <HomeIcon className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
          ) : (
            <Building2 className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
              Local
            </span>
            <p className="text-sm font-semibold text-[#0D0F14]">
              {pedido.local_tipo === 'DOMICILIO' ? 'Em casa do cliente' : 'Na empresa'}
            </p>

            {pedido.local_tipo === 'DOMICILIO' && (
              <div className="text-xs text-[#5B6472] mt-1 space-y-0.5 leading-relaxed">
                <p>
                  {pedido.logradouro}, {pedido.numero} {pedido.complemento && `(${pedido.complemento})`}
                </p>
                <p>
                  {pedido.bairro} · {pedido.cidade} - {pedido.uf} · CEP {pedido.cep}
                </p>
                {pedido.referencia && (
                  <p className="font-medium text-[#0D0F14] mt-1">
                    Referência: {pedido.referencia}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recado do cliente if any */}
        {pedido.observacao && (
          <div className="pt-2 border-t border-[#E3E6EC]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
              Recado do cliente
            </span>
            <p className="text-xs text-[#0D0F14] bg-[#F3F6FC] p-3 rounded-[12px] mt-1">
              "{pedido.observacao}"
            </p>
          </div>
        )}
      </div>

      {/* Cartão Cliente */}
      <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E3E6EC]">
          <User className="w-5 h-5 text-[#1A5FD6]" />
          <h4 className="text-sm font-bold text-[#0D0F14]">Dados do cliente</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[#5B6472]">Nome:</span>{' '}
            <strong className="text-[#0D0F14] text-sm">{pedido.cliente?.nome}</strong>
          </div>
          <div>
            <span className="text-[#5B6472]">Telefone:</span>{' '}
            <strong className="text-[#0D0F14]">{pedido.cliente?.telefone}</strong>
          </div>
          <div>
            <span className="text-[#5B6472]">CPF:</span>{' '}
            <strong className="text-[#0D0F14]">{pedido.cliente?.cpf}</strong>
          </div>
          <div>
            <span className="text-[#5B6472]">E-mail:</span>{' '}
            <span className="text-[#0D0F14]">{pedido.cliente?.email}</span>
          </div>
        </div>

        {/* Botão Chamar no WhatsApp */}
        {canWhatsApp && (
          <div className="pt-1">
            <a
              href={`https://wa.me/55${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-[12px] bg-[#0F7A52] hover:bg-[#0c6543] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        )}
      </div>

      {/* Cartão Documentos enviados */}
      <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1A5FD6]" />
            <h4 className="text-sm font-bold text-[#0D0F14]">Documentos enviados</h4>
          </div>
          <span className="text-xs text-[#5B6472] font-medium">
            {documentos.length} foto(s)
          </span>
        </div>

        {documentos.length === 0 ? (
          <p className="text-xs text-[#5B6472]">O cliente não anexou fotos neste pedido.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setZoomedImage(doc.conteudo)}
                className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100 border border-[#E3E6EC] cursor-pointer group shadow-2xs"
              >
                <img
                  src={doc.conteudo}
                  alt={doc.nome || 'Documento'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cartão Sua resposta (only if active) */}
      {isOrderOpen && (
        <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-[#0D0F14]">Sua resposta</h4>

          <div>
            <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">
              Recado para o cliente <span className="text-[#5B6472] font-normal">(opcional)</span>
            </label>
            <textarea
              maxLength={400}
              rows={3}
              value={recado}
              onChange={(e) => setRecado(e.target.value)}
              placeholder="Digite uma mensagem ou orientações para o cliente..."
              className="w-full p-3.5 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] resize-none"
            />
            <div className="text-right text-[11px] text-[#5B6472] mt-1">
              {recado.length}/400
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            {/* Primary confirm button (hidden if already CONFIRMADO) */}
            {pedido.status !== 'CONFIRMADO' && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirmar atendimento</span>
              </button>
            )}

            {/* Suggest another schedule */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={openSuggestingMode}
              className="w-full h-12 rounded-[12px] bg-white border border-[#E3E6EC] hover:bg-gray-50 active:scale-[0.98] text-[#0D0F14] font-semibold text-xs transition-colors cursor-pointer"
            >
              Sugerir outro horário
            </button>

            {/* Refuse button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowRefuseModal(true)}
              className="w-full h-12 rounded-[12px] bg-white border border-[#F6C3C0] text-[#C62F2A] hover:bg-[#FDF0EF] active:scale-[0.98] font-semibold text-xs transition-colors cursor-pointer"
            >
              Recusar pedido
            </button>
          </div>
        </div>
      )}

      {/* Refuse Modal */}
      <ConfirmModal
        isOpen={showRefuseModal}
        title="Recusar pedido"
        message="Tem certeza que deseja recusar este agendamento? Esta ação não pode ser desfeita."
        confirmLabel="Sim, recusar"
        cancelLabel="Voltar"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleRefuse}
        onClose={() => setShowRefuseModal(false)}
      />

      {/* Photo Zoom Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative max-w-lg max-h-[85vh] overflow-hidden rounded-[18px]">
            <img
              src={zoomedImage}
              alt="Documento ampliado"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
