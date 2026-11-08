import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Home as HomeIcon,
  MessageSquare,
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DatabaseStore } from '../db/store';
import { Agendamento, Documento } from '../types';
import { StatusBadge, STATUS_CONFIG } from '../components/StatusBadge';
import { ProductIcon } from '../components/ProductIcon';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatDataHoraCompleto, formatDataExtenso } from '../utils/date';
import { resizeImageToJpegDataUrl } from '../utils/image';

export const DetalhePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<Agendamento | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isAcceptingSuggestion, setIsAcceptingSuggestion] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const orderId = Number(id);

  const loadOrder = useCallback(async () => {
    if (!session || isNaN(orderId)) return;
    try {
      setLoading(true);
      const res = await DatabaseStore.meus_agendamentos(session.usuario_id, orderId);
      if (res.items.length === 0) {
        navigate('/pedidos', { replace: true });
        return;
      }
      setPedido(res.items[0]);

      // Load documents
      const docs = await DatabaseStore.documentos_listar(session.usuario_id, orderId);
      setDocumentos(docs);
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
      toastError('Não foi possível carregar os detalhes do pedido.');
      navigate('/pedidos', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [session, orderId, navigate, toastError]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/pedidos');
    }
  };

  const handleCancelConfirm = async () => {
    if (!session || !pedido) return;
    try {
      setIsCanceling(true);
      await DatabaseStore.agendamento_cancelar(session.usuario_id, pedido.id);
      success('Pedido cancelado com sucesso.');
      setShowCancelModal(false);
      await loadOrder();
    } catch (err: any) {
      toastError(err?.message || 'Erro ao cancelar o pedido.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!session || !pedido) return;
    try {
      setIsAcceptingSuggestion(true);
      await DatabaseStore.sugestao_aceitar(session.usuario_id, pedido.id);
      success('Novo horário aceito com sucesso!');
      await loadOrder();
    } catch (err: any) {
      toastError(err?.message || 'Erro ao aceitar o novo horário.');
    } finally {
      setIsAcceptingSuggestion(false);
    }
  };

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !session || !pedido) return;

    if (documentos.length + files.length > 8) {
      toastError('Limite de fotos atingido neste pedido (máximo 8).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await resizeImageToJpegDataUrl(file);
        await DatabaseStore.documento_anexar(session.usuario_id, pedido.id, {
          nome: file.name,
          conteudo: dataUrl,
        });
      }
      success('Foto(s) adicionada(s) com sucesso!');
      const updatedDocs = await DatabaseStore.documentos_listar(session.usuario_id, pedido.id);
      setDocumentos(updatedDocs);
    } catch (err: any) {
      toastError(err?.message || 'Erro ao anexar foto.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const isOrderActive =
    pedido.status === 'PENDENTE' ||
    pedido.status === 'CONFIRMADO' ||
    pedido.status === 'SUGERIDO';

  const statusHelper = STATUS_CONFIG[pedido.status]?.helpText || '';

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
          <span>Voltar aos pedidos</span>
        </button>
      </div>

      {/* Main Order Card */}
      <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-4">
        {/* Header with status and ID */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EC]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B6472]">
              Pedido nº {pedido.id}
            </span>
            <h3 className="text-base font-bold text-[#0D0F14] mt-0.5">
              {pedido.produto?.nome || 'Atendimento'}
            </h3>
          </div>
          <StatusBadge status={pedido.status} />
        </div>

        {/* Status help text banner */}
        <div
          className={`p-3 rounded-[12px] text-xs font-medium ${
            STATUS_CONFIG[pedido.status]?.bgClass
          } ${STATUS_CONFIG[pedido.status]?.textClass} border ${
            STATUS_CONFIG[pedido.status]?.borderClass
          }`}
        >
          {statusHelper}
        </div>

        {/* Date and Time */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
              Data e horário
            </span>
            <p className="text-sm font-semibold text-[#0D0F14]">
              {formatDataHoraCompleto(pedido.data_agendada, pedido.hora)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          {pedido.local_tipo === 'DOMICILIO' ? (
            <MapPin className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
          ) : (
            <Building2 className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
              Local de atendimento
            </span>
            <p className="text-sm font-semibold text-[#0D0F14]">
              {pedido.local_tipo === 'DOMICILIO' ? 'Em casa' : 'Na empresa'}
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

        {/* Client message if present */}
        {pedido.observacao && (
          <div className="pt-2 border-t border-[#E3E6EC]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
              Seu recado ao consultor
            </span>
            <p className="text-xs text-[#0D0F14] bg-[#F3F6FC] p-3 rounded-[12px] mt-1">
              "{pedido.observacao}"
            </p>
          </div>
        )}
      </div>

      {/* Recado do consultor if present */}
      {pedido.mensagem_consultor && (
        <div className="bg-[#EEF4FD] rounded-[18px] p-4 border border-[#C3D8F7]">
          <div className="flex items-center gap-2 mb-1.5 text-[#1F66C4]">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Recado do consultor
            </h4>
          </div>
          <p className="text-sm text-[#0D0F14] leading-relaxed">
            "{pedido.mensagem_consultor}"
          </p>
        </div>
      )}

      {/* Horário sugerido block (only on SUGERIDO) */}
      {pedido.status === 'SUGERIDO' && pedido.nova_data && pedido.nova_hora && (
        <div className="bg-white rounded-[20px] p-5 card-shadow border-2 border-[#1A5FD6]/30 flex flex-col gap-3.5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A5FD6]">
              Novo horário sugerido
            </span>
            <h4 className="text-base font-bold text-[#0D0F14] mt-1">
              {formatDataExtenso(pedido.nova_data)} às {pedido.nova_hora}
            </h4>
            <p className="text-xs text-[#5B6472] mt-0.5">
              O consultor verificou a disponibilidade e propôs este novo horário.
            </p>
          </div>

          <button
            type="button"
            disabled={isAcceptingSuggestion}
            onClick={handleAcceptSuggestion}
            className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isAcceptingSuggestion ? 'Aceitando...' : 'Aceitar este horário'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/agendar')}
            className="w-full h-12 rounded-[12px] bg-white border border-[#E3E6EC] hover:bg-gray-50 active:scale-[0.98] text-[#0D0F14] font-medium text-xs transition-colors cursor-pointer"
          >
            Prefiro escolher outro dia
          </button>
        </div>
      )}

      {/* Documentos enviados */}
      <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1A5FD6]" />
            <h4 className="text-sm font-bold text-[#0D0F14]">Documentos enviados</h4>
          </div>
          <span className="text-xs text-[#5B6472] font-medium">
            {documentos.length}/8 fotos
          </span>
        </div>

        {documentos.length === 0 ? (
          <p className="text-xs text-[#5B6472]">Nenhum documento anexado a este pedido.</p>
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

        {/* Add more photos if order is active */}
        {isOrderActive && documentos.length < 8 && (
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAddPhotos}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 rounded-[12px] bg-[#E8F0FD] hover:bg-[#d8e7fc] active:scale-[0.98] text-[#1A5FD6] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isUploadingPhoto ? 'Enviando...' : 'Adicionar mais fotos'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Cancel button (only while active) */}
      {isOrderActive && (
        <div className="pt-2 pb-6">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full h-12 rounded-[12px] bg-white border border-[#F6C3C0] text-[#C62F2A] hover:bg-[#FDF0EF] active:scale-[0.98] font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancelar pedido
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancelar pedido"
        message="Tem certeza que quer cancelar este pedido? Você poderá fazer um novo quando quiser."
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        isDestructive={true}
        isLoading={isCanceling}
        onConfirm={handleCancelConfirm}
        onClose={() => setShowCancelModal(false)}
      />

      {/* Image Zoom Modal */}
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
