/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeocodingResult {
  address: string;
  road?: string;
  suburb?: string;       // Bairro
  city?: string;         // Cidade
  state?: string;        // Estado
  postcode?: string;     // CEP
  lat: number;
  lng: number;
}

export const geocodingService = {
  /**
   * Converte coordenadas Lat/Lng em endereço real usando OpenStreetMap Nominatim
   */
  reverseGeocode: async (lat: number, lng: number): Promise<GeocodingResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.statusText}`);
      }

      const data = await response.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.street || addr.footway || '';
      const houseNumber = addr.house_number ? `, ${addr.house_number}` : '';
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || '';
      const city = addr.city || addr.town || addr.municipality || addr.village || 'São Paulo';
      const state = addr.state ? ` - ${addr.state}` : '';

      let formatted = '';
      if (road) {
        formatted += `${road}${houseNumber}`;
        if (suburb) formatted += ` - ${suburb}`;
        if (city) formatted += `, ${city}${state}`;
      } else if (suburb) {
        formatted = `${suburb}, ${city}${state}`;
      } else if (data.display_name) {
        const parts = data.display_name.split(',').slice(0, 3);
        formatted = parts.join(', ');
      } else {
        formatted = `Coord: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      return {
        address: formatted,
        road,
        suburb,
        city,
        state: addr.state,
        postcode: addr.postcode,
        lat,
        lng,
      };
    } catch (error) {
      console.warn('Falha no reverse geocoding OSM, usando fallback de coordenadas:', error);
      return {
        address: `Localização (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng,
      };
    }
  },

  /**
   * Busca um endereço por texto digitado
   */
  searchAddress: async (query: string): Promise<GeocodingResult[]> => {
    if (!query.trim() || query.length < 3) return [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=br&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      return data.map((item: any) => ({
        address: item.display_name,
        road: item.address?.road,
        suburb: item.address?.suburb || item.address?.neighbourhood,
        city: item.address?.city || item.address?.town,
        state: item.address?.state,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    } catch (error) {
      console.warn('Falha na busca de endereço OSM:', error);
      return [];
    }
  }
};
