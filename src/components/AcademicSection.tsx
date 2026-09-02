/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Building2, 
  Map as MapIcon, 
  Zap, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Workflow, 
  Users,
  Award,
  BookOpen
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '../constants';

export function AcademicSection() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Banner Principal do TCC */}
      <div className="text-center space-y-4 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20">
          <MapIcon className="text-white" size={32} />
        </div>
        <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-wider">
          Trabalho de Conclusão de Curso (TCC)
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{APP_NAME}</h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Sistema Integrado de Gestão Urbana, Zeladoria Pública e Participação Cidadã com Geolocalização e Inteligência Artificial.
        </p>
        <div className="pt-2 text-xs text-slate-400 font-mono">
          Versão do Protótipo: {APP_VERSION} &bull; Curso de Análise e Desenvolvimento de Sistemas
        </div>
      </div>

      {/* Conteúdo Acadêmico Estruturado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 01. Contexto e Justificativa */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              01
            </span>
            <h3 className="font-bold text-lg text-slate-900">Justificativa & Problema</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            A infraestrutura urbana nas cidades brasileiras enfrenta desafios constantes de manutenção: buracos em vias, alagamentos por drenagem deficiente, descarte irregular de lixo e falhas de iluminação pública.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Os canais tradicionais de atendimento (telefone e formulários estáticos) sofrem com lentidão, falta de rastreabilidade e ausência de dados georreferenciados para tomada de decisão no poder público.
          </p>
        </div>

        {/* 02. Objetivo Geral */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
              02
            </span>
            <h3 className="font-bold text-lg text-slate-900">Objetivo do Projeto</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Desenvolver uma plataforma web colaborativa em tempo real (GovTech) que capacite os cidadãos a registrarem ocorrências georreferenciadas e forneça à Prefeitura um painel inteligente de triagem, despacho e auditoria pública.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Geração automática de protocolo municipal oficial;</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Triagem e classificação automática com Inteligência Artificial;</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Rastreabilidade de despachos e transparência na zeladoria.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Arquitetura Tecnológica e Stack */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
            03
          </span>
          <h3 className="font-bold text-lg text-slate-900">Arquitetura de Software e Tecnologias</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
              <Layers size={16} /> Frontend SPA
            </div>
            <p className="text-xs text-slate-600 font-medium">
              React 19, TypeScript, Tailwind CSS v4, Motion (animações fluidas) e Lucide Icons.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
              <MapIcon size={16} /> GIS & Mapas
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Leaflet, React-Leaflet, OpenStreetMap e Nominatim API para geocodificação reversa.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase">
              <Building2 size={16} /> Backend Serverless
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Google Firebase Firestore (banco NoSQL em tempo real), Firebase Auth e Security Rules.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase">
              <Sparkles size={16} /> IA & Smart Cities
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Google Gemini 2.5 Flash via SDK oficial para estruturação semântica e despachos.
            </p>
          </div>
        </div>
      </div>

      {/* Alinhamento com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="text-blue-400" size={24} />
          <div>
            <h3 className="font-bold text-lg">Alinhamento com a Agenda 2030 da ONU</h3>
            <p className="text-xs text-blue-200">Contribuição do projeto para as metas globais de sustentabilidade e governança</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Award size={18} /> ODS 11 &bull; Cidades e Comunidades Sustentáveis
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Meta 11.3 e 11.b: Fortalecer a urbanização inclusiva e sustentável, o planejamento participativo e a resiliência urbana frente a desastres e alagamentos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
              <ShieldCheck size={18} /> ODS 16 &bull; Paz, Justiça e Instituições Eficazes
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Meta 16.6 e 16.7: Desenvolver instituições eficazes, responsáveis e transparentes em todos os níveis, garantindo a tomada de decisão inclusiva e participativa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
