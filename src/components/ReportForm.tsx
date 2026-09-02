/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ISSUE_TYPES, PRIORITIES, DEPARTMENTS } from '../constants';
import { IssueType, IssuePriority, MunicipalDepartment } from '../types';
import { MapPin, Camera, Sparkles, Navigation, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { geocodingService } from '../services/geocodingService';
import { geminiService } from '../services/geminiService';

interface ReportFormProps {
  onSubmit: (data: any) => void;
  initialLocation?: { lat: number; lng: number };
}

export function ReportForm({ onSubmit, initialLocation }: ReportFormProps) {
  const [type, setType] = useState<IssueType>('pothole');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [department, setDepartment] = useState<MunicipalDepartment>('obras');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialLocation || { lat: -23.5505, lng: -46.6333 });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiJustification, setAiJustification] = useState<string | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Atualizar departamento padrão quando mudar a categoria manualmente
  useEffect(() => {
    const selectedTypeConfig = ISSUE_TYPES.find(t => t.type === type);
    if (selectedTypeConfig) {
      setDepartment(selectedTypeConfig.defaultDepartment);
    }
  }, [type]);

  // Geocodificação reversa quando a localização inicial ou clicada no mapa for recebida
  useEffect(() => {
    if (initialLocation) {
      setCoords(initialLocation);
      setIsGeocoding(true);
      geocodingService.reverseGeocode(initialLocation.lat, initialLocation.lng)
        .then(result => {
          setAddress(result.address);
          if (result.suburb) setDistrict(result.suburb);
          if (result.city) setCity(result.city);
        })
        .finally(() => setIsGeocoding(false));
    }
  }, [initialLocation]);

  // Capturar GPS do dispositivo
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setIsGeocoding(true);
        try {
          const result = await geocodingService.reverseGeocode(lat, lng);
          setAddress(result.address);
          if (result.suburb) setDistrict(result.suburb);
          if (result.city) setCity(result.city);
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeocoding(false);
          setIsGettingGps(false);
        }
      },
      (err) => {
        alert('Não foi possível obter sua localização GPS. Verifique as permissões.');
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Assistente de IA com Gemini
  const handleAnalyzeWithAi = async () => {
    if (!description.trim()) {
      alert('Por favor, escreva uma breve descrição do problema antes de consultar a IA.');
      return;
    }

    setIsAnalyzingAi(true);
    try {
      const result = await geminiService.analyzeUrbanIssue({
        description,
        address
      });

      if (result.title) setTitle(result.title);
      if (result.description) setDescription(result.description);
      if (result.suggestedType) setType(result.suggestedType);
      if (result.suggestedPriority) setPriority(result.suggestedPriority);
      if (result.suggestedDepartment) setDepartment(result.suggestedDepartment);
      if (result.justification) setAiJustification(result.justification);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIM = 800;
          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setImagePreview(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Preencha o título e a descrição do relato.');
      return;
    }

    const reportData: any = {
      type,
      priority,
      department,
      title: title.trim(),
      description: description.trim(),
      location: coords,
      address: address || `Coordenadas: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      district: district || undefined,
      city: city || undefined,
    };

    if (imagePreview) reportData.imageUrl = imagePreview;

    onSubmit(reportData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-900">
      {/* Categoria do Problema Urbano */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Tipo de Ocorrência Pública
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {ISSUE_TYPES.map((it) => (
            <button
              key={it.type}
              type="button"
              onClick={() => setType(it.type)}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left group",
                type === it.type 
                  ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                  : "bg-slate-50 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-white"
              )}
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: type === it.type ? 'rgba(255,255,255,0.2)' : it.bgColor, color: type === it.type ? '#fff' : it.color }}
              >
                <it.icon size={15} />
              </div>
              <span className="text-[11px] font-bold leading-tight">{it.label.split('/')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descrição e Botão de IA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Descrição do Problema
          </label>
          <button
            type="button"
            onClick={handleAnalyzeWithAi}
            disabled={isAnalyzingAi || !description.trim()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all disabled:opacity-40"
            title="A Inteligência Artificial padroniza o título, categoria, prioridade e secretaria municipal"
          >
            {isAnalyzingAi ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>{isAnalyzingAi ? 'Analisando...' : '🪄 Estruturar com IA'}</span>
          </button>
        </div>
        <textarea 
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Tem um buraco fundo na rua após as chuvas que está rasgando pneus dos carros..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none"
          required
        />

        {aiJustification && (
          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200/80 p-3 rounded-xl text-[11px] text-purple-900">
            <CheckCircle2 size={15} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">IA GovTech Sugeriu:</span>
              <p>{aiJustification}</p>
            </div>
          </div>
        )}
      </div>

      {/* Título do Relato */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Título Formal</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Buraco de grande porte na via pública"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          required
        />
      </div>

      {/* Prioridade e Secretaria */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Prioridade</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as IssuePriority)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente / Risco</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Secretaria Prevista</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as MunicipalDepartment)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-900"
          >
            {Object.values(DEPARTMENTS).map(d => (
              <option key={d.id} value={d.id}>{d.shortName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Endereço e GPS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Localização e Endereço</label>
          <button
            type="button"
            onClick={handleGetGpsLocation}
            disabled={isGettingGps}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <Navigation size={12} className={cn(isGettingGps && "animate-spin")} />
            <span>{isGettingGps ? 'Buscando GPS...' : 'Usar meu GPS'}</span>
          </button>
        </div>
        
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={isGeocoding ? "Identificando endereço via satélite..." : "Rua, número, bairro ou referência"}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
        <p className="text-[10px] text-slate-400">
          Coordenadas: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      </div>

      {/* Upload de Foto */}
      <div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-500 gap-2 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden min-h-[100px]"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
          ) : (
            <>
              <Camera size={22} className="text-slate-400" />
              <span className="text-xs font-semibold">Adicionar Foto do Local (Opcional)</span>
            </>
          )}
        </div>
      </div>

      {/* Botão de Envio */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
      >
        Registrar Chamado Oficial
      </button>
    </form>
  );
}
