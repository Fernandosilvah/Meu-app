import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_DATA_URI } from '../assets/logo';

export const Header: React.FC = () => {
  const { empresa, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-[#061A45] text-white h-14 border-b border-[#0D2A66]/50 select-none">
      <div className="w-full h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={LOGO_DATA_URI}
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm"
          />
          <h1 className="text-base font-semibold tracking-wide truncate max-w-[220px]">
            {empresa.nome || 'CREDMAISPLUS'}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="h-10 px-3.5 flex items-center gap-1.5 rounded-[9px] text-white/90 hover:text-white hover:bg-[#0D2A66] active:scale-95 transition-all text-xs font-semibold shrink-0"
          title="Encerrar sessão"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};
