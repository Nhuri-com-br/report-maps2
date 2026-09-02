/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UrbanIssue, MunicipalDepartment, IssuePriority, IssueStatus } from '../types';
import { ISSUE_TYPES, DEPARTMENTS, PRIORITIES, STATUS_CONFIG, APP_NAME, APP_MUNICIPALITY } from '../constants';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowUpDown, 
  Eye, 
  Sparkles,
  TrendingUp,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { issueService } from '../services/issueService';

interface GovDashboardProps {
  issues: UrbanIssue[];
  onSelectIssue: (issue: UrbanIssue) => void;
  onOpenReportModal: () => void;
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
}

export function GovDashboard({
  issues,
  onSelectIssue,
  onOpenReportModal,
  onUpdateStatus
}: GovDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Cálculos de Indicadores de Gestão (KPIs)
  const totalIssues = issues.length;
  const solvedIssues = issues.filter(i => i.status === 'solved').length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
  const pendingIssues = issues.filter(i => i.status === 'pending').length;
  const urgentIssues = issues.filter(i => i.priority === 'urgent' && i.status !== 'solved').length;
  const resolutionRate = totalIssues > 0 ? Math.round((solvedIssues / totalIssues) * 100) : 0;

  // Filtragem dos dados da tabela
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept === 'all' || issue.department === filterDept;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;

    return matchesSearch && matchesDept && matchesPriority && matchesStatus;
  });

  const handleExportCsv = () => {
    const csvData = issueService.exportToCsv(filteredIssues);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_Zeladoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header do Gabinete de Gestão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Building2 size={16} />
            <span>Central Municipal de Zeladoria Urbana &bull; GovTech</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Painel de Triagem e Gestão Pública</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Monitoramento de chamados urbanos, despacho de ordens de serviço por secretaria e auditoria de demandas dos cidadãos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-sm hover:border-slate-600"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
          >
            <Printer size={14} />
            <span>Relatório Oficial</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs de Eficiência Pública */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{totalIssues}</h3>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total de Chamados</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-emerald-700">{solvedIssues}</h3>
              <span className="text-xs font-bold text-emerald-600">({resolutionRate}%)</span>
            </div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Taxa de Resolução</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-blue-700">{inProgressIssues}</h3>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Em Atendimento</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-amber-700">{pendingIssues}</h3>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Aguardando Triagem</p>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-rose-700">{urgentIssues}</h3>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Risco / Urgentes</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo (ex: PROT-2026), título, rua ou cidadão..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Secretarias</option>
              {Object.values(DEPARTMENTS).map(d => (
                <option key={d.id} value={d.id}>{d.shortName}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="urgent">Urgente / Risco</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Atendimento</option>
              <option value="solved">Concluído</option>
              <option value="rejected">Arquivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Triagem de Chamados */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Lista Geral de Chamados da Zeladoria</h2>
            <p className="text-xs text-slate-400">Exibindo {filteredIssues.length} ocorrência(s)</p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            + Novo Registro Manual
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Protocolo / Data</th>
                <th className="p-4">Ocorrência</th>
                <th className="p-4">Secretaria</th>
                <th className="p-4">Prioridade</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length > 0 ? (
                filteredIssues.map(issue => {
                  const typeConfig = ISSUE_TYPES.find(t => t.type === issue.type) || ISSUE_TYPES[0];
                  const deptConfig = DEPARTMENTS[issue.department] || DEPARTMENTS.geral;
                  const priorityConfig = PRIORITIES[issue.priority] || PRIORITIES.medium;
                  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;

                  return (
                    <tr 
                      key={issue.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectIssue(issue)}
                    >
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {issue.protocol}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(issue.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {issue.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                          <MapPin size={10} className="shrink-0" />
                          <span>{issue.address}</span>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <Building2 size={13} className="text-slate-400" />
                          <span>{deptConfig.shortName}</span>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", priorityConfig.badgeClass)}>
                          {priorityConfig.label}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1", statusConfig.badgeClass)}>
                          <statusConfig.icon size={11} />
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectIssue(issue)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye size={12} />
                            <span>Despachar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Nenhuma ocorrência encontrada para os filtros selecionados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Visualização de Relatório Oficial Impresso para TCC */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl space-y-6 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  RM
                </div>
                <div>
                  <h3 className="font-bold text-lg">{APP_NAME} &bull; Relatório Executivo Municipal</h3>
                  <p className="text-xs text-slate-500">Documento Oficial para Prestação de Contas e Auditoria de Zeladoria</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintReport}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <Printer size={14} /> Imprimir / Salvar PDF
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Sumário Executivo */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border text-center text-xs">
              <div>
                <span className="text-slate-400 block font-bold">Total Registrado</span>
                <span className="text-xl font-black text-slate-900">{totalIssues}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Resolvidos</span>
                <span className="text-xl font-black text-emerald-600">{solvedIssues}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Em Atendimento</span>
                <span className="text-xl font-black text-blue-600">{inProgressIssues}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Índice de Resolução</span>
                <span className="text-xl font-black text-purple-600">{resolutionRate}%</span>
              </div>
            </div>

            {/* Tabela do Relatório */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Demonstrativo das Ocorrências Auditadas</h4>
              <div className="max-h-72 overflow-y-auto border rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-2">Protocolo</th>
                      <th className="p-2">Data</th>
                      <th className="p-2">Problema</th>
                      <th className="p-2">Secretaria</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {issues.map(i => (
                      <tr key={i.id}>
                        <td className="p-2 font-mono font-bold">{i.protocol}</td>
                        <td className="p-2">{new Date(i.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="p-2 truncate max-w-[200px]">{i.title}</td>
                        <td className="p-2">{DEPARTMENTS[i.department]?.shortName || i.department}</td>
                        <td className="p-2">{STATUS_CONFIG[i.status]?.label || i.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-between items-center text-[10px] text-slate-400">
              <span>Emissão: {new Date().toLocaleString('pt-BR')} &bull; Sistema Report Maps (TCC)</span>
              <span>Assinatura do Responsável Técnico: ___________________________</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
