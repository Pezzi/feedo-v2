import React, { useState } from 'react';
import { Archive, MessageSquare, Clock, CheckCircle, Star, RefreshCw } from 'lucide-react';
import { useFeedbacks } from '../hooks/useFeedbacks';
import { SentimentBadge } from '../components/dashboard/feedbacks/SentimentBadge';

// O componente StatCard continua aqui, mas não será usado por enquanto.
const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323' }}>
    {/* ...código do StatCard... */}
  </div>
);

export const Feedbacks: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active');
  
  // MUDANÇA: Removemos 'stats' da chamada do hook, pois ele não retorna mais isso.
  const { 
    feedbacks, 
    loading, 
    error, 
    setFilters,
    archiveFeedback, 
    unarchiveFeedback,
    refetch
  } = useFeedbacks({ 
    status: ['pending', 'responded']
  });

  const handleFilterClick = (filter: 'active' | 'archived') => {
    setActiveFilter(filter);
    if (filter === 'active') {
      setFilters({ status: ['pending', 'responded'] });
    } else {
      setFilters({ status: ['archived'] });
    }
  };

  if (error && !loading) {
    return <div className="p-6 text-red-400">Erro ao carregar feedbacks: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sistema de Feedbacks</h1>
        <p className="text-gray-400">Gerencie e responda aos feedbacks dos seus clientes.</p>
      </div>

      {/* MUDANÇA: O bloco inteiro de StatCards foi removido para evitar erros.
          Podemos adicionar estatísticas aqui novamente no futuro com um hook dedicado. */}

      <div className="p-6 rounded-lg" style={{ backgroundColor: '#161616' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-lg">
            <button 
              onClick={() => handleFilterClick('active')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeFilter === 'active' ? 'bg-lemon text-gray-900' : 'text-gray-400 hover:bg-gray-700/50'}`}
            >
              Ativos
            </button>
            <button 
              onClick={() => handleFilterClick('archived')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeFilter === 'archived' ? 'bg-lemon text-gray-900' : 'text-gray-400 hover:bg-gray-700/50'}`}
            >
              Arquivados
            </button>
          </div>
          <button onClick={refetch} disabled={loading} className="p-2 rounded-lg hover:bg-gray-700/50">
            <RefreshCw className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white">Carregando feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <p>Nenhum feedback {activeFilter === 'archived' ? 'arquivado' : 'ativo'} encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-x-3">
                    <p className="font-medium text-white">{feedback.customer_name || 'Anônimo'}</p>
                    <SentimentBadge sentiment={feedback.sentiment} />
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1 mt-1">{feedback.comment}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => activeFilter === 'archived' ? unarchiveFeedback(feedback.id) : archiveFeedback(feedback.id)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors bg-gray-700 hover:bg-gray-600"
                    title={activeFilter === 'archived' ? 'Desarquivar' : 'Arquivar'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};