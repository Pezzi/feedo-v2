import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Phone, Mail, Award, TrendingUp, Shield, Verified, Crown, Globe, Instagram, Facebook, Linkedin, MessageSquare
} from 'lucide-react';
import { useProviders, type Provider, type ProviderFilters } from '../hooks/useProviders';
import { useIBGE, type IBGEState, type IBGECity, type IBGECnaeClass } from '../hooks/useIBGE';

const ProviderCard: React.FC<{ provider: Provider }> = ({ provider }) => {
  const PlanIcon = provider.plan === 'enterprise' ? Crown : provider.plan === 'premium' ? Award : Shield;
  
  return (
    <div className="rounded-lg bg-[#232323] transition-transform duration-300 hover:scale-[1.02] flex flex-col shadow-lg border border-gray-700/50 hover:border-lemon/30">
      <div className="relative h-32 bg-gray-700 rounded-t-lg">
        {provider.cover_image_url ? (
          <img src={provider.cover_image_url} alt={provider.business_name || provider.name} className="w-full h-full object-cover rounded-t-lg" />
        ) : <div className="w-full h-full bg-gray-800 rounded-t-lg"></div> }
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 bg-lemon text-gray-900">
          <PlanIcon className="h-3 w-3" />
          <span>{provider.plan}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative w-16 h-16 mt-[-48px] flex-shrink-0">
            <img 
              src={provider.avatar_url || 'https://via.placeholder.com/150?text=Logo'} 
              alt={provider.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-[#232323]"
            />
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold truncate text-white">{provider.business_name || provider.name}</h3>
              {provider.is_verified && <Verified className="h-4 w-4 flex-shrink-0 text-lemon" />}
            </div>
            <p className="text-sm truncate text-gray-400">{provider.segment}</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">{provider.description}</p>
        <div className="grid grid-cols-2 gap-3 mb-4 text-center">
            <div className="space-y-1"><p className="font-bold text-white">{provider.rating?.toFixed(1) || 'N/A'}</p><p className="text-xs text-gray-400 flex items-center justify-center gap-1"><Star className="h-3 w-3 text-lemon"/>Avaliação</p></div>
            <div className="space-y-1"><p className="font-bold text-white">{provider.nps_score ?? 'N/A'}</p><p className="text-xs text-gray-400 flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3 text-lemon"/>NPS</p></div>
        </div>
        <div className="pt-4 mt-auto border-t border-gray-700/60">
          <div className="flex items-center justify-center space-x-3">
            {provider.website_url && <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-lemon" title="Website"><Globe className="h-5 w-5" /></a>}
            {provider.instagram_url && <a href={provider.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-lemon" title="Instagram"><Instagram className="h-5 w-5" /></a>}
            {provider.facebook_url && <a href={provider.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-lemon" title="Facebook"><Facebook className="h-5 w-5" /></a>}
            {provider.linkedin_url && <a href={provider.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-lemon" title="LinkedIn"><Linkedin className="h-5 w-5" /></a>}
            {provider.phone && <a href={`tel:${provider.phone}`} className="p-2 text-gray-400 hover:text-lemon" title="Telefone"><Phone className="h-5 w-5" /></a>}
            {provider.email && <a href={`mailto:${provider.email}`} className="p-2 text-gray-400 hover:text-lemon" title="Email"><Mail className="h-5 w-5" /></a>}
          </div>
        </div>
      </div>
    </div>
  );
};


export const Veepo: React.FC = () => {
  const [filters, setFilters] = useState<ProviderFilters>({ sortBy: 'ranking' });
  const { providers, loading, error } = useProviders(filters);

  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [cnaeClasses, setCnaeClasses] = useState<IBGECnaeClass[]>([]);
  
  const { fetchStates, fetchCitiesByState, fetchCNAEClasses, loadingCities } = useIBGE();

  useEffect(() => {
    const loadInitialData = async () => {
      setStates(await fetchStates());
      setCnaeClasses(await fetchCNAEClasses());
    };
    loadInitialData();
  }, [fetchStates, fetchCNAEClasses]);

  useEffect(() => {
    if (filters.state) {
      fetchCitiesByState(filters.state).then(setCities);
    } else {
      setCities([]); 
    }
  }, [filters.state, fetchCitiesByState]);

  const handleFilterChange = (key: keyof ProviderFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'state') {
      newFilters.city = '';
    }
    setFilters(newFilters);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Veepo</h1>
        <p className="text-sm text-gray-400">Encontre os melhores prestadores de serviços da sua região</p>
      </div>

      <div className="space-y-4 p-6 rounded-lg" style={{backgroundColor: '#232323'}}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input type="text" value={filters.searchQuery || ''} onChange={(e) => handleFilterChange('searchQuery', e.target.value)} placeholder="Buscar por nome, negócio ou segmento..." className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-lemon"/>
            </div>
            
            <select value={filters.state || ''} onChange={(e) => handleFilterChange('state', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-white border-gray-700 border focus:outline-none focus:ring-2 focus:ring-lemon">
              <option value="">Todos os Estados</option>
              {states.map(state => (<option key={state.id} value={state.sigla}>{state.nome}</option>))}
            </select>
            
            <select value={filters.city || ''} onChange={(e) => handleFilterChange('city', e.target.value)} disabled={!filters.state || loadingCities} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-white border-gray-700 border disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-lemon">
              <option value="">{loadingCities ? 'Carregando...' : 'Todas as Cidades'}</option>
              {cities.map(city => (<option key={city.id} value={city.nome}>{city.nome}</option>))}
            </select>

            <div>
              <input list="cnae-options" name="segment" value={filters.segment || ''} onChange={(e) => handleFilterChange('segment', e.target.value)} placeholder="Todos os Segmentos" className="w-full px-3 py-3 rounded-lg text-sm bg-gray-900 text-white border-gray-700 border focus:outline-none focus:ring-2 focus:ring-lemon" />
              <datalist id="cnae-options">
                {cnaeClasses.map(cnae => (<option key={cnae.id} value={cnae.descricao} />))}
              </datalist>
            </div>
        </div>
      </div>
      
      {loading && <div className="text-center text-white py-10">Carregando prestadores...</div>}
      {error && <div className="text-center text-red-400 py-10">Erro ao carregar dados: {error}</div>}

      {!loading && !error && (
        providers.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {providers.map((provider) => ( <ProviderCard key={provider.id} provider={provider} /> ))}
            </div>
        ) : (
            <div className="text-center text-gray-400 py-20">
                <h3 className="text-xl font-semibold">Nenhum prestador encontrado</h3>
                <p>Tente ajustar os seus filtros de busca.</p>
            </div>
        )
      )}
    </div>
  );
};