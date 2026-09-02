/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AlertTriangle, 
  Info, 
  Zap, 
  Droplets, 
  Flame, 
  Trash2, 
  Lightbulb, 
  Waves, 
  Signpost, 
  Footprints,
  Building2,
  ShieldAlert,
  Car,
  Trees,
  CheckCircle2,
  Clock,
  AlertOctagon,
  XCircle,
  LucideIcon
} from 'lucide-react';
import { IssueType, MunicipalDepartment, IssuePriority, IssueStatus } from './types';

export interface IssueTypeConfig {
  type: IssueType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
  defaultDepartment: MunicipalDepartment;
}

export const ISSUE_TYPES: IssueTypeConfig[] = [
  { 
    type: 'pothole', 
    label: 'Buraco / Pavimentação', 
    description: 'Crateras, asfalto cedendo ou desníveis graves na via',
    color: '#D97706', 
    bgColor: '#FEF3C7',
    icon: AlertTriangle,
    defaultDepartment: 'obras'
  },
  { 
    type: 'flooding', 
    label: 'Alagamento / Drenagem', 
    description: 'Boca de lobo entupida, retenção de água da chuva ou inundação',
    color: '#2563EB', 
    bgColor: '#DBEAFE',
    icon: Droplets,
    defaultDepartment: 'defesa_civil'
  },
  { 
    type: 'light_failure', 
    label: 'Iluminação Pública', 
    description: 'Poste apagado à noite, luz piscando ou fiação solta',
    color: '#EAB308', 
    bgColor: '#FEF9C3',
    icon: Lightbulb,
    defaultDepartment: 'iluminacao'
  },
  { 
    type: 'garbage', 
    label: 'Lixo / Entulho', 
    description: 'Descarte irregular de entulho, lixo acumulado em calçadas ou terrenos',
    color: '#059669', 
    bgColor: '#D1FAE5',
    icon: Trash2,
    defaultDepartment: 'limpeza'
  },
  { 
    type: 'sanitation', 
    label: 'Esgoto / Vazamento', 
    description: 'Vazamento de água limpa na rua ou esgoto a céu aberto',
    color: '#0891B2', 
    bgColor: '#CFFAFE',
    icon: Waves,
    defaultDepartment: 'saneamento'
  },
  { 
    type: 'traffic_sign', 
    label: 'Semáforo / Sinalização', 
    description: 'Semáforo quebrado/intermitente, placa derrubada ou faixa apagada',
    color: '#EA580C', 
    bgColor: '#FFEDD5',
    icon: Signpost,
    defaultDepartment: 'transito'
  },
  { 
    type: 'accessibility', 
    label: 'Calçada / Acessibilidade', 
    description: 'Calçada intransitável, rampa de acessibilidade quebrada ou obstáculo',
    color: '#7C3AED', 
    bgColor: '#EDE9FE',
    icon: Footprints,
    defaultDepartment: 'obras'
  },
  { 
    type: 'fire', 
    label: 'Queimada / Foco de Incêndio', 
    description: 'Fogo em vegetação, terreno baldio ou fumaça densa',
    color: '#DC2626', 
    bgColor: '#FEE2E2',
    icon: Flame,
    defaultDepartment: 'defesa_civil'
  },
  { 
    type: 'power_outage', 
    label: 'Queda de Energia', 
    description: 'Interrupção generalizada no fornecimento elétrico do quarteirão',
    color: '#CA8A04', 
    bgColor: '#FEF08A',
    icon: Zap,
    defaultDepartment: 'iluminacao'
  },
  { 
    type: 'other', 
    label: 'Outras Ocorrências', 
    description: 'Outros tipos de problemas urbanos e solicitações de zeladoria',
    color: '#64748B', 
    bgColor: '#F1F5F9',
    icon: Info,
    defaultDepartment: 'geral'
  },
];

export interface DepartmentConfig {
  id: MunicipalDepartment;
  name: string;
  shortName: string;
  icon: LucideIcon;
  color: string;
  badgeClass: string;
}

export const DEPARTMENTS: Record<MunicipalDepartment, DepartmentConfig> = {
  obras: {
    id: 'obras',
    name: 'Secretaria de Obras e Infraestrutura',
    shortName: 'Obras',
    icon: Building2,
    color: '#D97706',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  iluminacao: {
    id: 'iluminacao',
    name: 'Departamento de Iluminação Pública',
    shortName: 'Iluminação',
    icon: Lightbulb,
    color: '#EAB308',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  limpeza: {
    id: 'limpeza',
    name: 'Secretaria de Limpeza e Serviços Urbanos',
    shortName: 'Limpeza Urbana',
    icon: Trash2,
    color: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  defesa_civil: {
    id: 'defesa_civil',
    name: 'Defesa Civil Municipal',
    shortName: 'Defesa Civil',
    icon: ShieldAlert,
    color: '#DC2626',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  transito: {
    id: 'transito',
    name: 'Secretaria de Mobilidade Urbana e Trânsito',
    shortName: 'Trânsito',
    icon: Car,
    color: '#EA580C',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  saneamento: {
    id: 'saneamento',
    name: 'Companhia de Água e Esgoto (Saneamento)',
    shortName: 'Saneamento',
    icon: Waves,
    color: '#0284C7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200'
  },
  meio_ambiente: {
    id: 'meio_ambiente',
    name: 'Secretaria do Meio Ambiente e Parques',
    shortName: 'Meio Ambiente',
    icon: Trees,
    color: '#16A34A',
    badgeClass: 'bg-green-100 text-green-800 border-green-200'
  },
  geral: {
    id: 'geral',
    name: 'Gabinete de Zeladoria e Ouvidoria Geral',
    shortName: 'Zeladoria Geral',
    icon: Info,
    color: '#64748B',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};

export const PRIORITIES: Record<IssuePriority, { label: string; color: string; badgeClass: string; order: number }> = {
  urgent: {
    label: 'Urgente / Risco',
    color: '#DC2626',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
    order: 4
  },
  high: {
    label: 'Alta',
    color: '#EA580C',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200 font-semibold',
    order: 3
  },
  medium: {
    label: 'Média',
    color: '#CA8A04',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    order: 2
  },
  low: {
    label: 'Baixa',
    color: '#64748B',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    order: 1
  }
};

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; badgeClass: string; icon: LucideIcon }> = {
  pending: {
    label: 'Pendente / Triagem',
    color: '#EAB308',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock
  },
  in_progress: {
    label: 'Em Atendimento',
    color: '#2563EB',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: AlertOctagon
  },
  solved: {
    label: 'Concluído / Resolvido',
    color: '#16A34A',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle2
  },
  rejected: {
    label: 'Arquivado / Improcedente',
    color: '#94A3B8',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
    icon: XCircle
  }
};

export const MAP_LAYERS = [
  {
    id: 'streets',
    name: 'Padrão (Ruas)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  {
    id: 'satellite',
    name: 'Satélite HD',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Maxar, Earthstar Geographics'
  },
  {
    id: 'dark',
    name: 'Noturno / Alto Contraste',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  }
];

export const APP_NAME = "Report Maps";
export const APP_TAGLINE = "Plataforma Inteligente de Zeladoria Urbana e Participação Cidadã";
export const APP_MUNICIPALITY = "Prefeitura Municipal";
export const APP_VERSION = "2.0.0-TCC";
