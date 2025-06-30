import React from 'react';
import { MessageSquare, Star, User, Loader2 } from 'lucide-react';
import { useRecentFeedbacks, type Feedback } from '../../hooks/useFeedbacks';

// Função auxiliar para formatar o tempo relativo (pode ser movida para um arquivo de utils no futuro)
function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `agora mesmo`;
  
  const intervals: { [key: string]: number } = {
    ano: 31536000,
    mês: 2592000,
    dia: 86400,
    hora: 3600,
    minuto: 60
  };

  for (const intervalName in intervals) {
    const interval = Math.floor(seconds / intervals[intervalName]);
    if (interval >= 1) {
      const plural = interval > 1 ? 's' : '';
      return `há ${interval} ${intervalName}${plural}`;
    }
  }
  return `há ${Math.floor(seconds)} segundos`;
}

export const RecentFeedbacksCard: React.FC = () => {
  // A LÓGICA AGORA VIVE AQUI DENTRO, ONDE DEVERIA ESTAR.
  const { recentFeedbacks, loading } = useRecentFeedbacks(5);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? 'text-lemon fill-current' : 'text-gray-600'}`} />
    ));
  };

  return (
    <div className="p-6 rounded-lg h-96 flex flex-col" style={{ backgroundColor: '#161616' }}>
      <h3 className="text-lg font-semibold text-white mb-4">Últimos Feedbacks Recebidos</h3>
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : recentFeedbacks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <MessageSquare className="h-12 w-12 mb-2" />
          <p>Nenhum feedback recebido ainda.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {recentFeedbacks.map((feedback: Feedback) => (
            <div key={feedback.id} className="flex items-start space-x-4 p-2 rounded-lg hover:bg-gray-800/50">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white truncate">{feedback.customer_name || 'Anônimo'}</p>
                  <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{timeAgo(feedback.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 my-1">
                  {renderStars(feedback.rating)}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{feedback.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};