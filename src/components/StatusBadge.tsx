import React from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; textClass: string; bgClass: string; borderClass: string; helpText: string }
> = {
  PENDENTE: {
    label: 'Aguardando análise',
    textClass: 'text-[#9A6A0F]',
    bgClass: 'bg-[#FDF6E7]',
    borderClass: 'border-[#F0DBA6]',
    helpText: 'Recebemos seu pedido. Um consultor vai analisar em breve.',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    textClass: 'text-[#0F7A52]',
    bgClass: 'bg-[#E9F7F1]',
    borderClass: 'border-[#A9DFC7]',
    helpText: 'Tudo certo. Seu atendimento está confirmado.',
  },
  SUGERIDO: {
    label: 'Novo horário sugerido',
    textClass: 'text-[#1F66C4]',
    bgClass: 'bg-[#EEF4FD]',
    borderClass: 'border-[#C3D8F7]',
    helpText: 'O consultor sugeriu outro horário. Veja e responda abaixo.',
  },
  RECUSADO: {
    label: 'Recusado',
    textClass: 'text-[#C62F2A]',
    bgClass: 'bg-[#FDF0EF]',
    borderClass: 'border-[#F6C3C0]',
    helpText: 'Não foi possível atender este pedido. Você pode fazer um novo.',
  },
  CANCELADO: {
    label: 'Cancelado',
    textClass: 'text-[#5B6472]',
    bgClass: 'bg-[#F3F6FC]',
    borderClass: 'border-[#E3E6EC]',
    helpText: 'Este pedido foi cancelado.',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDENTE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-[9px] border text-xs font-semibold ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      {config.label}
    </span>
  );
};
