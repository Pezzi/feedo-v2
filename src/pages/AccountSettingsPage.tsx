import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store';
import { useProfile } from '../hooks/useProfile';
import { toast } from 'react-toastify';
import { User, KeyRound, Building, MapPin, Camera, Phone, Link2, Instagram, Facebook, Linkedin, Loader2 } from 'lucide-react';
import type { Provider } from '../hooks/useProviders';
import { useIBGE, type IBGECnaeClass } from '../hooks/useIBGE';

export const AccountSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { profile, loading, refetch, updateProviderProfile, changePassword, uploadProfileImage } = useProfile();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>({});

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [cnaeClasses, setCnaeClasses] = useState<IBGECnaeClass[]>([]);
  const { fetchCNAEClasses } = useIBGE();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCNAEClasses().then(setCnaeClasses);
  }, [fetchCNAEClasses]);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else if (user) {
      const initialName = user.user_metadata?.display_name || user.email || '';
      setFormData(prev => ({...prev, name: initialName}));
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
      } else {
        setCoverFile(file);
        setCoverPreview(previewUrl);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalUpdates: Partial<Provider> & { [key: string]: any } = { ...formData };

      if (avatarFile) {
        toast.info("Fazendo upload do avatar...");
        finalUpdates.avatar_url = await uploadProfileImage(avatarFile, 'avatar');
      }
      if (coverFile) {
        toast.info("Fazendo upload da imagem de capa...");
        finalUpdates.cover_image_url = await uploadProfileImage(coverFile, 'cover');
      }
      
      await updateProviderProfile(finalUpdates);
      await refetch();
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warn('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      toast.warn('A nova senha precisa ter no mínimo 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await changePassword(newPassword);
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar a senha.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading && !profile) {
    return <div className="p-6 text-white">Carregando perfil...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações e Perfil de Prestador</h1>
        <p className="text-sm text-gray-400 mt-1">Gerencie suas informações que aparecerão no Veepo.</p>
      </div>

      <form onSubmit={handleProfileUpdate}>
        <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#232323' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Imagens do Perfil</h3>
          <div className="relative h-40 rounded-lg bg-gray-700 mb-[-60px]">
            <img src={coverPreview || formData.cover_image_url || 'https://via.placeholder.com/800x200?text=Sua+Imagem+de+Capa'} alt="Imagem de Capa" className="w-full h-full object-cover rounded-lg"/>
            <button type="button" onClick={() => coverInputRef.current?.click()} className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-opacity"><Camera className="h-4 w-4" /></button>
          </div>
          <div className="relative w-32 h-32 rounded-full border-4 border-[#232323] bg-gray-700 mx-auto">
            <img src={avatarPreview || formData.avatar_url || 'https://via.placeholder.com/150?text=Avatar'} alt="Avatar" className="w-full h-full object-cover rounded-full"/>
            <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-opacity"><Camera className="h-4 w-4" /></button>
          </div>
          <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/png, image/jpeg, image/webp" />
          <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} className="hidden" accept="image/png, image/jpeg, image/webp" />
        </div>

        <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#232323' }}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Building className="h-5 w-5 text-lemon" />Informações do Negócio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Seu Nome *</label><input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" required /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Nome do Negócio</label><input type="text" name="business_name" value={formData.business_name || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Segmento (CNAE)</label>
              <input list="cnae-options" id="segment" name="segment" value={formData.segment || ''} onChange={handleInputChange} placeholder="Ex: Cabeleireiros..." className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" />
              <datalist id="cnae-options">
                {cnaeClasses.map(cnae => (<option key={cnae.id} value={cnae.descricao} />))}
              </datalist>
            </div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Email de Contato</label><input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-400" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-300 mb-2">Descrição do Negócio</label><textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white resize-none" /></div>
          </div>
        </div>
        
        <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#232323' }}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-lemon" />Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">CEP</label><input type="text" name="cep" value={formData.cep || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Bairro</label><input type="text" name="neighborhood" value={formData.neighborhood || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label><input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Estado (UF)</label><input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} maxLength={2} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
            </div>
        </div>

        <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#232323' }}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Phone className="h-5 w-5 text-lemon" />Contato e Redes Sociais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Website</label><input type="url" name="website_url" value={formData.website_url || ''} onChange={handleInputChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label><input type="url" name="instagram_url" value={formData.instagram_url || ''} onChange={handleInputChange} placeholder="https://instagram.com/..." className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Facebook</label><input type="url" name="facebook_url" value={formData.facebook_url || ''} onChange={handleInputChange} placeholder="https://facebook.com/..." className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label><input type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" /></div>
          </div>
        </div>
        
        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={saving || loading} className="px-6 py-3 bg-lemon text-gray-900 rounded-lg font-bold hover:bg-lemon-dark transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            {saving ? 'Salvando...' : 'Salvar Perfil Completo'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className="p-6 rounded-lg mt-8" style={{ backgroundColor: '#232323' }}>
         <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><KeyRound className="h-5 w-5 text-lemon" />Alterar Senha</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full max-w-sm px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" placeholder="Mínimo de 6 caracteres" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nova Senha</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full max-w-sm px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white" placeholder="Repita a nova senha" /></div>
          <div className="pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50">
              {saving ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};