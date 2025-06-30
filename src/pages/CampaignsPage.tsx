import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns, useCampaignOperations } from '../hooks/useCampaigns';
import { Plus, Send, Edit, Trash2, Play, Pause, Loader2, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';

export const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, loading, error, refetch } = useCampaigns();
  const { deleteCampaign, updateCampaign, loading: isOperating } = useCampaignOperations();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a campanha "${name}"?`)) {
      await deleteCampaign(id);
      toast.success("Campanha excluída com sucesso.");
      refetch();
    }
  };

  const toggleCampaignStatus = async (id: string, currentStatus: boolean) => {
    await updateCampaign(id, { is_active: !currentStatus });
    toast.info(`Campanha ${!currentStatus ? 'ativada' : 'pausada'}.`);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campanhas</h1>
          <p className="text-sm text-gray-400">Crie e gerencie suas campanhas de coleta de feedback.</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/create')}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-lemon text-gray-900 hover:bg-lemon-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Campanha</span>
        </button>
      </div>
      
      <div className="p-4 rounded-lg" style={{ backgroundColor: '#232323' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Nome da Campanha</th>
                <th scope="col" className="px-6 py-3">QR Code Vinculado</th>
                <th scope="col" className="px-6 py-3">Período</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center p-8 text-red-400">Erro ao carregar campanhas: {error}</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8">Nenhuma campanha encontrada.</td></tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="border-b border-gray-700/50 hover:bg-gray-800/40">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {campaign.is_active ? 'Ativa' : 'Pausada'}
                      </span>
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{campaign.name}</th>
                    <td className="px-6 py-4 flex items-center gap-2"><QrCode className="h-4 w-4 text-gray-500"/>{campaign.qr_codes?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('pt-BR') : 'N/A'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('pt-BR') : 'Contínuo'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => toggleCampaignStatus(campaign.id, campaign.is_active)} disabled={isOperating} className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50" title={campaign.is_active ? 'Pausar' : 'Ativar'}>
                        {campaign.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button disabled={isOperating} className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(campaign.id, campaign.name)} disabled={isOperating} className="p-2 hover:bg-red-900/50 text-red-500 rounded-lg disabled:opacity-50" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
