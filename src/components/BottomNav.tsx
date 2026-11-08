import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarPlus, ClipboardList, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const { isConsultor, cliente } = useAuth();
  const location = useLocation();

  // Se o cliente ainda não tem cadastro, a barra não aparece
  if (!cliente) {
    return null;
  }

  const navItems = [
    { to: '/', label: 'Início', icon: Home, exact: true },
    { to: '/agendar', label: 'Agendar', icon: CalendarPlus, exact: false },
    { to: '/pedidos', label: 'Pedidos', icon: ClipboardList, exact: false },
    { to: '/perfil', label: 'Perfil', icon: User, exact: true },
  ];

  if (isConsultor) {
    navItems.push({ to: '/consultor', label: 'Consultor', icon: Shield, exact: false });
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-white border-t border-[#E3E6EC] h-16 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="w-full h-full px-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-12 rounded-[12px] transition-all px-1 min-w-[56px] ${
                isActive
                  ? 'bg-[#E8F0FD] text-[#1A5FD6] font-semibold'
                  : 'text-[#5B6472] hover:text-[#0D0F14] hover:bg-black/[0.02]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
