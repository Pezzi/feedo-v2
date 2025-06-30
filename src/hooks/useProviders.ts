import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

// Interfaces
export interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  segment: string;
  description: string;
  avatar_url: string;
  cover_image_url: string;
  city: string;
  state: string;
  // Adicione outros campos que você precise
}

export interface ProviderFilters {
  searchQuery?: string;
  state?: string;
  city?: string;
  segment?: string;
  sortBy?: 'ranking' | 'rating' | 'reviews';
}

export const useProviders = (filters: ProviderFilters) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('providers').select('*');

      // Aplica filtros se eles existirem
      if (filters.searchQuery) {
        query = query.ilike('business_name', `%${filters.searchQuery}%`);
      }
      if (filters.state) {
        query = query.eq('state', filters.state);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.segment) {
        query = query.eq('segment', filters.segment);
      }
      
      // Adiciona ordenação (ainda simples, podemos complexificar depois)
      if (filters.sortBy === 'rating') {
        query = query.order('average_rating', { ascending: false });
      } else {
        // Ordenação padrão (pode ser por 'created_at' ou outro campo)
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      setProviders(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Re-executa quando os filtros mudam

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { providers, loading, error, refetch: fetchProviders };
};