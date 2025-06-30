import React, { useState } from 'react';
import { 
  TrendingUp, MessageSquare, Star, Activity, RefreshCw, Loader2 
} from 'lucide-react';
// MUDANÇA: 'useRecentFeedbacks' foi removido deste import.
import { useDashboardStats, useNpsTrend, useBenchmarkData } from '../hooks/useDashboard';
import { useAllFeedbacksForMap } from '../hooks/useFeedbacks';
import { RecentFeedbacksCard } from '../components/dashboard/RecentFeedbacksCard';
import { LocationMap } from '../components/maps/LocationMap';
import { NpsLineChart } from '../components/dashboard/NpsLineChart';
import { BenchmarkCard } from '../components/dashboard/BenchmarkCard';
import { type DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DateRangePicker } from '../components/dashboard/DateRangePicker';

const KPICard = ({ title, value, icon: Icon, format = 'number' }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  format?: 'number' | 'decimal';
}) => {
  const formattedValue = format === 'decimal' && typeof value === 'number' ? value.toFixed(1) : value;
  
  return (
    <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-lemon/10"><Icon className="h-6 w-6 text-lemon" /></div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-1 text-gray-400">{title}</h3>
        <p className="text-2xl font-bold text-white">{value === '...' ? '...' : formattedValue}</p>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats({ dateRange });
  const { trendData, loading: trendLoading, refetch: refetchTrend } = useNpsTrend({ dateRange });
  const { feedbacks: mapFeedbacks, loading: mapLoading, refetch: refetchMap } = useAllFeedbacksForMap({ dateRange });
  const { benchmarkData, loading: benchmarkLoading, refetch: refetchBenchmark } = useBenchmarkData();
  
  // MUDANÇA: A chamada para o hook de feedbacks recentes foi completamente removida daqui.

  const handleRefresh = () => {
    refetchStats();
    refetchTrend();
    refetchMap();
    refetchBenchmark();
    // A chamada para refetchRecent foi removida.
  };
  
  // MUDANÇA: O loading de feedbacks recentes foi removido.
  const isLoading = statsLoading || trendLoading || mapLoading || benchmarkLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Visão geral dos seus feedbacks e métricas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <button onClick={handleRefresh} disabled={isLoading} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total de Feedbacks" value={statsLoading ? '...' : stats?.totalFeedbacks ?? 0} icon={MessageSquare} />
        <BenchmarkCard
          title="Avaliação Média"
          icon={Star}
          loading={statsLoading || benchmarkLoading}
          userValue={stats?.averageRating}
          benchmarkValue={benchmarkData?.average_rating}
          format="decimal"
        />
        <KPICard title="QR Codes Ativos" value={statsLoading ? '...' : stats?.activeQrCodes ?? 0} icon={Activity} />
        <KPICard title="Feedbacks Pendentes" value={statsLoading ? '...' : stats?.pendingFeedbacks ?? 0} icon={TrendingUp} />
      </div>

      <div className="p-6 rounded-lg h-[500px] flex flex-col" style={{ backgroundColor: '#232323' }}>
        <h3 className="text-lg font-semibold text-white mb-4">Mapa de Feedbacks</h3>
        {mapLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando mapa...</span>
          </div>
        ) : (
          <LocationMap feedbacks={mapFeedbacks} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="p-6 rounded-lg h-96 flex flex-col" 
          style={{ backgroundColor: '#232323' }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Evolução do NPS</h3>
          {trendLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando gráfico...</span>
            </div>
          ) : trendData && trendData.length > 0 ? (
            <NpsLineChart chartData={trendData} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Não há dados suficientes para exibir o gráfico.
            </div>
          )}
        </div>
        
        {/* MUDANÇA: O componente agora é chamado sem props, ele se cuida sozinho. */}
        <RecentFeedbacksCard />
      </div>
    </div>
  );
};