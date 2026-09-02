/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { AIAnalysisResult, IssueType, IssuePriority, MunicipalDepartment } from '../types';

// Fallback key lookup
const getApiKey = () => {
  return (
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  );
};

export const geminiService = {
  /**
   * Analisa um relato informal do cidadão e extrai campos padronizados para a gestão pública
   */
  analyzeUrbanIssue: async (rawInput: {
    description: string;
    address?: string;
    imageContext?: string;
  }): Promise<AIAnalysisResult> => {
    const apiKey = getApiKey();

    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
Você é uma Inteligência Artificial especializada em Zeladoria Urbana, Triagem de Ocorrências e Gestão Pública Municipal (Smart Cities).
Analise o relato do cidadão abaixo e forneça uma estruturação técnica formal para a Prefeitura.

Relato do cidadão: "${rawInput.description}"
Endereço informado: "${rawInput.address || 'Não informado'}"

Você deve responder ESTRITAMENTE em formato JSON com as seguintes chaves:
{
  "title": "Título conciso e formal do problema (ex: Buraco de Grande Porte na Pista de Rolamento)",
  "description": "Descrição técnica clara, corrigida e objetiva para ordem de serviço",
  "suggestedType": "um de: 'pothole', 'flooding', 'light_failure', 'garbage', 'sanitation', 'traffic_sign', 'accessibility', 'fire', 'power_outage', 'other'",
  "suggestedPriority": "um de: 'low', 'medium', 'high', 'urgent'",
  "suggestedDepartment": "um de: 'obras', 'iluminacao', 'limpeza', 'defesa_civil', 'transito', 'saneamento', 'meio_ambiente', 'geral'",
  "justification": "Breve justificativa técnica do porquê da prioridade e secretaria escolhida"
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            title: parsed.title || 'Ocorrência Urbana Registrada',
            description: parsed.description || rawInput.description,
            suggestedType: (parsed.suggestedType as IssueType) || 'other',
            suggestedPriority: (parsed.suggestedPriority as IssuePriority) || 'medium',
            suggestedDepartment: (parsed.suggestedDepartment as MunicipalDepartment) || 'geral',
            justification: parsed.justification || 'Classificado com base no relato do usuário.'
          };
        }
      } catch (error) {
        console.warn('Erro ao consultar Gemini API, utilizando fallback inteligente local:', error);
      }
    }

    // Heuristic Smart Fallback (Offline or without API key)
    return fallbackAnalysis(rawInput.description);
  },

  /**
   * Gera um despacho técnico oficial da Prefeitura sugerido pela IA
   */
  generateOfficialDispatch: async (issue: {
    title: string;
    type: string;
    priority: string;
    department: string;
    address: string;
  }): Promise<string> => {
    const apiKey = getApiKey();

    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
Gere uma nota técnica/despacho oficial curto e formal da Prefeitura Municipal informando o cidadão sobre o andamento da ocorrência:
- Título: ${issue.title}
- Tipo: ${issue.type}
- Prioridade: ${issue.priority}
- Secretaria Responsável: ${issue.department}
- Local: ${issue.address}

Exemplo de formato: "Ordem de serviço gerada e direcionada à equipe de manutenção técnica da [Secretaria]. Previsão de vistoria no local em até 48 horas úteis."
Responda apenas com o texto do despacho formal em 1 ou 2 parágrafos.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return response.text?.trim() || `Ordem de serviço aberta e encaminhada para a equipe técnica da secretaria competente para vistoria no local.`;
      } catch (error) {
        console.warn('Fallback para despacho oficial:', error);
      }
    }

    return `Ordem de serviço registrada sob triagem prioritária. Equipe técnica da secretaria designada para vistoria no local nas próximas 48h.`;
  }
};

/**
 * Análise heurística em português para demonstrações e testes offline
 */
function fallbackAnalysis(description: string): AIAnalysisResult {
  const lower = description.toLowerCase();

  let type: IssueType = 'other';
  let department: MunicipalDepartment = 'geral';
  let priority: IssuePriority = 'medium';
  let title = 'Registro de Ocorrência Urbana';
  let justification = 'Análise semântica padrão com base nos termos-chave do relato.';

  if (lower.includes('buraco') || lower.includes('cratera') || lower.includes('asfalto') || lower.includes('pavimento')) {
    type = 'pothole';
    department = 'obras';
    title = 'Reparo Asfáltico / Tapa-Buraco';
    priority = lower.includes('grande') || lower.includes('acidente') || lower.includes('carro') ? 'high' : 'medium';
    justification = 'Danos no pavimento asfáltico requerem equipe de recapeamento da Secretaria de Obras.';
  } else if (lower.includes('alagamento') || lower.includes('inunda') || lower.includes('boca de lobo') || lower.includes('bueiro')) {
    type = 'flooding';
    department = 'defesa_civil';
    title = 'Alagamento / Desobstrução de Drenagem Pluvial';
    priority = 'urgent';
    justification = 'Risco iminente de prejuízo material e segurança dos transeuntes e moradores.';
  } else if (lower.includes('luz') || lower.includes('poste') || lower.includes('escuro') || lower.includes('lâmpada')) {
    type = 'light_failure';
    department = 'iluminacao';
    title = 'Manutenção de Iluminação Pública';
    priority = 'medium';
    justification = 'Pontos escuros comprometem a segurança pública noturna no bairro.';
  } else if (lower.includes('lixo') || lower.includes('entulho') || lower.includes('descarte') || lower.includes('sujeira')) {
    type = 'garbage';
    department = 'limpeza';
    title = 'Remoção de Entulho e Limpeza Urbana';
    priority = 'medium';
    justification = 'Acúmulo de detritos em via pública com risco de proliferação de vetores.';
  } else if (lower.includes('vazamento') || lower.includes('esgoto') || lower.includes('água limpa') || lower.includes('cano')) {
    type = 'sanitation';
    department = 'saneamento';
    title = 'Vazamento de Rede / Reparo de Saneamento';
    priority = 'high';
    justification = 'Desperdício hídrico ou contaminação ambiental sob responsabilidade da companhia de saneamento.';
  } else if (lower.includes('fogo') || lower.includes('queimada') || lower.includes('incêndio') || lower.includes('fumaça')) {
    type = 'fire';
    department = 'defesa_civil';
    title = 'Foco de Queimada / Incêndio em Vegetação';
    priority = 'urgent';
    justification = 'Risco direto à vida, saúde respiratória e estruturas vizinhas.';
  } else if (lower.includes('semáforo') || lower.includes('sinal') || lower.includes('placa') || lower.includes('trânsito')) {
    type = 'traffic_sign';
    department = 'transito';
    title = 'Falha em Sinalização / Semáforo de Trânsito';
    priority = 'high';
    justification = 'Comprometimento da fluidez e segurança do tráfego veicular e de pedestres.';
  } else if (lower.includes('calçada') || lower.includes('cadeirante') || lower.includes('rampa') || lower.includes('acessibilidade')) {
    type = 'accessibility';
    department = 'obras';
    title = 'Adequação de Calçada e Acessibilidade';
    priority = 'low';
    justification = 'Necessidade de reforma para garantir livre circulação e acessibilidade universal.';
  } else if (lower.includes('energia') || lower.includes('apagão') || lower.includes('fio') || lower.includes('curto')) {
    type = 'power_outage';
    department = 'iluminacao';
    title = 'Queda de Energia / Fiação Elétrica Exposta';
    priority = 'urgent';
    justification = 'Interrupção de serviço essencial e risco de choque elétrico em via pública.';
  }

  return {
    title,
    description: description.trim() || 'Ocorrência registrada no sistema de zeladoria.',
    suggestedType: type,
    suggestedPriority: priority,
    suggestedDepartment: department,
    justification
  };
}
