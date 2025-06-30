import React, { useState } from 'react';
import { Plus, QrCode as QrCodeIcon, Edit, Trash2, Share, Eye, EyeOff, BarChart3, MessageSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useQRCodes, useQRCodeOperations, type QRCode } from '../hooks/useQRCodes';
import { toast } from 'react-toastify';
import { EditQRCodeModal } from '../components/modals/EditQRCodeModal';

export const QRCodes: React.FC = () => {
  const navigate = useNavigate();
  const { qrCodes, loading, error, refetch } = useQRCodes();
  const { deleteQRCode, loading: isDeleting } = useQRCodeOperations();

  // Estado para controlar o modal de edição
  const [editingQRCode, setEditingQRCode] = useState<QRCode | null>(null);

  const handleDelete = async (qrCodeId: string, qrCodeName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o QR Code "${qrCodeName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteQRCode(qrCodeId);
        toast.success(`QR Code "${qrCodeName}" excluído com sucesso!`);
        refetch();
      } catch (err) {
        toast.error("Erro ao excluir o QR Code.");
        console.error(err);
      }
    }
  };

  const handleShare = (url: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.info('URL do QR Code copiada para a área de transferência!');
    } else {
      toast.warn('Este QR Code ainda não possui uma URL válida.');
    }
  };
  
  if (loading) {
    return <div className="text-center text-white p-10">Carregando seus QR Codes...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-400 p-10">Erro ao carregar os dados: {error}</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>
              Meus QR Codes
            </h1>
            <p className="mt-1" style={{ color: '#7A798A' }}>
              Gerencie seus QR Codes para coleta de feedback
            </p>
          </div>
          <button
            onClick={() => navigate('/qr-codes/create')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#DDF247', color: '#161616' }}
          >
            <Plus className="h-5 w-5" />
            <span>Novo QR Code</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg backdrop-blur-md" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(221, 242, 71, 0.2)' }}>
            <div className="flex items-center justify-between"><p className="text-sm text-gray-400">Total QR Codes</p><QrCodeIcon className="h-8 w-8 text-lemon" /></div>
            <p className="text-2xl font-bold text-white">{qrCodes.length}</p>
          </div>
          <div className="p-6 rounded-lg backdrop-blur-md" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(221, 242, 71, 0.2)' }}>
            <div className="flex items-center justify-between"><p className="text-sm text-gray-400">Ativos</p><Eye className="h-8 w-8 text-lemon" /></div>
            <p className="text-2xl font-bold text-white">{qrCodes.filter(qr => qr.is_active).length}</p>
          </div>
          <div className="p-6 rounded-lg backdrop-blur-md" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(221, 242, 71, 0.2)' }}>
            <div className="flex items-center justify-between"><p className="text-sm text-gray-400">Total Scans</p><BarChart3 className="h-8 w-8 text-lemon" /></div>
            <p className="text-2xl font-bold text-white">{qrCodes.reduce((acc, qr) => acc + qr.scans, 0)}</p>
          </div>
          <div className="p-6 rounded-lg backdrop-blur-md" style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', border: '1px solid rgba(221, 242, 71, 0.2)' }}>
            <div className="flex items-center justify-between"><p className="text-sm text-gray-400">Total Feedbacks</p><MessageSquare className="h-8 w-8 text-lemon" /></div>
            <p className="text-2xl font-bold text-white">{qrCodes.reduce((acc, qr) => acc + qr.feedbacks, 0)}</p>
          </div>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323' }}>
          {qrCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qrCode) => (
                <div key={qrCode.id} className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg bg-gray-800/50 border border-gray-700/60 hover:border-lemon/50">
                  <div className="p-6 text-center">
                    <div className="inline-block p-4 rounded-lg bg-white">
                      <QRCodeSVG value={qrCode.target_url || ''} size={120} fgColor="#000000" includeMargin={true} />
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1"><h3 className="font-semibold mb-1 text-white">{qrCode.name}</h3><p className="text-sm mb-3 text-gray-400">{qrCode.description}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center"><p className="text-lg font-bold text-white">{qrCode.scans}</p><p className="text-xs text-gray-400">Scans</p></div>
                      <div className="text-center"><p className="text-lg font-bold text-white">{qrCode.feedbacks}</p><p className="text-xs text-gray-400">Feedbacks</p></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/60">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${qrCode.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {qrCode.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleShare(qrCode.target_url)} className="p-2 text-gray-400 hover:text-lemon transition-colors" title="Compartilhar"><Share className="h-4 w-4" /></button>
                        <button onClick={() => setEditingQRCode(qrCode)} className="p-2 text-gray-400 hover:text-lemon transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(qrCode.id, qrCode.name)} disabled={isDeleting} className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Excluir"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCodeIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2 text-white">Nenhum QR Code criado ainda</h3>
              <p className="mb-6 text-gray-400">Comece criando seu primeiro QR Code para coletar feedbacks</p>
              <button onClick={() => navigate('/qr-codes/create')} className="px-6 py-3 rounded-lg font-medium transition-colors" style={{ backgroundColor: '#DDF247', color: '#161616' }}>
                Criar Primeiro QR Code
              </button>
            </div>
          )}
        </div>
      </div>

      <EditQRCodeModal
        qrCode={editingQRCode}
        isOpen={!!editingQRCode}
        onClose={() => setEditingQRCode(null)}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
};