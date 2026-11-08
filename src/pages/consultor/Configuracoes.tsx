import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Users,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Home,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { DatabaseStore } from '../../db/store';
import { AdminUserItem, Empresa, HorarioAtendimento } from '../../types';
import { DIAS_DA_SEMANA } from '../../utils/date';
import { isValidEmail } from '../../utils/validation';

type SettingsTab = 'horarios' | 'empresa' | 'equipe';

export const Configuracoes: React.FC = () => {
  const { session, isConsultor, empresa, updateEmpresaLocally } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>('horarios');
  const [loading, setLoading] = useState<boolean>(true);

  // Tab: Horários
  const [horarios, setHorarios] = useState<HorarioAtendimento[]>([]);
  const [horariosSaving, setHorariosSaving] = useState<boolean>(false);
  const [horarioError, setHorarioError] = useState<string | null>(null);

  // Tab: Empresa
  const [empresaForm, setEmpresaForm] = useState<Empresa>(empresa);
  const [empresaSaving, setEmpresaSaving] = useState<boolean>(false);

  // Tab: Equipe
  const [adminsList, setAdminsList] = useState<AdminUserItem[]>([]);
  const [newConsultorEmail, setNewConsultorEmail] = useState<string>('');
  const [equipeSaving, setEquipeSaving] = useState<boolean>(false);
  const [equipeError, setEquipeError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!session || !isConsultor) return;
    try {
      setLoading(true);
      const [horList, empData, admList] = await Promise.all([
        DatabaseStore.horarios_listar(),
        DatabaseStore.empresa_obter(),
        DatabaseStore.admin_admins_listar(session.usuario_id),
      ]);
      setHorarios(horList);
      setEmpresaForm(empData);
      setAdminsList(admList);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      toastError('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  }, [session, isConsultor, toastError]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Horários handlers
  const handleToggleDia = (diaIndex: number) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia_semana === diaIndex ? { ...h, ativo: !h.ativo } : h))
    );
  };

  const handleHorarioChange = (
    diaIndex: number,
    field: 'inicio' | 'fim' | 'pausa_inicio' | 'pausa_fim',
    value: string
  ) => {
    setHorarios((prev) =>
      prev.map((h) =>
        h.dia_semana === diaIndex
          ? { ...h, [field]: value.trim() ? value : null }
          : h
      )
    );
  };

  const handleSaveHorarios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setHorarioError(null);

    // Validação: em dia ativo, o início deve ser antes do fim
    for (const h of horarios) {
      if (h.ativo) {
        if (!h.inicio || !h.fim || h.inicio >= h.fim) {
          const diaNome = DIAS_DA_SEMANA[h.dia_semana];
          setHorarioError(`${diaNome}: a hora de início deve ser antes do fim.`);
          return;
        }
      }
    }

    try {
      setHorariosSaving(true);
      await DatabaseStore.admin_horarios_salvar(session.usuario_id, horarios);
      success('Horários salvos.');
    } catch (err: any) {
      toastError(err?.message || 'Erro ao salvar horários.');
    } finally {
      setHorariosSaving(false);
    }
  };

  // Empresa handlers
  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      setEmpresaSaving(true);
      const saved = await DatabaseStore.admin_empresa_salvar(session.usuario_id, empresaForm);
      updateEmpresaLocally(saved);
      success('Dados da empresa salvos.');
    } catch (err: any) {
      toastError(err?.message || 'Erro ao salvar dados da empresa.');
    } finally {
      setEmpresaSaving(false);
    }
  };

  // Equipe handlers
  const handleAddConsultor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setEquipeError(null);

    if (!isValidEmail(newConsultorEmail)) {
      setEquipeError('Digite um e-mail válido.');
      return;
    }

    try {
      setEquipeSaving(true);
      await DatabaseStore.admin_admin_adicionar(session.usuario_id, newConsultorEmail);
      success('Acesso de consultor concedido.');
      setNewConsultorEmail('');
      const updated = await DatabaseStore.admin_admins_listar(session.usuario_id);
      setAdminsList(updated);
    } catch (err: any) {
      const msg = err?.message || 'Erro ao adicionar consultor.';
      setEquipeError(msg);
      toastError(msg);
    } finally {
      setEquipeSaving(false);
    }
  };

  const handleRemoveConsultor = async (targetUserId: string) => {
    if (!session) return;
    const backup = [...adminsList];
    setAdminsList((prev) => prev.filter((a) => a.usuario_id !== targetUserId));

    try {
      await DatabaseStore.admin_admin_remover(session.usuario_id, targetUserId);
      success('Acesso removido.');
    } catch (err: any) {
      setAdminsList(backup);
      toastError(err?.message || 'Não foi possível remover o consultor.');
    }
  };

  return (
    <div className="py-5 px-4 flex flex-col gap-5">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/consultor')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0D0F14] active:scale-95 transition-colors p-1 -ml-1 cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao painel</span>
        </button>
        <h2 className="text-2xl font-bold text-[#0D0F14] tracking-tight">
          Configurar atendimento
        </h2>
      </div>

      {/* Pill Tabs: Horários, Empresa, Equipe */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('horarios')}
          className={`flex-1 h-11 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'horarios'
              ? 'bg-[#1A5FD6] text-white shadow-sm'
              : 'bg-white text-[#5B6472] border border-[#E3E6EC] hover:text-[#0D0F14]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Horários</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('empresa')}
          className={`flex-1 h-11 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'empresa'
              ? 'bg-[#1A5FD6] text-white shadow-sm'
              : 'bg-white text-[#5B6472] border border-[#E3E6EC] hover:text-[#0D0F14]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Empresa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equipe')}
          className={`flex-1 h-11 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'equipe'
              ? 'bg-[#1A5FD6] text-white shadow-sm'
              : 'bg-white text-[#5B6472] border border-[#E3E6EC] hover:text-[#0D0F14]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Equipe</span>
        </button>
      </div>

      {/* TAB: HORÁRIOS */}
      {activeTab === 'horarios' && (
        <form onSubmit={handleSaveHorarios} className="flex flex-col gap-4">
          <p className="text-xs text-[#5B6472] leading-relaxed">
            Marque os dias em que você atende e defina o horário de cada um. A pausa é opcional.
          </p>

          {horarioError && (
            <div className="p-3 rounded-[12px] bg-[#FDF0EF] border border-[#F6C3C0] text-[#C62F2A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{horarioError}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {horarios.map((dia) => {
              const diaNome = DIAS_DA_SEMANA[dia.dia_semana];

              return (
                <div
                  key={dia.dia_semana}
                  className={`p-4 rounded-[18px] card-shadow border transition-all ${
                    dia.ativo
                      ? 'bg-[#FDFDFE] border-[#1A5FD6]/30'
                      : 'bg-gray-50/80 border-transparent opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dia.ativo}
                        onChange={() => handleToggleDia(dia.dia_semana)}
                        className="w-5 h-5 rounded border-[#E3E6EC] text-[#1A5FD6] focus:ring-[#1A5FD6] cursor-pointer"
                      />
                      <span className="font-bold text-sm text-[#0D0F14]">{diaNome}</span>
                    </label>
                    <span
                      className={`text-xs font-semibold ${
                        dia.ativo ? 'text-[#0F7A52]' : 'text-[#5B6472]'
                      }`}
                    >
                      {dia.ativo ? 'Ativo' : 'Não atende'}
                    </span>
                  </div>

                  {dia.ativo && (
                    <div className="grid grid-cols-2 gap-2.5 pt-3 mt-3 border-t border-[#E3E6EC]">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                          Início
                        </label>
                        <input
                          type="time"
                          value={dia.inicio}
                          onChange={(e) =>
                            handleHorarioChange(dia.dia_semana, 'inicio', e.target.value)
                          }
                          required
                          className="w-full h-11 px-2.5 rounded-[10px] bg-white border border-[#E3E6EC] text-xs text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                          Fim
                        </label>
                        <input
                          type="time"
                          value={dia.fim}
                          onChange={(e) =>
                            handleHorarioChange(dia.dia_semana, 'fim', e.target.value)
                          }
                          required
                          className="w-full h-11 px-2.5 rounded-[10px] bg-white border border-[#E3E6EC] text-xs text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                          Pausa de <span className="font-normal">(opcional)</span>
                        </label>
                        <input
                          type="time"
                          value={dia.pausa_inicio || ''}
                          onChange={(e) =>
                            handleHorarioChange(dia.dia_semana, 'pausa_inicio', e.target.value)
                          }
                          className="w-full h-11 px-2.5 rounded-[10px] bg-white border border-[#E3E6EC] text-xs text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                          Pausa até <span className="font-normal">(opcional)</span>
                        </label>
                        <input
                          type="time"
                          value={dia.pausa_fim || ''}
                          onChange={(e) =>
                            handleHorarioChange(dia.dia_semana, 'pausa_fim', e.target.value)
                          }
                          className="w-full h-11 px-2.5 rounded-[10px] bg-white border border-[#E3E6EC] text-xs text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 sticky bottom-20 z-10 pb-4">
            <button
              type="submit"
              disabled={horariosSaving}
              className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{horariosSaving ? 'Salvando...' : 'Salvar horários'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: EMPRESA */}
      {activeTab === 'empresa' && (
        <form onSubmit={handleSaveEmpresa} className="flex flex-col gap-4">
          <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-4">
            {/* Nome da empresa */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0F14] mb-1">
                Nome da empresa
              </label>
              <input
                type="text"
                value={empresaForm.nome}
                onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })}
                required
                className="w-full h-12 px-3.5 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0F14] mb-1">
                Telefone de contato
              </label>
              <input
                type="text"
                value={empresaForm.telefone}
                onChange={(e) => setEmpresaForm({ ...empresaForm, telefone: e.target.value })}
                className="w-full h-12 px-3.5 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
              />
            </div>

            {/* Endereço do escritório */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0F14] mb-1">
                Endereço do escritório
              </label>
              <input
                type="text"
                value={empresaForm.endereco}
                onChange={(e) => setEmpresaForm({ ...empresaForm, endereco: e.target.value })}
                className="w-full h-12 px-3.5 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
              />
            </div>

            {/* Mensagem de boas-vindas */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0F14] mb-1">
                Mensagem de boas-vindas (até 200 caracteres)
              </label>
              <textarea
                maxLength={200}
                rows={2}
                value={empresaForm.mensagem}
                onChange={(e) => setEmpresaForm({ ...empresaForm, mensagem: e.target.value })}
                className="w-full p-3 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6] resize-none"
              />
              <div className="text-right text-[11px] text-[#5B6472] mt-1">
                {empresaForm.mensagem.length}/200
              </div>
            </div>

            {/* 3 numeric fields side by side */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#E3E6EC]">
              <div>
                <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  min={5}
                  value={empresaForm.duracao_min}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, duracao_min: Number(e.target.value) })
                  }
                  required
                  className="w-full h-12 px-2.5 text-center rounded-[12px] bg-white border border-[#E3E6EC] text-sm font-semibold text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                  Vagas/horário
                </label>
                <input
                  type="number"
                  min={1}
                  value={empresaForm.vagas_por_horario}
                  onChange={(e) =>
                    setEmpresaForm({
                      ...empresaForm,
                      vagas_por_horario: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full h-12 px-2.5 text-center rounded-[12px] bg-white border border-[#E3E6EC] text-sm font-semibold text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5B6472] mb-1">
                  Antecedência (h)
                </label>
                <input
                  type="number"
                  min={0}
                  value={empresaForm.antecedencia_horas}
                  onChange={(e) =>
                    setEmpresaForm({
                      ...empresaForm,
                      antecedencia_horas: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full h-12 px-2.5 text-center rounded-[12px] bg-white border border-[#E3E6EC] text-sm font-semibold text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
                />
              </div>
            </div>

            {/* Checkbox Atendo na casa do cliente */}
            <div className="pt-2 border-t border-[#E3E6EC]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={empresaForm.atende_domicilio}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, atende_domicilio: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-[#E3E6EC] text-[#1A5FD6] focus:ring-[#1A5FD6] cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-[#0D0F14] block">
                    Atendo na casa do cliente
                  </span>
                  <span className="text-xs text-[#5B6472]">
                    Permite atendimento em domicílio para os produtos configurados
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 sticky bottom-20 z-10 pb-4">
            <button
              type="submit"
              disabled={empresaSaving}
              className="w-full h-14 rounded-[14px] bg-[#1A5FD6] hover:bg-[#1450B8] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{empresaSaving ? 'Salvando...' : 'Salvar dados'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB: EQUIPE */}
      {activeTab === 'equipe' && (
        <div className="flex flex-col gap-5">
          <p className="text-xs text-[#5B6472] leading-relaxed">
            Consultores veem os pedidos e configuram o atendimento. A pessoa precisa já ter entrado no aplicativo.
          </p>

          {/* Add Consultant Form */}
          <form
            onSubmit={handleAddConsultor}
            className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B6472]">
              Adicionar novo consultor
            </h4>

            {equipeError && (
              <div className="p-3 rounded-[12px] bg-[#FDF0EF] border border-[#F6C3C0] text-[#C62F2A] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{equipeError}</span>
              </div>
            )}

            <div>
              <input
                type="email"
                value={newConsultorEmail}
                onChange={(e) => {
                  setNewConsultorEmail(e.target.value);
                  if (equipeError) setEquipeError(null);
                }}
                placeholder="E-mail do novo consultor"
                required
                className="w-full h-12 px-3.5 rounded-[12px] bg-white border border-[#E3E6EC] text-sm text-[#0D0F14] focus:outline-none focus:border-[#1A5FD6]"
              />
            </div>

            <button
              type="submit"
              disabled={equipeSaving}
              className="w-full h-12 rounded-[12px] bg-[#1A5FD6] hover:bg-[#1450B8] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{equipeSaving ? 'Concedendo...' : 'Dar acesso de consultor'}</span>
            </button>
          </form>

          {/* Consultants List */}
          <div className="bg-[#FDFDFE] rounded-[20px] p-5 card-shadow border border-[#E3E6EC]/60 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B6472]">
              Consultores ativos ({adminsList.length})
            </h4>

            <div className="flex flex-col divide-y divide-[#E3E6EC]">
              {adminsList.map((item) => (
                <div
                  key={item.usuario_id}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0FD] text-[#1A5FD6] flex items-center justify-center shrink-0 text-xs font-bold">
                      {item.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-xs text-[#0D0F14] truncate">
                        {item.email}
                      </p>
                      {item.is_current && (
                        <span className="text-[11px] text-[#1A5FD6] font-medium">
                          (você)
                        </span>
                      )}
                    </div>
                  </div>

                  {!item.is_current && (
                    <button
                      type="button"
                      onClick={() => handleRemoveConsultor(item.usuario_id)}
                      className="p-2 rounded-[8px] text-[#C62F2A] hover:bg-[#FDF0EF] active:scale-95 transition-colors cursor-pointer"
                      title="Remover acesso"
                      aria-label="Remover consultor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
