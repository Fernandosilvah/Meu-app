import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Home as HomeIcon,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DatabaseStore } from '../db/store';
import { Produto, LocationType } from '../types';
import { ProductIcon } from '../components/ProductIcon';
import { HomeServiceBadge } from '../components/HomeServiceBadge';
import { DateTimePicker } from '../components/DateTimePicker';
import { formatDataExtenso } from '../utils/date';
import { maskCEP } from '../utils/validation';
import { resizeImageToJpegDataUrl } from '../utils/image';

const STEPS = [
  { id: 1, label: 'Produto' },
  { id: 2, label: 'Dia e hora' },
  { id: 3, label: 'Local' },
  { id: 4, label: 'Documentos' },
  { id: 5, label: 'Revisar' },
];

export const Agendar: React.FC = () => {
  const { session, empresa } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [dataAgendada, setDataAgendada] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [localTipo, setLocalTipo] = useState<LocationType>('PRESENCIAL');

  // Address fields
  const [cep, setCep] = useState<string>('');
  const [logradouro, setLogradouro] = useState<string>('');
  const [numero, setNumero] = useState<string>('');
  const [complemento, setComplemento] = useState<string>('');
  const [bairro, setBairro] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [uf, setUf] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Photos
  const [photos, setPhotos] = useState<{ id: string; name: string; dataUrl: string }[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Review step
  const [observacao, setObservacao] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const produtos = useMemo(() => DatabaseStore.getProdutos().filter((p) => p.ativo), []);

  // Check URL query param ?produto=slug on mount
  useEffect(() => {
    const slugParam = searchParams.get('produto');
    if (slugParam && !produto) {
      const match = produtos.find((p) => p.slug === slugParam);
      if (match) {
        setProduto(match);
        goToStep(2);
      }
    }
  }, [searchParams, produtos]);

  // Sync step changes with browser history
  const goToStep = (newStep: number) => {
    if (newStep === step) return;
    window.history.pushState({ wizardStep: newStep }, '', window.location.href);
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const targetStep = e.state?.wizardStep || 1;
      setStep(targetStep);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handlePrevStep = () => {
    if (step > 1) {
      window.history.back();
    } else {
      navigate(-1);
    }
  };

  // Check home service compatibility
  const canAttendAtHome = Boolean(empresa.atende_domicilio && produto?.atende_domicilio);

  // If selected local is DOMICILIO but product or company cannot attend at home, reset to PRESENCIAL
  useEffect(() => {
    if (localTipo === 'DOMICILIO' && !canAttendAtHome) {
      setLocalTipo('PRESENCIAL');
    }
  }, [canAttendAtHome, localTipo]);

  // ViaCEP integration
  const handleCepChange = async (val: string) => {
    const masked = maskCEP(val);
    setCep(masked);

    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (!logradouro && data.logradouro) setLogradouro(data.logradouro);
          if (!bairro && data.bairro) setBairro(data.bairro);
          if (!cidade && data.localidade) setCidade(data.localidade);
          if (!uf && data.uf) setUf(data.uf.toUpperCase());
        }
      } catch {
        // Falha silenciosa
      }
    }
  };

  // Step 1: Produto validation
  const handleStep1Continue = () => {
    if (!produto) {
      toastError('Escolha um produto para continuar.');
      return;
    }
    goToStep(2);
  };

  // Step 2: Dia e hora validation
  const handleStep2Continue = () => {
    if (!dataAgendada || !hora) {
      toastError('Selecione o dia e o horário desejados.');
      return;
    }
    goToStep(3);
  };

  // Step 3: Local validation
  const handleStep3Continue = () => {
    if (localTipo === 'DOMICILIO') {
      const errors: Record<string, string> = {};
      const cleanCep = cep.replace(/\D/g, '');

      if (cleanCep.length !== 8) {
        errors.cep = 'Digite o CEP com 8 números.';
      }
      if (!logradouro.trim()) {
        errors.logradouro = 'Digite a rua.';
      }
      if (!numero.trim()) {
        errors.numero = 'Digite o número.';
      }
      if (!bairro.trim()) {
        errors.bairro = 'Digite o bairro.';
      }
      if (!cidade.trim()) {
        errors.cidade = 'Digite a cidade.';
      }
      if (uf.trim().length !== 2) {
        errors.uf = 'Use 2 letras.';
      }
      if (!referencia.trim()) {
        errors.referencia = 'Conte um ponto de referência.';
      }

      setAddressErrors(errors);
      if (Object.keys(errors).length > 0) {
        toastError('Preencha os campos obrigatórios do endereço.');
        return;
      }
    }

    goToStep(4);
  };

  // Step 4: Photo handler
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 6) {
      toastError('Você pode anexar até 6 fotos.');
      return;
    }

    try {
      setIsProcessingPhotos(true);
      const newItems: { id: string; name: string; dataUrl: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await resizeImageToJpegDataUrl(file);
        newItems.push({
          id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          dataUrl,
        });
      }

      setPhotos((prev) => [...prev, ...newItems]);
      toastSuccess(`${newItems.length} foto(s) anexada(s)`);
    } catch (err: any) {
      toastError(err?.message || 'Erro ao processar as fotos.');
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Step 5: Final Submission
  const handleSubmitOrder = async () => {
    if (!session || !produto) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Create appointment with server validations
      const created = await DatabaseStore.agendamento_criar(session.usuario_id, {
        produto_id: produto.id,
        data_agendada: dataAgendada,
        hora,
        local_tipo: localTipo,
        cep: localTipo === 'DOMICILIO' ? cep : null,
        logradouro: localTipo === 'DOMICILIO' ? logradouro : null,
        numero: localTipo === 'DOMICILIO' ? numero : null,
        complemento: localTipo === 'DOMICILIO' ? complemento : null,
        bairro: localTipo === 'DOMICILIO' ? bairro : null,
        cidade: localTipo === 'DOMICILIO' ? cidade : null,
        uf: localTipo === 'DOMICILIO' ? uf.toUpperCase() : null,
        referencia: localTipo === 'DOMICILIO' ? referencia : null,
        observacao: observacao.trim() || null,
      });

      // Attach photos one by one
      if (photos.length > 0) {
        for (const photo of photos) {
          await DatabaseStore.documento_anexar(session.usuario_id, created.id, {
            nome: photo.name,
            conteudo: photo.dataUrl,
          });
        }
      }

      toastSuccess('Pedido enviado com sucesso!');
      navigate(`/pedidos/${created.id}`, { replace: true });
    } catch (err: any) {
      console.error('Error submitting appointment:', err);
      const msg = err?.message || 'Erro ao enviar o agendamento.';
      setSubmitError(msg);
      toastError(msg);

      // If slot was taken by someone else in the meantime, return to step 2 with refreshed slots
      if (msg.includes('horário acabou de ser reservado') || msg.includes('vagas')) {
        goToStep(2);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-5 px-4 flex flex-col min-h-[calc(100vh-120px)]">
      {/* Step Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A5FD6]">
            Passo {step} de 5: {STEPS[step - 1].label}
          </span>
          <span className="text-xs text-[#5B6472] font-medium">{step * 20}%</span>
        </div>
        <div className="w-full bg-[#E3E6EC] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#1A5FD6] h-full rounded-full transition-all duration-300"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>

      {/* STEP 1: PRODUTO */}
      {step === 1 && (
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0D0F14] mb-1">
              Escolha o produto de crédito
            </h2>
            <p className="text-xs text-[#5B6472]">
              Selecione a opção que melhor atende à sua necessidade.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {produtos.map((p) => {
              const isSelected = produto?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProduto(p);
                    goToStep(2);
                  }}
                  className={`w-full text-left p-4 rounded-[18px] transition-all flex items-center gap-3.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#E8F0FD] border-[#1A5FD6] shadow-sm'
                      : 'bg-[#FDFDFE] border-transparent card-shadow hover:bg-white'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#1A5FD6] text-white'
                        : 'bg-[#E8F0FD] text-[#1A5FD6]'
                    }`}
                  >
                    <ProductIcon name={p.icone} className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#0D0F14] truncate mb-0.5">
                      {p.nome}
                    </h4>
                    <p className="text-xs text-[#5B6472] truncate mb-1">
                      {p.subtitulo}
                    </p>
                    {p.atende_domicilio && empresa.atende_domicilio && (
                      <HomeServiceBadge />
                    )}
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 shrink-0 ${
                      isSelected ? 'text-[#1A5FD6]' : 'text-[#5B6472]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: DIA E HORA */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0D0F14] mb-1">
              Escolha o dia e horário
            </h2>
            <p className="text-xs text-[#5B6472]">
              Para o atendimento de: <strong className="text-[#0D0F14]">{produto?.nome}</strong>
            </p>
          </div>

          <DateTimePicker
            selectedDate={dataAgendada}
            selectedTime={hora}
            onSelect={(d, t) => {
              setDataAgendada(d);
              setHora(t);
            }}
          />
        </div>
      )}

      {/* STEP 3: LOCAL */}
      {step === 3 && (
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-[#0D0F14] mb-1">
              Onde prefere o atendimento?
            </h2>
            <p className="text-xs text-[#5B6472]">
              Atendemos no nosso escritório ou diretamente na sua residência.
            </p>
          </div>

          {/* 2 Big Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLocalTipo('PRESENCIAL')}
              className={`p-4 rounded-[18px] flex flex-col items-center text-center transition-all cursor-pointer border ${
                localTipo === 'PRESENCIAL'
                  ? 'bg-[#E8F0FD] border-[#1A5FD6] text-[#1A5FD6] shadow-sm font-semibold'
                  : 'bg-[#FDFDFE] border-transparent card-shadow text-[#0D0F14] hover:bg-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-2.5 ${
                  localTipo === 'PRESENCIAL' ? 'bg-[#1A5FD6] text-white' : 'bg-[#E8F0FD] text-[#1A5FD6]'
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold mb-0.5">Na empresa</span>
              <span className="text-[11px] text-[#5B6472]">No nosso escritório</span>
            </button>

            <button
              type="button"
              disabled={!canAttendAtHome}
              onClick={() => canAttendAtHome && setLocalTipo('DOMICILIO')}
              className={`p-4 rounded-[18px] flex flex-col items-center text-center transition-all border ${
                !canAttendAtHome
                  ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                  : localTipo === 'DOMICILIO'
                  ? 'bg-[#E8F0FD] border-[#1A5FD6] text-[#1A5FD6] shadow-sm font-semibold cursor-pointer'
                  : 'bg-[#FDFDFE] border-transparent card-shadow text-[#0D0F14] hover:bg-white cursor-pointer'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-2.5 ${
                  !canAttendAtHome
                    ? 'bg-gray-200 text-gray-400'
                    : localTipo === 'DOMICILIO'
                    ? 'bg-[#1A5FD6] text-white'
                    : 'bg-[#E8F0FD] text-[#1A5FD6]'
                }`}
              >
                <HomeIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold mb-0.5">Em casa</span>
              <span className="text-[11px] text-[#5B6472]">
                {canAttendAtHome ? 'Vamos até você' : 'Indisponível neste produto'}
              </span>
            </button>
          </div>

          {/* Details based on selection */}
          {localTipo === 'PRESENCIAL' ? (
            <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1">
                    Endereço da Empresa
                  </h4>
                  <p className="text-sm text-[#0D0F14] font-medium leading-relaxed">
                    {empresa.endereco}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E3E6EC] text-xs text-[#5B6472] flex items-center gap-2">
                <span>Telefone:</span>
                <strong className="text-[#0D0F14]">{empresa.telefone}</strong>
              </div>
            </div>
          ) : (
            <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-3.5">
              <h4 className="text-xs font-bold text-[#5B6472] uppercase tracking-wider">
                Endereço da sua residência
              </h4>

              {/* CEP */}
              <div>
                <label className="block text-xs font-semibold text-[#0D0F14] mb-1">CEP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  className={`w-full h-12 px-3.5 rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                    addressErrors.cep ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                  }`}
                />
                {addressErrors.cep && (
                  <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.cep}</p>
                )}
              </div>

              {/* Rua & Número */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#0D0F14] mb-1">Rua</label>
                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Nome da rua ou avenida"
                    className={`w-full h-12 px-3.5 rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                      addressErrors.logradouro ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                    }`}
                  />
                  {addressErrors.logradouro && (
                    <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.logradouro}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D0F14] mb-1">Número</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Nº"
                    className={`w-full h-12 px-3.5 rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                      addressErrors.numero ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                    }`}
                  />
                  {addressErrors.numero && (
                    <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.numero}</p>
                  )}
                </div>
              </div>

              {/* Complemento */}
              <div>
                <label className="block text-xs font-semibold text-[#0D0F14] mb-1">
                  Complemento <span className="text-[#5B6472] font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Ex.: Apto 12, Bloco B"
                  className="w-full h-12 px-3.5 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                />
              </div>

              {/* Bairro, Cidade, UF */}
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#0D0F14] mb-1">Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Bairro"
                    className={`w-full h-12 px-3 rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                      addressErrors.bairro ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                    }`}
                  />
                  {addressErrors.bairro && (
                    <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.bairro}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#0D0F14] mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Cidade"
                    className={`w-full h-12 px-3 rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                      addressErrors.cidade ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                    }`}
                  />
                  {addressErrors.cidade && (
                    <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.cidade}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-[#0D0F14] mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    placeholder="UF"
                    className={`w-full h-12 px-2 text-center uppercase rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                      addressErrors.uf ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                    }`}
                  />
                  {addressErrors.uf && (
                    <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.uf}</p>
                  )}
                </div>
              </div>

              {/* Ponto de Referência */}
              <div>
                <label className="block text-xs font-semibold text-[#0D0F14] mb-1">
                  Ponto de referência
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ex.: portão azul, perto da padaria"
                  className={`w-full h-12 px-3.5 rounded-[12px] bg-white border text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] ${
                    addressErrors.referencia ? 'border-[#C62F2A]' : 'border-[#E3E6EC]'
                  }`}
                />
                {addressErrors.referencia && (
                  <p className="text-xs text-[#C62F2A] mt-1">{addressErrors.referencia}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: DOCUMENTOS */}
      {step === 4 && (
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0D0F14] mb-1">
              Fotos dos documentos <span className="text-xs font-normal text-[#5B6472]">(opcional)</span>
            </h2>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              Fotos dos seus documentos adiantam o atendimento. Fotografe com boa luz e sem cortar as bordas. Se preferir, pule este passo.
            </p>
          </div>

          {/* Card: Para {produto} */}
          {produto && (
            <div className="bg-[#E8F0FD] rounded-[18px] p-4 border border-[#C3D8F7]">
              <h4 className="text-xs font-bold text-[#1A5FD6] uppercase tracking-wider mb-2">
                Documentos recomendados para {produto.nome}:
              </h4>
              <ul className="flex flex-col gap-1.5">
                {produto.documentos
                  .split('|')
                  .map((d) => d.trim())
                  .filter(Boolean)
                  .map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-[#0D0F14]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F7A52] shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Photo Upload Trigger Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              disabled={isProcessingPhotos || photos.length >= 6}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 rounded-[14px] bg-[#FDFDFE] border-2 border-dashed border-[#1A5FD6]/40 text-[#1A5FD6] font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-[#E8F0FD]/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessingPhotos ? (
                <span>Comprimindo fotos...</span>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>
                    {photos.length === 0
                      ? 'Tirar foto ou escolher da galeria'
                      : `Adicionar mais fotos (${photos.length}/6)`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Photo Thumbnails in 3 columns */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-[14px] overflow-hidden bg-gray-100 border border-[#E3E6EC] group shadow-xs"
                >
                  <img
                    src={item.dataUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(item.id)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    aria-label="Remover foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: REVISAR */}
      {step === 5 && (
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0D0F14] mb-1">
              Revise o seu agendamento
            </h2>
            <p className="text-xs text-[#5B6472]">
              Confira todos os detalhes antes de enviar para a nossa equipe.
            </p>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-[12px] bg-[#FDF0EF] border border-[#F6C3C0] text-[#C62F2A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-[#FDFDFE] rounded-[18px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-4">
            {/* Produto */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#E3E6EC]">
              <div className="w-10 h-10 rounded-[12px] bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center shrink-0">
                <ProductIcon name={produto?.icone || ''} className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
                  Produto
                </span>
                <h4 className="text-sm font-semibold text-[#0D0F14]">{produto?.nome}</h4>
              </div>
            </div>

            {/* Dia e Hora */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#E3E6EC]">
              <Calendar className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
                  Dia e Horário
                </span>
                <p className="text-sm font-semibold text-[#0D0F14]">
                  {dataAgendada ? formatDataExtenso(dataAgendada) : ''} às {hora}
                </p>
              </div>
            </div>

            {/* Local */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#E3E6EC]">
              {localTipo === 'DOMICILIO' ? (
                <HomeIcon className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
              ) : (
                <Building2 className="w-5 h-5 text-[#1A5FD6] shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
                  Local
                </span>
                <p className="text-sm font-semibold text-[#0D0F14] mb-1">
                  {localTipo === 'DOMICILIO' ? 'Em casa' : 'Na empresa'}
                </p>

                {localTipo === 'DOMICILIO' ? (
                  <div className="text-xs text-[#5B6472] leading-relaxed">
                    <p>
                      {logradouro}, {numero} {complemento && `(${complemento})`}
                    </p>
                    <p>
                      {bairro} · {cidade} - {uf} · CEP {cep}
                    </p>
                    <p className="mt-1 font-medium text-[#0D0F14]">
                      Ref.: {referencia}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#5B6472]">{empresa.endereco}</p>
                )}
              </div>
            </div>

            {/* Documentos */}
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-[#1A5FD6] shrink-0" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6472]">
                  Fotos anexadas
                </span>
                <p className="text-sm font-medium text-[#0D0F14]">
                  {photos.length === 0
                    ? 'Nenhuma'
                    : `${photos.length} anexada(s)`}
                </p>
              </div>
            </div>
          </div>

          {/* Optional Message Field */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0F14] mb-1.5">
              Quer avisar algo ao consultor?{' '}
              <span className="text-[#5B6472] font-normal">(opcional)</span>
            </label>
            <textarea
              maxLength={400}
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: Melhor horário para contato, observações sobre o benefício..."
              className="w-full p-3.5 rounded-[14px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] placeholder-[#5B6472]/50 focus:outline-none focus:border-[#1A5FD6] resize-none"
            />
            <div className="text-right text-[11px] text-[#5B6472] mt-1">
              {observacao.length}/400
            </div>
          </div>
        </div>
      )}

      {/* Fixed Footer with 1:2 Button Proportions */}
      <div className="pt-6 sticky bottom-20 z-20 pb-2">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 h-14 rounded-[14px] bg-white border border-[#E3E6EC] text-[#0D0F14] font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              Voltar
            </button>
          )}

          <div className={step === 1 ? 'w-full' : 'flex-[2]'}>
            {step === 1 && (
              <button
                type="button"
                onClick={handleStep1Continue}
                className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleStep2Continue}
                className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleStep3Continue}
                className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={() => goToStep(5)}
                className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>{photos.length === 0 ? 'Pular' : 'Continuar'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitOrder}
                className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Enviando...' : 'Enviar pedido'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
