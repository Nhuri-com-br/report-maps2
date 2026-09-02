/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { UrbanIssue } from '../types';
import { ISSUE_TYPES, MAP_LAYERS, STATUS_CONFIG, PRIORITIES } from '../constants';
import { Layers, Navigation, Search, Eye, AlertTriangle, ShieldCheck, Flame, Droplets, Lightbulb, Trash2, Waves, Signpost, Footprints, Zap, Info } from 'lucide-react';
import { geocodingService, GeocodingResult } from '../services/geocodingService';
import { cn } from '../lib/utils';
import L from 'leaflet';

function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || 14, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ 
  issues, 
  onSelectIssue, 
  onMapClick 
}: { 
  issues: UrbanIssue[], 
  onSelectIssue?: (issue: UrbanIssue) => void,
  onMapClick?: (lat: number, lng: number) => void
}) {
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]); // São Paulo
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showDensity, setShowDensity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  const activeLayer = MAP_LAYERS[activeLayerIndex];

  // Auto-ajustar centro para primeira ocorrência se houver
  useEffect(() => {
    if (issues.length > 0 && issues[0].location) {
      setCenter([issues[0].location.lat, issues[0].location.lng]);
    }
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada.');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setIsLocatingUser(false);
      },
      () => {
        alert('Não foi possível obter sua localização GPS.');
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await geocodingService.searchAddress(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: GeocodingResult) => {
    setCenter([res.lat, res.lng]);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Barra de Busca de Endereço no Mapa */}
      <div className="absolute top-4 left-4 z-[1000] w-72 sm:w-80">
        <form onSubmit={handleSearchAddress} className="relative shadow-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar rua, bairro ou cidade..."
            className="w-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </form>

        {/* Resultados de Busca */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left p-3 hover:bg-blue-50 text-xs text-slate-700 transition-colors flex items-center gap-2"
              >
                <Search size={14} className="text-blue-500 shrink-0" />
                <span className="truncate">{res.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles Flutuantes do Mapa (GPS, Camadas e Densidade) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Botão GPS */}
        <button
          onClick={handleLocateMe}
          title="Minha Localização GPS"
          className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white transition-all active:scale-95"
        >
          <Navigation size={18} className={cn(isLocatingUser && "animate-spin text-blue-600")} />
        </button>

        {/* Alternador de Camadas (Satélite / OSM / Dark) */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Alterar Camada do Mapa"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white transition-all active:scale-95"
          >
            <Layers size={18} />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 w-48 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Camadas do Mapa
              </span>
              {MAP_LAYERS.map((layer, idx) => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setActiveLayerIndex(idx);
                    setShowLayerMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors",
                    activeLayerIndex === idx ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {layer.name}
                </button>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowDensity(!showDensity)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between",
                    showDensity ? "bg-purple-100 text-purple-800" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>Mancha de Calor</span>
                  <span className="text-[10px]">{showDensity ? 'Ligado' : 'Desligado'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instância Principal do Mapa Leaflet */}
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
      >
        <TileLayer
          key={activeLayer.id}
          attribution={activeLayer.attribution}
          url={activeLayer.url}
        />
        
        <MapController center={center} />
        <MapEvents onMapClick={onMapClick} />

        {/* Círculos de Densidade / Hotspots Urbanos */}
        {showDensity && issues.map(issue => (
          <Circle
            key={`density-${issue.id}`}
            center={[issue.location.lat, issue.location.lng]}
            radius={issue.priority === 'urgent' ? 600 : 350}
            pathOptions={{
              color: issue.priority === 'urgent' ? '#DC2626' : '#3B82F6',
              fillColor: issue.priority === 'urgent' ? '#DC2626' : '#3B82F6',
              fillOpacity: 0.25,
              weight: 1
            }}
          />
        ))}

        {/* Marcadores Interativos das Ocorrências */}
        {issues.map(issue => {
          const config = ISSUE_TYPES.find(t => t.type === issue.type) || ISSUE_TYPES[0];
          const isUrgent = issue.priority === 'urgent';
          const isSolved = issue.status === 'solved';

          const statusRingColor = isSolved ? '#16A34A' : issue.status === 'in_progress' ? '#2563EB' : '#EAB308';

          // Marcador HTML estilizado com pulse e anel de status
          const customIcon = L.divIcon({
            html: `
              <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                ${isUrgent && !isSolved ? '<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(220, 38, 38, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
                <div style="width: 30px; height: 30px; border-radius: 50%; background: ${config.color}; border: 3px solid ${statusRingColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px;">
                  <span>●</span>
                </div>
              </div>
            `,
            className: 'custom-urban-marker',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          return (
            <Marker 
              key={issue.id} 
              position={[issue.location.lat, issue.location.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => onSelectIssue?.(issue),
              }}
            >
              <Popup className="urban-popup">
                <div className="p-1 space-y-2 max-w-[220px] text-slate-900 font-sans">
                  {issue.imageUrl && (
                    <img src={issue.imageUrl} alt={issue.title} className="w-full h-24 object-cover rounded-xl shadow-sm" />
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {issue.protocol}
                    </span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", STATUS_CONFIG[issue.status].badgeClass)}>
                      {STATUS_CONFIG[issue.status].label}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs leading-snug">{issue.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{issue.description}</p>
                  <button
                    onClick={() => onSelectIssue?.(issue)}
                    className="w-full bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Ver Detalhes do Chamado
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

