import React from 'react';
import { Home } from 'lucide-react';

export const HomeServiceBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[9px] bg-[#E8F0FD] text-[#1A5FD6] text-xs font-semibold tracking-wide ${className}`}
    >
      <Home className="w-3.5 h-3.5 shrink-0" />
      <span>Atende em casa</span>
    </span>
  );
};
