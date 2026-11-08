import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { DatabaseStore } from '../db/store';
import { DaySlotInfo, generateAvailableSchedule, formatDataExtenso } from '../utils/date';
import { Empresa, HorarioAtendimento, OcupadoSlot } from '../types';

interface DateTimePickerProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:MM
  onSelect: (date: string, time: string) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onSelect,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [days, setDays] = useState<DaySlotInfo[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [ocupados, setOcupados] = useState<OcupadoSlot[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [emp, hor, _] = await Promise.all([
        DatabaseStore.empresa_obter(),
        DatabaseStore.horarios_listar(),
        Promise.resolve(),
      ]);

      setEmpresa(emp);

      // Generate schedule
      const generated = generateAvailableSchedule(
        hor,
        emp.duracao_min,
        emp.antecedencia_horas,
        new Date()
      );
      setDays(generated);

      if (generated.length > 0) {
        const firstDay = generated[0].dateStr;
        const lastDay = generated[generated.length - 1].dateStr;
        const oc = await DatabaseStore.ocupados_listar(firstDay, lastDay);
        setOcupados(oc);

        // If currently selected date is not in days, select the first available day
        if (!selectedDate || !generated.some((d) => d.dateStr === selectedDate)) {
          const firstValidDay = generated[0];
          onSelect(firstValidDay.dateStr, '');
        }
      }
    } catch (err: any) {
      console.error('Error loading schedule:', err);
      setErrorMsg('Não foi possível carregar os horários de atendimento.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, onSelect]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <RefreshCw className="w-8 h-8 text-[#1A5FD6] animate-spin mb-3" />
        <p className="text-sm font-medium text-[#5B6472]">Buscando horários...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 rounded-[12px] bg-[#FDF0EF] border border-[#F6C3C0] text-center my-4">
        <AlertCircle className="w-6 h-6 text-[#C62F2A] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#C62F2A] mb-3">{errorMsg}</p>
        <button
          type="button"
          onClick={loadData}
          className="h-10 px-4 rounded-[9px] bg-[#C62F2A] text-white text-xs font-semibold hover:bg-[#b02824] transition-colors"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="p-6 rounded-[18px] bg-white card-shadow text-center my-4">
        <Calendar className="w-10 h-10 text-[#5B6472] mx-auto mb-3" />
        <h4 className="text-base font-semibold text-[#0D0F14] mb-1">Sem horários</h4>
        <p className="text-sm text-[#5B6472]">
          Não há horários disponíveis nos próximos dias. Fale com a nossa equipe.
        </p>
      </div>
    );
  }

  // Active day object
  const activeDay = days.find((d) => d.dateStr === selectedDate) || days[0];
  const maxVagas = empresa ? empresa.vagas_por_horario : 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Horizontal Day Cards Strip (80x96 px) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6472] mb-2.5">
          1. Escolha o dia
        </label>
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth w-full">
          {days.map((day) => {
            const isSelected = day.dateStr === activeDay.dateStr;
            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => {
                  onSelect(day.dateStr, '');
                }}
                className={`w-20 h-24 shrink-0 rounded-[12px] flex flex-col items-center justify-center p-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A5FD6] text-white shadow-md scale-102 font-semibold'
                    : 'bg-[#FDFDFE] text-[#0D0F14] card-shadow hover:bg-[#E8F0FD]/60'
                }`}
              >
                <span
                  className={`text-[11px] font-medium uppercase tracking-wider ${
                    isSelected ? 'text-white/85' : 'text-[#5B6472]'
                  }`}
                >
                  {day.weekdayShort}
                </span>
                <span className="text-2xl font-bold my-0.5">{day.dayNumber}</span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-white/85' : 'text-[#5B6472]'
                  }`}
                >
                  {day.monthShort}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots in 3 columns */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6472]">
            2. Escolha o horário
          </label>
          <span className="text-xs text-[#5B6472]">
            {formatDataExtenso(activeDay.dateStr)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {activeDay.availableTimes.map((time) => {
            const isSelected = selectedDate === activeDay.dateStr && selectedTime === time;

            // Check occupied count
            const ocupadoItem = ocupados.find(
              (o) => o.data_agendada === activeDay.dateStr && o.hora === time
            );
            const count = ocupadoItem ? ocupadoItem.count : 0;
            const isFull = count >= maxVagas;

            return (
              <button
                key={time}
                type="button"
                disabled={isFull}
                onClick={() => onSelect(activeDay.dateStr, time)}
                className={`h-12 rounded-[12px] font-semibold text-sm transition-all flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A5FD6] text-white shadow-md'
                    : isFull
                    ? 'bg-[#F3F6FC] text-[#5B6472]/40 line-through cursor-not-allowed border border-dashed border-[#E3E6EC]'
                    : 'bg-[#FDFDFE] text-[#0D0F14] card-shadow hover:bg-[#E8F0FD] hover:text-[#1A5FD6]'
                }`}
              >
                <span>{time}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
