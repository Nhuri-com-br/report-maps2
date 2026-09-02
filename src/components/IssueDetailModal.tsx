/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UrbanIssue, IssueStatus, MunicipalDepartment, IssuePriority } from '../types';
import { ISSUE_TYPES, DEPARTMENTS, PRIORITIES, STATUS_CONFIG } from '../constants';
import { 
  X, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Send,
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';

interface IssueDetailModalProps {
  issue: UrbanIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (issueId: string, status: IssueStatus, options?: { dispatchNote?: string; department?: MunicipalDepartment }) => void;
  onUpdateDepartment?: (issueId: string, dept: MunicipalDepartment, priority: IssuePriority) => void;
  onDeleteIssue?: (issueId: string) => void;
  onToggleLike: (issue: UrbanIssue) => void;
  onOpenForum: (issue: UrbanIssue) => void;
  isGovMode: boolean;
  currentUserId?: string;
}

export function IssueDetailModal({
  issue,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateDepartment,
  onDeleteIssue,
  onToggleLike,
  onOpenForum,
  isGovMode,
  currentUserId
}: IssueDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [dispatchNote, setDispatchNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue?.status || 'pending');
  const [selectedDept, setSelectedDept] = useState<MunicipalDepartment>(issue?.department || 'geral');
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority>(issue?.priority || 'medium');
  const [isGeneratingDispatch, setIsGeneratingDispatch] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'gov_action'>('details');

  if (!isOpen || !issue) return null;

  const typeConfig = ISSUE_TYPES.find(t => t.type === issue.type) || ISSUE_TYPES[0];
  const deptConfig = DEPARTMENTS[issue.department] || DEPARTMENTS.geral;
  const priorityConfig = PRIORITIES[issue.priority] || PRIORITIES.medium;
  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
  const isLiked = currentUserId ? issue.likedBy?.includes(currentUserId) : false;

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(issue.protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🚨 *Chamado de Zeladoria Urbana - Report Maps*\n\n📌 *Protocolo:* ${issue.protocol}\n📍 *Local:* ${issue.address}\n⚠️ *Problema:* ${issue.title}\n📊 *Status:* ${statusConfig.label}\n\nAcompanhe e apoie este chamado na plataforma municipal!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleGenerateAiDispatch = async () => {
    setIsGeneratingDispatch(true);
    try {
      const note = await geminiService.generateOfficialDispatch({
        title: issue.title,
        type: typeConfig.label,
        priority: priorityConfig.label,
        department: deptConfig.name,
        address: issue.address
      });
      setDispatchNote(note);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDispatch(false);
    }
  };

  const handleApplyGovUpdate = () => {
    onUpdateStatus(issue.id, selectedStatus, {
      dispatchNote: dispatchNote.trim() || undefined,
      department: selectedDept
    });
    if (onUpdateDepartment && (selectedDept !== issue.department || selectedPriority !== issue.priority)) {
      onUpdateDepartment(issue.id, selectedDept, selectedPriority);
    }
    setDispatchNote('');
    setActiveTab('details');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header com Protocolo e Status */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-300 font-bold border border-slate-700 flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  {issue.protocol}
                </span>
                <button 
                  onClick={handleCopyProtocol}
                  className="text-slate-400 hover:text-white text-xs p-1 rounded hover:bg-slate-800 transition-colors"
                  title="Copiar Protocolo"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">{issue.title}</h2>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm", statusConfig.badgeClass)}>
                <statusConfig.icon size={14} />
                {statusConfig.label}
              </span>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 text-xs font-bold uppercase tracking-wider">
            <button 
              onClick={() => setActiveTab('details')}
              className={cn("pb-3 transition-colors border-b-2", activeTab === 'details' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900")}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={cn("pb-3 transition-colors border-b-2 flex items-center gap-1.5", activeTab === 'timeline' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900")}
            >
              <Clock size={14} />
              Histórico & Despachos ({issue.timeline?.length || 1})
            </button>
            {isGovMode && (
              <button 
                onClick={() => setActiveTab('gov_action')}
                className={cn("pb-3 transition-colors border-b-2 flex items-center gap-1.5 text-amber-700", activeTab === 'gov_action' ? "border-amber-600 font-black" : "border-transparent hover:text-amber-900")}
              >
                🏛️ Ação Administrativa
              </button>
            )}
          </div>

          {/* Conteúdo Principal com Scroll */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Badges de Categoria, Secretaria e Prioridade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categoria</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: typeConfig.color }}>
                        <typeConfig.icon size={14} />
                      </div>
                      {typeConfig.label}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secretaria Responsável</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 truncate" title={deptConfig.name}>
                      <Building2 size={16} className="text-slate-500 shrink-0" />
                      <span className="truncate">{deptConfig.shortName}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prioridade Pública</span>
                    <div>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-block", priorityConfig.badgeClass)}>
                        {priorityConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Imagem em destaque */}
                {issue.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-72 bg-slate-100">
                    <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover max-h-72" />
                  </div>
                )}

                {/* Descrição Detalhada */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição do Problema</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    {issue.description}
                  </p>
                </div>

                {/* Localização */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Localização do Registro</h4>
                  <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-slate-700 text-sm">
                    <MapPin className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">{issue.address}</p>
                      <p className="text-xs text-slate-500">
                        Coordenadas: {issue.location.lat.toFixed(5)}, {issue.location.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resposta Oficial da Prefeitura (se houver) */}
                {issue.officialResponse && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Parecer Técnico Oficial da Prefeitura
                      </div>
                      <span className="text-[10px] text-emerald-700">
                        {new Date(issue.officialResponse.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                      "{issue.officialResponse.text}"
                    </p>
                    <div className="pt-2 text-xs text-emerald-700 font-semibold border-t border-emerald-200/60">
                      Emitido por: {issue.officialResponse.responderName} &bull; {issue.officialResponse.department}
                    </div>
                  </div>
                )}

                {/* Metadados de registro */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Registrado em {new Date(issue.createdAt).toLocaleDateString('pt-BR')} às {new Date(issue.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span>Cidadão: <strong className="text-slate-600">{issue.reporterName}</strong></span>
                </div>
              </div>
            )}

            {/* Aba de Linha do Tempo e Despachos */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-500">
                  Rastreabilidade completa de todas as etapas e despachos efetuados pelos órgãos públicos municipais.
                </p>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(issue.timeline && issue.timeline.length > 0 ? issue.timeline : [
                    {
                      id: 't-init',
                      timestamp: issue.createdAt,
                      authorName: issue.reporterName,
                      authorRole: 'citizen' as const,
                      action: 'Ocorrência registrada no sistema público.'
                    }
                  ]).map((entry, idx) => (
                    <div key={entry.id || idx} className="relative group">
                      <div className={cn(
                        "absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                        entry.authorRole === 'gov_official' ? "bg-blue-600" : "bg-slate-400"
                      )} />
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800">{entry.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(entry.timestamp).toLocaleDateString('pt-BR')} {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mt-2 font-mono">
                            {entry.notes}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 pt-1 font-medium">
                          Por: {entry.authorName} ({entry.authorRole === 'gov_official' ? '🏛️ Órgão Público' : '👤 Cidadão'})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aba Administrativa do Gestor Público */}
            {activeTab === 'gov_action' && isGovMode && (
              <div className="space-y-5 bg-amber-50/40 p-5 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Building2 size={18} />
                  Controle da Zeladoria Municipal
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Status do Chamado</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as IssueStatus)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="pending">Pendente / Triagem</option>
                      <option value="in_progress">Em Atendimento</option>
                      <option value="solved">Concluído / Resolvido</option>
                      <option value="rejected">Arquivado / Improcedente</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Secretaria Atribuída</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value as MunicipalDepartment)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.values(DEPARTMENTS).map(d => (
                        <option key={d.id} value={d.id}>{d.shortName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nível de Prioridade</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as IssuePriority)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente / Risco</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Despacho Oficial / Parecer Técnico</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDispatch}
                      disabled={isGeneratingDispatch}
                      className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Sparkles size={12} />
                      {isGeneratingDispatch ? 'Gerando minuta...' : 'Gerar Minuta com IA'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    placeholder="Escreva a nota oficial de esclarecimento ou ordem de serviço para o cidadão..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {onDeleteIssue && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este chamado permanentemente?')) {
                          onDeleteIssue(issue.id);
                          onClose();
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} /> Excluir Ocorrência
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleApplyGovUpdate}
                    className="ml-auto bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    Salvar Alterações e Notificar Cidadão
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações do Cidadão */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleLike(issue)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm",
                  isLiked 
                    ? "bg-blue-600 text-white shadow-blue-200" 
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <ThumbsUp size={14} className={cn(isLiked && "fill-white")} />
                <span>{issue.likesCount || 0} Apoios</span>
              </button>

              <button
                onClick={() => {
                  onOpenForum(issue);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition-all shadow-sm"
              >
                <MessageSquare size={14} />
                <span>Fórum ({issue.commentsCount || 0})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-200"
                title="Compartilhar no WhatsApp"
              >
                <Share2 size={14} />
                <span>Compartilhar</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
