/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IssueType = 
  | 'pothole'         // Buraco / Pavimentação
  | 'flooding'        // Alagamento / Drenagem
  | 'power_outage'    // Queda de Energia
  | 'fire'            // Foco de Incêndio / Queimada
  | 'light_failure'   // Iluminação Pública
  | 'garbage'         // Lixo / Entulho
  | 'sanitation'      // Esgoto / Vazamento de Água
  | 'traffic_sign'    // Sinalização / Semáforo Danificado
  | 'accessibility'   // Calçada / Acessibilidade
  | 'other';          // Outro

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueStatus = 'pending' | 'in_progress' | 'solved' | 'rejected';

export type MunicipalDepartment = 
  | 'obras'          // Secretaria de Obras e Infraestrutura
  | 'iluminacao'     // Departamento de Iluminação Pública
  | 'limpeza'        // Limpeza Urbana e Coleta
  | 'defesa_civil'   // Defesa Civil Municipal
  | 'transito'       // Secretaria de Mobilidade e Trânsito
  | 'saneamento'     // Companhia de Água e Saneamento
  | 'meio_ambiente'  // Secretaria do Meio Ambiente
  | 'geral';         // Gabinete de Zeladoria Geral

export interface TimelineEntry {
  id: string;
  timestamp: number;
  authorName: string;
  authorRole: 'citizen' | 'gov_official' | 'system';
  action: string;
  notes?: string;
  statusFrom?: IssueStatus;
  statusTo?: IssueStatus;
}

export interface UrbanIssue {
  id: string;
  protocol: string;                  // Ex: PROT-2026-84920
  type: IssueType;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  district?: string;                 // Bairro
  city?: string;                     // Cidade
  imageUrl?: string;
  reporterId: string;
  reporterName: string;
  createdAt: number;
  updatedAt?: number;
  status: IssueStatus;
  priority: IssuePriority;
  department: MunicipalDepartment;
  likesCount: number;
  likedBy: string[];
  commentsCount?: number;
  officialResponse?: {
    text: string;
    responderName: string;
    department: string;
    updatedAt: number;
  };
  timeline?: TimelineEntry[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  text: string;
  createdAt: number;
  isOfficial?: boolean;              // Se o comentário é uma resposta oficial da prefeitura
  officialDepartment?: string;
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  suggestedType: IssueType;
  suggestedPriority: IssuePriority;
  suggestedDepartment: MunicipalDepartment;
  justification: string;
}
