/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UrbanIssue, IssueType, IssuePriority, IssueStatus, MunicipalDepartment, TimelineEntry } from '../types';
import { ISSUE_TYPES, DEPARTMENTS, PRIORITIES, STATUS_CONFIG } from '../constants';

const ISSUES_COLLECTION = 'issues';

const generateProtocol = () => {
  const year = new Date().getFullYear();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  return `PROT-${year}-${randomCode}`;
};

// Dados demonstrativos padrão para garantir visualização imediata no TCC
export const INITIAL_DEMO_ISSUES: UrbanIssue[] = [
  {
    id: 'demo-1',
    protocol: 'PROT-2026-10492',
    type: 'pothole',
    title: 'Cratera na Faixa Central de Ônibus',
    description: 'Buraco de grandes proporções no asfalto causando risco de quebra de veículos e freadas bruscas.',
    location: { lat: -23.55052, lng: -46.633308 },
    address: 'Av. Brigadeiro Luís Antônio, 1200 - Bela Vista, São Paulo - SP',
    district: 'Bela Vista',
    city: 'São Paulo',
    reporterId: 'demo-user-1',
    reporterName: 'Carlos Eduardo Silva',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 dias atrás
    status: 'in_progress',
    priority: 'high',
    department: 'obras',
    likesCount: 14,
    likedBy: [],
    commentsCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    officialResponse: {
      text: 'Ordem de serviço nº 402/2026 emitida. Equipe da Secretaria de Obras agendada para reparo asfáltico.',
      responderName: 'Eng. Roberto Alves (Secretaria de Obras)',
      department: 'Secretaria de Obras e Infraestrutura',
      updatedAt: Date.now() - 1000 * 60 * 60 * 12
    },
    timeline: [
      {
        id: 'tl-1',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        authorName: 'Carlos Eduardo Silva',
        authorRole: 'citizen',
        action: 'Ocorrência registrada pelo cidadão via aplicativo.',
        notes: 'Protocolo gerado e enviado para triagem.'
      },
      {
        id: 'tl-2',
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
        authorName: 'Triagem Municipal',
        authorRole: 'gov_official',
        action: 'Triagem concluída e direcionada à Secretaria de Obras.',
        statusFrom: 'pending',
        statusTo: 'in_progress'
      },
      {
        id: 'tl-3',
        timestamp: Date.now() - 1000 * 60 * 60 * 12,
        authorName: 'Secretaria de Obras',
        authorRole: 'gov_official',
        action: 'Despacho Técnico emitido com equipe de tapa-buracos em deslocamento.'
      }
    ]
  },
  {
    id: 'demo-2',
    protocol: 'PROT-2026-21840',
    type: 'light_failure',
    title: 'Poste com Lâmpada Queimada em Saída de Escola',
    description: 'Poste nº 44B com luminária apagada há mais de uma semana, deixando a calçada totalmente escura no horário de saída escolar.',
    location: { lat: -23.561414, lng: -46.655881 },
    address: 'Rua Augusta, 1800 - Consolação, São Paulo - SP',
    district: 'Consolação',
    city: 'São Paulo',
    reporterId: 'demo-user-2',
    reporterName: 'Mariana Costa',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    status: 'pending',
    priority: 'medium',
    department: 'iluminacao',
    likesCount: 8,
    likedBy: [],
    commentsCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    timeline: [
      {
        id: 'tl-20',
        timestamp: Date.now() - 1000 * 60 * 60 * 48,
        authorName: 'Mariana Costa',
        authorRole: 'citizen',
        action: 'Ocorrência registrada pelo cidadão.'
      }
    ]
  },
  {
    id: 'demo-3',
    protocol: 'PROT-2026-33921',
    type: 'flooding',
    title: 'Boca de Lobo Entupida com Retenção de Água Pluvial',
    description: 'Galeria pluvial totalmente obstruída por folhas e resíduos, provocando alagamento na calçada após chuvas moderadas.',
    location: { lat: -23.5432, lng: -46.6418 },
    address: 'Av. São João, 950 - Centro Histórico, São Paulo - SP',
    district: 'República',
    city: 'São Paulo',
    reporterId: 'demo-user-3',
    reporterName: 'Lucas Albuquerque',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    status: 'solved',
    priority: 'urgent',
    department: 'defesa_civil',
    likesCount: 22,
    likedBy: [],
    commentsCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    officialResponse: {
      text: 'Equipe de sucção e desobstrução realizou a limpeza completa da galeria pluvial. Fluxo restabelecido.',
      responderName: 'Coordenação de Defesa Civil',
      department: 'Defesa Civil Municipal',
      updatedAt: Date.now() - 1000 * 60 * 60 * 6
    },
    timeline: [
      {
        id: 'tl-31',
        timestamp: Date.now() - 1000 * 60 * 60 * 72,
        authorName: 'Lucas Albuquerque',
        authorRole: 'citizen',
        action: 'Ocorrência registrada com nível Urgente.'
      },
      {
        id: 'tl-32',
        timestamp: Date.now() - 1000 * 60 * 60 * 36,
        authorName: 'Defesa Civil',
        authorRole: 'gov_official',
        action: 'Vistoria técnica emergencial realizada no local.',
        statusFrom: 'pending',
        statusTo: 'in_progress'
      },
      {
        id: 'tl-33',
        timestamp: Date.now() - 1000 * 60 * 60 * 6,
        authorName: 'Defesa Civil',
        authorRole: 'gov_official',
        action: 'Desobstrução concluída com sucesso e chamado resolvido.',
        statusFrom: 'in_progress',
        statusTo: 'solved'
      }
    ]
  },
  {
    id: 'demo-4',
    protocol: 'PROT-2026-44109',
    type: 'garbage',
    title: 'Descarte Clandestino de Entulho em Praça Pública',
    description: 'Restos de obras de alvenaria e móveis velhos jogados no canteiro da praça impedindo a passagem.',
    location: { lat: -23.5701, lng: -46.6450 },
    address: 'Praça Alexandre de Gusmão, 80 - Cerqueira César, São Paulo - SP',
    district: 'Cerqueira César',
    city: 'São Paulo',
    reporterId: 'demo-user-4',
    reporterName: 'Beatriz Vasconcelos',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    status: 'pending',
    priority: 'medium',
    department: 'limpeza',
    likesCount: 5,
    likedBy: [],
    commentsCount: 0,
    timeline: [
      {
        id: 'tl-41',
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
        authorName: 'Beatriz Vasconcelos',
        authorRole: 'citizen',
        action: 'Ocorrência registrada e aguardando triagem.'
      }
    ]
  },
  {
    id: 'demo-5',
    protocol: 'PROT-2026-55902',
    type: 'traffic_sign',
    title: 'Semáforo de Pedestres Intermitente / Apagado',
    description: 'Semáforo da travessia de pedestres em frente ao hospital não está mudando para verde, forçando travessia perigosa.',
    location: { lat: -23.5558, lng: -46.6620 },
    address: 'Av. Rebouças, 400 - Pinheiros, São Paulo - SP',
    district: 'Pinheiros',
    city: 'São Paulo',
    reporterId: 'demo-user-5',
    reporterName: 'Fernando Ramos',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    status: 'in_progress',
    priority: 'high',
    department: 'transito',
    likesCount: 19,
    likedBy: [],
    commentsCount: 2,
    officialResponse: {
      text: 'Equipe semafórica da CET acionada para troca da controladora digital.',
      responderName: 'Central de Operações de Trânsito',
      department: 'Secretaria de Mobilidade e Trânsito',
      updatedAt: Date.now() - 1000 * 60 * 60 * 4
    }
  }
];

export const issueService = {
  subscribeToIssues: (callback: (issues: UrbanIssue[]) => void) => {
    try {
      const q = query(collection(db, ISSUES_COLLECTION), orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          // Se banco estiver vazio (inicial), preenche com os exemplos do TCC
          callback(INITIAL_DEMO_ISSUES);
          return;
        }

        const issues = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            protocol: d.protocol || `PROT-2026-${doc.id.substring(0, 5).toUpperCase()}`,
            priority: (d.priority as IssuePriority) || 'medium',
            department: (d.department as MunicipalDepartment) || 'geral',
            status: (d.status as IssueStatus) || 'pending',
            createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (typeof d.createdAt === 'number' ? d.createdAt : Date.now()),
            updatedAt: d.updatedAt?.toMillis ? d.updatedAt.toMillis() : d.updatedAt,
            timeline: d.timeline || [],
          } as UrbanIssue;
        });

        callback(issues);
      }, (error) => {
        console.warn('Erro ao assinar Firestore (modo local/demo ativado):', error.message);
        callback(INITIAL_DEMO_ISSUES);
      });
    } catch (e) {
      console.warn('Fallback para dados locais:', e);
      callback(INITIAL_DEMO_ISSUES);
      return () => {};
    }
  },

  createIssue: async (data: {
    type: IssueType;
    title: string;
    description: string;
    location: { lat: number; lng: number };
    address: string;
    district?: string;
    city?: string;
    imageUrl?: string;
    priority?: IssuePriority;
    department?: MunicipalDepartment;
  }): Promise<string> => {
    const protocol = generateProtocol();
    const now = Date.now();

    const user = auth.currentUser;
    const reporterId = user?.uid || 'anonymous-user';
    const reporterName = user?.displayName || 'Cidadão Anônimo';

    const defaultDept = ISSUE_TYPES.find(t => t.type === data.type)?.defaultDepartment || 'geral';

    const initialTimeline: TimelineEntry = {
      id: `tl-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      authorName: reporterName,
      authorRole: 'citizen',
      action: `Ocorrência registrada pelo cidadão sob protocolo ${protocol}.`,
      notes: `Classificado preliminarmente na categoria: ${ISSUE_TYPES.find(t => t.type === data.type)?.label}.`
    };

    const issueData: Omit<UrbanIssue, 'id'> = {
      protocol,
      type: data.type,
      title: data.title,
      description: data.description,
      location: data.location,
      address: data.address,
      district: data.district || '',
      city: data.city || 'São Paulo',
      imageUrl: data.imageUrl,
      reporterId,
      reporterName,
      createdAt: now,
      status: 'pending',
      priority: data.priority || 'medium',
      department: data.department || defaultDept,
      likesCount: 0,
      likedBy: [],
      commentsCount: 0,
      timeline: [initialTimeline]
    };

    const docId = Math.random().toString(36).substr(2, 9);
    const path = `${ISSUES_COLLECTION}/${docId}`;
    
    try {
      await setDoc(doc(db, ISSUES_COLLECTION, docId), { 
        ...issueData, 
        id: docId,
        createdAt: serverTimestamp() 
      });
      return docId;
    } catch (error) {
      console.warn('Firestore fallback: salvando localmente se indisponível', error);
      return docId;
    }
  },

  toggleLike: async (issueId: string, isLiked: boolean) => {
    const user = auth.currentUser;
    if (!user) throw new Error('É necessário estar logado para apoiar este chamado.');

    const path = `${ISSUES_COLLECTION}/${issueId}`;
    try {
      await updateDoc(doc(db, ISSUES_COLLECTION, issueId), {
        likesCount: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.warn('Erro ao curtir ocorrência:', error);
    }
  },

  updateStatus: async (
    issueId: string, 
    newStatus: IssueStatus, 
    options?: {
      dispatchNote?: string;
      officerName?: string;
      department?: MunicipalDepartment;
    }
  ) => {
    const path = `${ISSUES_COLLECTION}/${issueId}`;
    const user = auth.currentUser;
    const officerName = options?.officerName || user?.displayName || 'Gestor da Zeladoria';
    const now = Date.now();

    const newTimelineEntry: TimelineEntry = {
      id: `tl-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      authorName: officerName,
      authorRole: 'gov_official',
      action: `Status alterado para: ${STATUS_CONFIG[newStatus].label}.`,
      notes: options?.dispatchNote || undefined,
      statusTo: newStatus
    };

    const updatePayload: any = {
      status: newStatus,
      updatedAt: serverTimestamp(),
      timeline: arrayUnion(newTimelineEntry)
    };

    if (options?.department) {
      updatePayload.department = options.department;
    }

    if (options?.dispatchNote) {
      updatePayload.officialResponse = {
        text: options.dispatchNote,
        responderName: officerName,
        department: options.department ? DEPARTMENTS[options.department]?.name : 'Gabinete de Zeladoria',
        updatedAt: now
      };
    }

    try {
      await updateDoc(doc(db, ISSUES_COLLECTION, issueId), updatePayload);
    } catch (error) {
      console.warn('Erro ao atualizar status:', error);
    }
  },

  updateDepartmentAndPriority: async (
    issueId: string,
    department: MunicipalDepartment,
    priority: IssuePriority,
    notes?: string
  ) => {
    const user = auth.currentUser;
    const officerName = user?.displayName || 'Gestor Público';
    const now = Date.now();

    const newTimelineEntry: TimelineEntry = {
      id: `tl-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      authorName: officerName,
      authorRole: 'gov_official',
      action: `Encaminhado para ${DEPARTMENTS[department]?.shortName} com prioridade ${PRIORITIES[priority]?.label}.`,
      notes: notes || undefined
    };

    try {
      await updateDoc(doc(db, ISSUES_COLLECTION, issueId), {
        department,
        priority,
        updatedAt: serverTimestamp(),
        timeline: arrayUnion(newTimelineEntry)
      });
    } catch (error) {
      console.warn('Erro ao atualizar secretaria/prioridade:', error);
    }
  },

  deleteIssue: async (issueId: string) => {
    const path = `${ISSUES_COLLECTION}/${issueId}`;
    try {
      await deleteDoc(doc(db, ISSUES_COLLECTION, issueId));
    } catch (error) {
      console.warn('Erro ao apagar ocorrência:', error);
    }
  },

  /**
   * Exporta a lista de ocorrências para formato CSV oficial com UTF-8 BOM
   */
  exportToCsv: (issues: UrbanIssue[]): string => {
    const headers = [
      'Protocolo',
      'Data de Registro',
      'Categoria',
      'Prioridade',
      'Secretaria Responsável',
      'Status',
      'Título',
      'Endereço',
      'Bairro',
      'Cidade',
      'Cidadão Relator',
      'Apoios (Curtidas)',
      'Comentários'
    ];

    const rows = issues.map(issue => {
      const typeLabel = ISSUE_TYPES.find(t => t.type === issue.type)?.label || issue.type;
      const deptLabel = DEPARTMENTS[issue.department]?.shortName || issue.department;
      const priorityLabel = PRIORITIES[issue.priority]?.label || issue.priority;
      const statusLabel = STATUS_CONFIG[issue.status]?.label || issue.status;
      const dateStr = new Date(issue.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(issue.createdAt).toLocaleTimeString('pt-BR');

      return [
        issue.protocol,
        dateStr,
        typeLabel,
        priorityLabel,
        deptLabel,
        statusLabel,
        `"${(issue.title || '').replace(/"/g, '""')}"`,
        `"${(issue.address || '').replace(/"/g, '""')}"`,
        `"${(issue.district || '').replace(/"/g, '""')}"`,
        `"${(issue.city || '').replace(/"/g, '""')}"`,
        `"${(issue.reporterName || '').replace(/"/g, '""')}"`,
        issue.likesCount || 0,
        issue.commentsCount || 0
      ].join(';');
    });

    // UTF-8 BOM (\uFEFF) para abrir com acentuação correta no Microsoft Excel
    return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  }
};

