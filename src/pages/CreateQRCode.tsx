import React, { useState, useRef } from 'react';
import { ArrowLeft, QrCode as QrCodeIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQRCodeOperations } from '../hooks/useQRCodeOperations'; // Importação do novo hook dedicado

export const CreateQRCode: React.FC = () => {
  const navigate = useNavigate();
  const { createQRCode, loading } = useQRCodeOperations();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color_scheme: '#DDF247',
    is_active: true,
    logo_url: null as string | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateQRCodeUrl = () => {
    return '/f/preview...';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQRCode(formData);
      toast.success("QR Code criado com sucesso!");
      navigate('/qr-codes');
    } catch (error: any) {
      toast.error(`Erro ao criar QR Code: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/qr-codes')} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-white">Criar Novo QR Code</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#232323' }}>
            <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do QR Code *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Loja Shopping Center" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Descreva o propósito deste QR Code" rows={4} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white resize-none" required />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 rounded-lg bg-[#232323] sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="text-center">
              <div className="inline-block p-4 rounded-lg bg-white">
                <QRCodeSVG value={generateQRCodeUrl()} size={200} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-lemon text-gray-900 rounded-lg font-bold hover:bg-lemon-dark transition-colors disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar QR Code'}
          </button>
        </div>
      </form>
    </div>
  );
};