import { HorarioAtendimento } from '../types';

export const DIAS_DA_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const DIAS_DA_SEMANA_CURTO = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'];

export const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export const MESES_CURTO = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];

/**
 * Format "YYYY-MM-DD" into Date object at midnight local
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format Date to "YYYY-MM-DD"
 */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format to "Segunda-feira, 10 de novembro"
 */
export function formatDataExtenso(dateStr: string): string {
  const d = parseDateString(dateStr);
  const diaSemana = DIAS_DA_SEMANA[d.getDay()];
  const dia = d.getDate();
  const mes = MESES[d.getMonth()];
  return `${diaSemana}, ${dia} de ${mes}`;
}

/**
 * Format to "Seg., 10 nov. · 14:00"
 */
export function formatDataHoraCurto(dateStr: string, hora: string): string {
  const d = parseDateString(dateStr);
  const diaSemanaCurto = DIAS_DA_SEMANA_CURTO[d.getDay()];
  const dia = d.getDate();
  const mesCurto = MESES_CURTO[d.getMonth()];
  return `${diaSemanaCurto}, ${dia} ${mesCurto} · ${hora}`;
}

/**
 * Format to "Segunda-feira, 10 de novembro às 14:00"
 */
export function formatDataHoraCompleto(dateStr: string, hora: string): string {
  return `${formatDataExtenso(dateStr)} às ${hora}`;
}

/**
 * Convert "HH:MM" to minutes from 00:00
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes to "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface DaySlotInfo {
  dateStr: string;
  weekdayShort: string;
  dayNumber: number;
  monthShort: string;
  weekdayFull: string;
  availableTimes: string[];
}

/**
 * Generate available days and times for next 28 days
 */
export function generateAvailableSchedule(
  horarios: HorarioAtendimento[],
  duracaoMinConfig: number,
  antecedenciaHoras: number,
  now: Date = new Date()
): DaySlotInfo[] {
  const duracao = duracaoMinConfig >= 5 ? duracaoMinConfig : 30;
  const minTimeCutoff = new Date(now.getTime() + antecedenciaHoras * 60 * 60 * 1000);

  const result: DaySlotInfo[] = [];

  for (let i = 0; i <= 28; i++) {
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dayOfWeek = currentDay.getDay(); // 0-6
    const horario = horarios.find((h) => h.dia_semana === dayOfWeek);

    if (!horario || !horario.ativo) {
      continue;
    }

    const dateStr = toDateString(currentDay);
    const startMin = timeToMinutes(horario.inicio);
    const endMin = timeToMinutes(horario.fim);

    let pauseStartMin: number | null = null;
    let pauseEndMin: number | null = null;
    if (horario.pausa_inicio && horario.pausa_fim) {
      pauseStartMin = timeToMinutes(horario.pausa_inicio);
      pauseEndMin = timeToMinutes(horario.pausa_fim);
    }

    const availableTimes: string[] = [];

    for (let m = startMin; m + duracao <= endMin; m += duracao) {
      const slotEndMin = m + duracao;

      // Check pause overlap: slot overlaps pause if max(start, pStart) < min(end, pEnd)
      if (pauseStartMin !== null && pauseEndMin !== null) {
        const overlap = Math.max(m, pauseStartMin) < Math.min(slotEndMin, pauseEndMin);
        if (overlap) {
          continue;
        }
      }

      // Check minimum lead time
      const slotDateTime = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate(),
        Math.floor(m / 60),
        m % 60
      );

      if (slotDateTime.getTime() < minTimeCutoff.getTime()) {
        continue;
      }

      availableTimes.push(minutesToTime(m));
    }

    if (availableTimes.length > 0) {
      result.push({
        dateStr,
        weekdayShort: DIAS_DA_SEMANA_CURTO[dayOfWeek],
        dayNumber: currentDay.getDate(),
        monthShort: MESES_CURTO[currentDay.getMonth()],
        weekdayFull: DIAS_DA_SEMANA[dayOfWeek],
        availableTimes,
      });
    }
  }

  return result;
}
