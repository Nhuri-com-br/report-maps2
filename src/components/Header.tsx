/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, LogOut, User, Building2, UserCheck, Sparkles, Map as MapIcon } from 'lucide-react';
import { APP_NAME } from '../constants';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { cn } from '../lib/utils';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: any) => void;
  onReportClick: () => void;
  isGovMode: boolean;
  setIsGovMode: (val: boolean) => void;
}

export function Header({ 
  currentTab, 
  setTab, 
  onReportClick,
  isGovMode,
  setIsGovMode
}: HeaderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-white shadow-xl">
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        <div 
          onClick={() => setTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            RM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black leading-none tracking-tight">{APP_NAME}</h1>
              <span className="text-[9px] font-mono px-1 rounded bg-blue-500/20 text-blue-300 font-bold">v2.0</span>
            </div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5 hidden sm:block">
              Zeladoria Urbana &bull; Smart Cities
            </p>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-5 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setTab('dashboard')} 
            className={cn("pb-1 transition-all", currentTab === 'dashboard' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}
          >
            Painel Cidadão
          </button>
          <button 
            onClick={() => {
              setIsGovMode(true);
              setTab('gov_panel');
            }} 
            className={cn("pb-1 transition-all flex items-center gap-1", currentTab === 'gov_panel' ? "text-amber-400 border-b-2 border-amber-400 font-black" : "text-amber-200/80 hover:text-amber-300")}
          >
            <Building2 size={13} />
            Central da Prefeitura
          </button>
          <button 
            onClick={() => setTab('map')} 
            className={cn("pb-1 transition-all", currentTab === 'map' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}
          >
            Mapa Interativo
          </button>
          <button 
            onClick={() => setTab('forum')} 
            className={cn("pb-1 transition-all", currentTab === 'forum' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}
          >
            Fórum
          </button>
          <button 
            onClick={() => setTab('about')} 
            className={cn("pb-1 transition-all", currentTab === 'about' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white")}
          >
            Sobre o TCC
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Alternador de Modo Gestor / Cidadão */}
        <button
          onClick={() => {
            const next = !isGovMode;
            setIsGovMode(next);
            if (next) setTab('gov_panel');
          }}
          className={cn(
            "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm",
            isGovMode 
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30" 
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
          )}
          title="Alternar entre visão do Cidadão e visão Administrativa da Prefeitura"
        >
          {isGovMode ? <Building2 size={14} className="text-amber-400" /> : <UserCheck size={14} />}
          <span>{isGovMode ? '🏛️ Modo Gestor Público' : '👤 Modo Cidadão'}</span>
        </button>

        {/* Botão Reportar */}
        <button 
          onClick={onReportClick}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95 uppercase tracking-wider"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Reportar</span>
        </button>
        
        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block mx-1" />
        
        {/* Usuário / Login */}
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold leading-none">{user.displayName?.split(' ')[0]}</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                {isGovMode ? 'Gestor Público' : 'Cidadão'}
              </p>
            </div>
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
              alt={user.displayName || ''} 
              className="w-8 h-8 rounded-full border border-slate-700 ring-2 ring-slate-800 object-cover"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
              title="Sair da Conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => loginWithGoogle()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 text-xs font-bold"
          >
            <User size={14} />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}

