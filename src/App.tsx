import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { MapView } from './components/MapView';
import { Modal } from './components/Modal';
import { ReportForm } from './components/ReportForm';
import { GovDashboard } from './components/GovDashboard';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AcademicSection } from './components/AcademicSection';
import { AuthModal } from './components/AuthModal';
import { UrbanIssue, IssueStatus, MunicipalDepartment, IssuePriority, Comment as IssueComment } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  MessageCircle, 
  X, 
  Info, 
  Building2, 
  Map as MapIcon, 
  MessageSquare,
  ShieldCheck,
  Send,
  Sparkles,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { ISSUE_TYPES, APP_NAME, APP_TAGLINE, DEPARTMENTS, STATUS_CONFIG, PRIORITIES } from './constants';
import { cn } from './lib/utils';
import { onAppAuthStateChanged, AppUser } from './lib/firebase';
import { issueService } from './services/issueService';
import { commentService } from './services/commentService';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isGovMode, setIsGovMode] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<UrbanIssue | null>(null);
  const [issues, setIssues] = useState<UrbanIssue[]>([]);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const [selectedIssueForForum, setSelectedIssueForForum] = useState<UrbanIssue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOfficialComment, setIsOfficialComment] = useState(false);


  const setTab = (newTab: string) => {
    if (newTab !== 'forum') {
      setSelectedIssueForForum(null);
    }
    if (newTab === 'gov_panel') {
      setIsGovMode(true);
    }
    setCurrentTab(newTab);
  };

  const handleUpdateStatus = async (
    issueId: string, 
    newStatus: IssueStatus, 
    options?: { dispatchNote?: string; department?: MunicipalDepartment }
  ) => {
    try {
      await issueService.updateStatus(issueId, newStatus, {
        dispatchNote: options?.dispatchNote,
        officerName: user?.displayName || 'Gestor Público',
        department: options?.department
      });
      // Atualizar estado local para feedback visual imediato
      setIssues(prev => prev.map(iss => {
        if (iss.id === issueId) {
          return {
            ...iss,
            status: newStatus,
            department: options?.department || iss.department,
            officialResponse: options?.dispatchNote ? {
              text: options.dispatchNote,
              responderName: user?.displayName || 'Gestor Municipal',
              department: options?.department ? DEPARTMENTS[options.department]?.name : 'Gabinete de Zeladoria',
              updatedAt: Date.now()
            } : iss.officialResponse
          };
        }
        return iss;
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateDepartmentAndPriority = async (
    issueId: string,
    dept: MunicipalDepartment,
    priority: IssuePriority
  ) => {
    try {
      await issueService.updateDepartmentAndPriority(issueId, dept, priority);
      setIssues(prev => prev.map(iss => iss.id === issueId ? { ...iss, department: dept, priority } : iss));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm('Tem certeza que deseja arquivar/excluir este registro?')) return;
    
    try {
      await issueService.deleteIssue(issueId);
      setIssues(prev => prev.filter(i => i.id !== issueId));
      if (selectedIssue?.id === issueId) setSelectedIssue(null);
      if (selectedIssueForForum?.id === issueId) setSelectedIssueForForum(null);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (currentTab === 'dashboard' || currentTab === 'map' || currentTab === 'gov_panel') return true;
    
    if (currentTab === 'map_fire') return issue.type === 'fire';
    if (currentTab === 'map_flood') return issue.type === 'flooding';
    if (currentTab === 'map_pothole') return issue.type === 'pothole';
    if (currentTab === 'map_light') return issue.type === 'light_failure';
    if (currentTab === 'map_garbage') return issue.type === 'garbage';
    if (currentTab === 'map_sanitation') return issue.type === 'sanitation';
    if (currentTab === 'map_traffic') return issue.type === 'traffic_sign';
    
    return true;
  });

  const getActiveFilterLabel = () => {
    if (currentTab === 'map_fire') return 'Queimadas';
    if (currentTab === 'map_flood') return 'Alagamentos';
    if (currentTab === 'map_pothole') return 'Buracos na Via';
    if (currentTab === 'map_light') return 'Iluminação Pública';
    if (currentTab === 'map_garbage') return 'Lixo e Entulho';
    if (currentTab === 'map_sanitation') return 'Saneamento';
    if (currentTab === 'map_traffic') return 'Sinalização e Trânsito';
    return '';
  };

  useEffect(() => {
    const unsubscribeAuth = onAppAuthStateChanged((u) => {
      setUser(u);
    });

    const unsubscribeIssues = issueService.subscribeToIssues((fetchedIssues) => {
      setIssues(fetchedIssues);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeIssues();
    };
  }, []);

  useEffect(() => {
    if (selectedIssueForForum) {
      const unsubscribeComments = commentService.subscribeToComments(selectedIssueForForum.id, (fetchedComments) => {
        setComments(fetchedComments);
      });
      return () => unsubscribeComments();
    }
  }, [selectedIssueForForum]);

  const handleSendComment = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedIssueForForum || !newComment.trim()) return;
    try {
      await commentService.addComment(selectedIssueForForum.id, newComment, {
        isOfficial: isOfficialComment || isGovMode,
        departmentName: isOfficialComment || isGovMode ? DEPARTMENTS[selectedIssueForForum.department]?.name : undefined
      });
      setNewComment('');
      setIsOfficialComment(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateIssue = async (data: any) => {
    try {
      await issueService.createIssue({
        ...data,
        reporterName: user?.displayName || data.reporterName || 'Cidadão Anônimo'
      });
      setIsReportModalOpen(false);
      setClickedLocation(undefined);
      setTab('dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleLike = async (issue: UrbanIssue) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const isLiked = issue.likedBy?.includes(user.uid);
    try {
      await issueService.toggleLike(issue.id, !isLiked);
      setIssues(prev => prev.map(iss => {
        if (iss.id === issue.id) {
          const nextLiked = isLiked ? iss.likedBy.filter(id => id !== user.uid) : [...(iss.likedBy || []), user.uid];
          return { ...iss, likedBy: nextLiked, likesCount: nextLiked.length };
        }
        return iss;
      }));
    } catch (error) {
      console.error(error);
    }
  };


  const renderContent = () => {
    // Se a aba for um filtro de mapa, renderiza o mapa
    const view = currentTab.startsWith('map') ? 'map' : currentTab;

    switch (view) {
      case 'dashboard':
        return (
          <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Zeladoria Urbana em Tempo Real
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Painel Cidadão &bull; {APP_NAME}
                </h1>
                <p className="text-sm text-slate-500 max-w-xl">
                  {APP_TAGLINE}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-wider"
                >
                  + Relatar Problema
                </button>
                <button 
                  onClick={() => {
                    setIsGovMode(true);
                    setTab('gov_panel');
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Building2 size={15} className="text-amber-700" />
                  <span>Acessar Modo Prefeitura</span>
                </button>
              </div>
            </header>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {issues.filter(i => i.status !== 'solved').length}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ocorrências em Aberto</p>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {issues.filter(i => i.status === 'in_progress').length}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Equipes em Atendimento</p>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-600">
                    {issues.filter(i => i.status === 'solved').length}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problemas Solucionados</p>
                </div>
              </div>
            </div>

            {/* Lista de Ocorrências com Protocolos */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentTab === 'dashboard' ? 'Ocorrências Registradas pela Comunidade' : `Chamados de ${getActiveFilterLabel()}`}
                  </h2>
                  <p className="text-xs text-slate-400">Clique em qualquer chamado para ver o histórico e despachos oficiais</p>
                </div>
                <button onClick={() => setTab('map')} className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                  <MapIcon size={14} /> Ver no Mapa Interativo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {filteredIssues.length > 0 ? filteredIssues.map(issue => {
                  const it = ISSUE_TYPES.find(t => t.type === issue.type) || ISSUE_TYPES[0];
                  const dept = DEPARTMENTS[issue.department] || DEPARTMENTS.geral;
                  const priority = PRIORITIES[issue.priority] || PRIORITIES.medium;
                  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
                  const isLiked = user && issue.likedBy?.includes(user.uid);

                  return (
                    <motion.div 
                      key={issue.id}
                      whileHover={{ y: -2 }}
                      onClick={() => setSelectedIssue(issue)}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row gap-4 items-start cursor-pointer group"
                    >
                      <div className="flex-shrink-0">
                        {issue.imageUrl ? (
                          <img src={issue.imageUrl} alt={issue.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm border border-slate-100" />
                        ) : (
                          <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: it.color }}
                          >
                            <it.icon size={26} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            <ShieldCheck size={11} /> {issue.protocol}
                          </span>
                          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", status.badgeClass)}>
                            {status.label}
                          </span>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border hidden sm:inline-block", priority.badgeClass)}>
                            {priority.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium ml-auto hidden md:inline-block">
                            {dept.shortName}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                          {issue.title}
                        </h4>
                        
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-500" /> {issue.address}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(issue.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>&bull;</span>
                          <span>Por {issue.reporterName}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleToggleLike(issue)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm",
                            isLiked ? "bg-blue-600 text-white shadow-blue-200" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                          )}
                          title="Apoiar este chamado"
                        >
                          <ThumbsUp size={13} className={cn(isLiked && "fill-white")} />
                          <span>{issue.likesCount || 0}</span>
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedIssueForForum(issue);
                            setTab('forum');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition-all"
                        >
                          <MessageCircle size={13} />
                          <span>{issue.commentsCount || 0}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
                    <Info size={36} className="opacity-30" />
                    <p className="font-semibold text-sm">Nenhuma ocorrência encontrada nesta categoria.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case 'gov_panel':
        return (
          <GovDashboard 
            issues={issues}
            onSelectIssue={(iss) => setSelectedIssue(iss)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onUpdateStatus={(id, st) => handleUpdateStatus(id, st)}
          />
        );

      case 'map':
        const activeFilter = currentTab.startsWith('map_') 
          ? ISSUE_TYPES.find(t => currentTab.includes(t.type))
          : null;

        return (
          <div className="flex-1 h-full relative">
            <MapView 
              issues={filteredIssues} 
              onSelectIssue={setSelectedIssue}
              onMapClick={(lat, lng) => {
                setClickedLocation({ lat, lng });
                setIsReportModalOpen(true);
              }}
            />

            {/* Indicador de Filtro Ativo */}
            <AnimatePresence>
              {activeFilter && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
                >
                  <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-slate-200 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: activeFilter.color }}></div>
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                      Filtrando: {activeFilter.label}
                    </span>
                    <button 
                      onClick={() => setTab('map')}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X size={14} className="text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'forum':
        return (
          <div className="p-4 sm:p-8 max-w-4xl mx-auto h-full flex flex-col">
            {!selectedIssueForForum ? (
              <div className="flex-1 flex flex-col space-y-4 sm:space-y-6">
                <header className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Fórum de Participação Cidadã</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Acompanhe discussões, respostas oficiais da Prefeitura e depoimentos da vizinhança.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {issues.map(issue => (
                    <motion.div 
                      key={issue.id}
                      onClick={() => setSelectedIssueForForum(issue)}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex gap-3.5 group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-slate-50 shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center text-slate-400">
                        {issue.imageUrl ? (
                          <img src={issue.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          (() => {
                            const it = ISSUE_TYPES.find(t => t.type === issue.type) || ISSUE_TYPES[0];
                            return <it.icon size={22} style={{ color: it.color }} />;
                          })()
                        )}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">{issue.title}</h4>
                          <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                            <MessageCircle size={10} /> {issue.commentsCount || 0}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{issue.description}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                          <span className="font-mono font-bold text-slate-600">{issue.protocol}</span>
                          <span>&bull;</span>
                          <span>{issue.reporterName}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Header da Discussão */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-3">
                    <button 
                      onClick={() => setSelectedIssueForForum(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                      &larr; Voltar para todas as discussões
                    </button>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-mono font-bold">
                      {selectedIssueForForum.protocol}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-slate-900">{selectedIssueForForum.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{selectedIssueForForum.address}</p>
                    </div>
                  </div>
                </div>

                {/* Lista de Comentários */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 py-12">
                      <MessageCircle size={36} className="opacity-30" />
                      <p className="text-xs font-semibold">Nenhum comentário ainda. Participe da discussão abaixo!</p>
                    </div>
                  ) : (
                    comments.map(comment => {
                      const isOfficial = comment.isOfficial || comment.userEmail?.includes('.gov.br');
                      
                      return (
                        <div key={comment.id} className={cn(
                          "flex flex-col gap-1 max-w-[85%]",
                          comment.userId === user?.uid ? "ml-auto items-end" : "items-start"
                        )}>
                          <div className="flex items-center gap-2 px-1">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                              isOfficial ? "text-blue-700" : "text-slate-500"
                            )}>
                              {isOfficial && <Building2 size={11} className="text-blue-600" />}
                              {comment.userName}
                              {isOfficial && (
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[9px] font-black">
                                  Oficial
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] text-slate-300">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                            isOfficial
                              ? "bg-blue-50 text-blue-950 border border-blue-200"
                              : comment.userId === user?.uid 
                                ? "bg-slate-900 text-white rounded-tr-none" 
                                : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80"
                          )}>
                            {comment.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input de Novo Comentário */}
                <div className="p-4 border-t border-slate-100 bg-white space-y-2">
                  {!user ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                      <p className="text-xs font-semibold text-slate-600">Faça login para participar da discussão pública.</p>
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-all"
                      >
                        Entrar no Sistema
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {isGovMode && (
                        <label className="flex items-center gap-2 text-xs font-bold text-amber-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isOfficialComment}
                            onChange={(e) => setIsOfficialComment(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>🏛️ Enviar como Resposta Oficial da Prefeitura</span>
                        </label>
                      )}
                      
                      <div className="relative">
                        <textarea 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Adicione informações, fotos ou atualizações sobre este problema..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pr-12 text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendComment();
                            }
                          }}
                        />
                        <button 
                          onClick={handleSendComment}
                          disabled={!newComment.trim()}
                          className="absolute right-2.5 bottom-2.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-40"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'about':
        return <AcademicSection />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      <div className="hidden md:block">
        <Sidebar 
          currentTab={currentTab} 
          setTab={setTab} 
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <Header 
          currentTab={currentTab} 
          setTab={setTab} 
          onReportClick={() => setIsReportModalOpen(true)} 
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isGovMode={isGovMode}
          setIsGovMode={setIsGovMode}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Sidebar lateral de Atividades Recentes e Indicadores (visível em telas grandes) */}
          {currentTab === 'dashboard' && (
            <aside className="w-80 bg-slate-50 border-l border-slate-200 hidden xl:flex flex-col shrink-0 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-white">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Feed da Cidade</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Últimas ocorrências e atualizações</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {issues.slice(0, 5).map(issue => (
                  <div 
                    key={issue.id} 
                    onClick={() => setSelectedIssue(issue)}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-blue-600">{issue.protocol}</span>
                      <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-bold", STATUS_CONFIG[issue.status].badgeClass)}>
                        {STATUS_CONFIG[issue.status].label}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">{issue.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{issue.address}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-white border-t border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Índice de Eficiência</span>
                  <span className="text-blue-600">
                    {issues.length > 0 ? Math.round((issues.filter(i => i.status === 'solved').length / issues.length) * 100) : 0}% Resolvidos
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${issues.length > 0 ? (issues.filter(i => i.status === 'solved').length / issues.length) * 100 : 0}%` }}
                    className="h-full bg-blue-600 rounded-full" 
                  />
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Rodapé Informativo */}
        <footer className="h-9 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest bg-white/80 backdrop-blur-sm z-20">
          <div>&copy; 2026 {APP_NAME} &bull; TCC Análise e Desenvolvimento de Sistemas</div>
          <div className="flex gap-4 items-center">
            <span>GovTech Smart Cities</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Servidores Conectados</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal de Registro de Novo Problema */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => {
          setIsReportModalOpen(false);
          setClickedLocation(undefined);
        }}
        title="Novo Registro de Ocorrência Pública"
      >
        <ReportForm onSubmit={handleCreateIssue} initialLocation={clickedLocation} />
      </Modal>

      {/* Modal Completo de Detalhes da Ocorrência */}
      <IssueDetailModal
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateDepartment={handleUpdateDepartmentAndPriority}
        onDeleteIssue={handleDeleteIssue}
        onToggleLike={handleToggleLike}
        onOpenForum={(issue) => {
          setSelectedIssueForForum(issue);
          setTab('forum');
        }}
        isGovMode={isGovMode}
        currentUserId={user?.uid}
      />

      {/* Modal de Autenticação / Login Rápido */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <MobileNav 
        currentTab={currentTab} 
        setTab={setTab} 
        onReportClick={() => setIsReportModalOpen(true)} 
        isGovMode={isGovMode}
      />
    </div>
  );
}



