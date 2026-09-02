/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  LucideIcon,
  LayoutPanelLeft, 
  Map as MapIcon, 
  Building2,
  MessageSquare, 
  Info, 
  Menu, 
  Flame, 
  Droplets, 
  AlertTriangle, 
  Zap, 
  Trash2,
  Lightbulb,
  Waves,
  Signpost,
  Plus,
  ShieldCheck
} from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  variant?: 'default' | 'danger' | 'info' | 'success' | 'warning' | 'purple' | 'amber';
  badge?: string;
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  collapsed, 
  variant = 'default',
  badge 
}: SidebarItemProps) {
  const variantClasses = {
    default: active ? "bg-slate-900 text-white shadow-md shadow-slate-300" : "text-slate-600 hover:bg-slate-100",
    danger: active ? "bg-red-600 text-white shadow-md shadow-red-200" : "text-slate-600 hover:bg-red-50 hover:text-red-700",
    info: active ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
    success: active ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
    warning: active ? "bg-amber-500 text-white shadow-md shadow-amber-200" : "text-slate-600 hover:bg-amber-50 hover:text-amber-700",
    purple: active ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-slate-600 hover:bg-purple-50 hover:text-purple-700",
    amber: active ? "bg-amber-600 text-white shadow-md shadow-amber-200" : "text-slate-600 hover:bg-amber-50 hover:text-amber-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full p-2.5 rounded-xl transition-all duration-200 group relative font-medium text-xs",
        variantClasses[variant]
      )}
    >
      <div className="flex items-center gap-3 truncate">
        <Icon size={17} className={cn(!active && "group-hover:scale-110 transition-transform shrink-0")} />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      
      {!collapsed && badge && (
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        )}>
          {badge}
        </span>
      )}

      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </button>
  );
}

export function Sidebar({ 
  currentTab, 
  setTab,
  onOpenReportModal 
}: { 
  currentTab: string; 
  setTab: (tab: any) => void;
  onOpenReportModal?: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 76 : 260 }}
      className="h-screen bg-white border-r border-slate-200 flex flex-col z-40 sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] select-none"
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/30">
              RM
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Navegação</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 mx-auto"
          title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          <Menu size={16} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto font-sans">
        <SidebarItem 
          icon={LayoutPanelLeft} 
          label="Visão Cidadão" 
          active={currentTab === 'dashboard'} 
          onClick={() => setTab('dashboard')} 
          collapsed={isCollapsed}
        />

        <SidebarItem 
          icon={Building2} 
          label="Central da Prefeitura" 
          variant="amber"
          badge="Gov"
          active={currentTab === 'gov_panel'} 
          onClick={() => setTab('gov_panel')} 
          collapsed={isCollapsed}
        />

        <SidebarItem 
          icon={MapIcon} 
          label="Mapa Completo" 
          variant="info"
          active={currentTab === 'map'} 
          onClick={() => setTab('map')} 
          collapsed={isCollapsed}
        />

        <div className="h-px bg-slate-100 my-2 mx-1" />

        {!isCollapsed && (
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1">
            Filtros por Tipo
          </h3>
        )}

        <SidebarItem 
          icon={AlertTriangle} 
          label="Buracos & Vias" 
          active={currentTab === 'map_pothole'} 
          onClick={() => setTab('map_pothole')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Droplets} 
          label="Alagamentos" 
          variant="info"
          active={currentTab === 'map_flood'} 
          onClick={() => setTab('map_flood')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Lightbulb} 
          label="Iluminação Pública" 
          variant="warning"
          active={currentTab === 'map_light'} 
          onClick={() => setTab('map_light')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Trash2} 
          label="Lixo & Entulho" 
          variant="success"
          active={currentTab === 'map_garbage'} 
          onClick={() => setTab('map_garbage')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Waves} 
          label="Saneamento / Esgoto" 
          variant="info"
          active={currentTab === 'map_sanitation'} 
          onClick={() => setTab('map_sanitation')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Signpost} 
          label="Trânsito & Sinalização" 
          variant="danger"
          active={currentTab === 'map_traffic'} 
          onClick={() => setTab('map_traffic')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Flame} 
          label="Queimadas / Fogo" 
          variant="danger"
          active={currentTab === 'map_fire'} 
          onClick={() => setTab('map_fire')} 
          collapsed={isCollapsed}
        />

        <div className="h-px bg-slate-100 my-2 mx-1" />

        <SidebarItem 
          icon={MessageSquare} 
          label="Fórum & Debates" 
          active={currentTab === 'forum'} 
          onClick={() => setTab('forum')} 
          collapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Info} 
          label="Sobre o TCC & ODS" 
          active={currentTab === 'about'} 
          onClick={() => setTab('about')} 
          collapsed={isCollapsed}
        />
      </nav>

      <div className="p-3 mt-auto border-t border-slate-100">
        {!isCollapsed ? (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <h4 className="font-bold text-xs mb-0.5">Novo Registro Urbano</h4>
            <p className="text-[10px] text-blue-100 mb-3 leading-snug">Viu um problema na sua rua? Comunique a prefeitura.</p>
            <button 
              onClick={() => onOpenReportModal ? onOpenReportModal() : setTab('map')}
              className="w-full bg-white text-blue-700 font-bold py-2 rounded-xl text-[11px] shadow-sm hover:shadow-md transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              <span>Reportar Agora</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onOpenReportModal ? onOpenReportModal() : setTab('map')}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md mx-auto hover:bg-blue-700 transition-colors"
            title="Novo Relato"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
    </motion.aside>
  );
}

