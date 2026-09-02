/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Building2, ShieldCheck, AlertCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { loginWithGoogle, loginAsDemoUser, AppUser } from '../lib/firebase';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: AppUser) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onClose();
      } else {
        // Se o domínio não estiver autorizado no Firebase ou popup bloqueado
        if (res.error?.includes('unauthorized-domain')) {
          setErrorMessage('O domínio atual ainda não foi adicionado nos "Authorized Domains" do Firebase Console. Você pode usar o Acesso Rápido abaixo com 1 clique!');
        } else if (res.error?.includes('popup-closed-by-user')) {
          setErrorMessage('A janela de login do Google foi fechada antes de concluir.');
        } else if (res.error?.includes('popup-blocked')) {
          setErrorMessage('O navegador bloqueou a janela pop-up do Google. Por favor, libere pop-ups ou use o Acesso Rápido abaixo.');
        } else {
          setErrorMessage(`Aviso do Firebase: ${res.error}. Utilize o Acesso Rápido abaixo para entrar sem restrições.`);
        }
      }
    } catch (err: any) {
      setErrorMessage('Não foi possível autenticar pelo Google. Use o Acesso Rápido abaixo para entrar instantaneamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'citizen' | 'admin', name: string, email: string) => {
    const user = loginAsDemoUser({
      name,
      email,
      role
    });
    if (onSuccess) onSuccess(user);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const email = customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '.')}@email.com`;
    const role = email.includes('admin') || email.includes('gov') ? 'admin' : 'citizen';
    
    const user = loginAsDemoUser({
      name: customName.trim(),
      email,
      role
    });
    if (onSuccess) onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/30">
              RM
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">Acessar o Report Maps</h3>
              <p className="text-[11px] text-slate-400 font-medium">Plataforma de Zeladoria &amp; Gestão Pública</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Aviso de Conexão</p>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Opção 1: Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-300 shadow-sm transition-all active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? 'Conectando ao Google...' : 'Entrar com Conta Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              ou Acesso Rápido para TCC
            </span>
          </div>

          {/* Perfis Rápidos Pré-configurados */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleQuickLogin('citizen', 'Yuri Dragoni', 'yuridragoni6@gmail.com')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
                  YD
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 leading-tight">Yuri Dragoni</p>
                    <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[8px] font-black uppercase">Autor TCC</span>
                  </div>
                  <p className="text-[10px] text-slate-500">yuridragoni6@gmail.com &bull; Administrador</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleQuickLogin('admin', 'Engenheiro Carlos Mendes', 'zeladoria.prefeitura@cidade.gov.br')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 leading-tight">Gestor Municipal</p>
                    <span className="px-1.5 py-0.2 bg-amber-600 text-white rounded text-[8px] font-black uppercase">Prefeitura</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Secretaria de Obras &bull; Gestão Pública</p>
                </div>
              </div>
              <ArrowRight size={15} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Alternar formulário personalizado */}
          <div>
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold py-1 transition-colors"
              >
                + Entrar com outro nome / visitante
              </button>
            ) : (
              <form onSubmit={handleCustomLogin} className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Santos"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: maria@email.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Entrar no Sistema
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
