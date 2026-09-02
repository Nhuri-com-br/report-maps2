/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutPanelLeft, Map as MapIcon, MessageSquare, Info, Plus, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onReportClick: () => void;
  isGovMode?: boolean;
}

export function MobileNav({ currentTab, setTab, onReportClick, isGovMode }: MobileNavProps) {
  const tabs = [
    { id: 'dashboard', icon: LayoutPanelLeft, label: 'Início' },
    { id: 'gov_panel', icon: Building2, label: 'Prefeitura', isGov: true },
    { id: 'report', icon: Plus, label: 'Relatar', highlight: true },
    { id: 'map', icon: MapIcon, label: 'Mapa' },
    { id: 'forum', icon: MessageSquare, label: 'Fórum' },
    { id: 'about', icon: Info, label: 'TCC' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around z-50 h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => tab.id === 'report' ? onReportClick() : setTab(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative",
            tab.highlight 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -mt-6 w-12 h-12 rounded-2xl active:scale-90" 
              : currentTab === tab.id 
                ? (tab.isGov ? "text-amber-600 font-black" : "text-blue-600 font-bold") 
                : "text-slate-400 hover:text-slate-600"
          )}
        >
          <tab.icon size={tab.highlight ? 22 : 18} />
          {!tab.highlight && <span className="text-[9px] font-bold mt-0.5 tracking-tight">{tab.label}</span>}
        </button>
      ))}
    </nav>
  );
}

