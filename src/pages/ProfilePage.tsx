import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { useProfileOperations } from '../hooks/useProfile'; // Importação do novo hook
import { toast } from 'react-toastify';
import { User, KeyRound } from 'lucide-react';

export const ProfilePage: React.FC = () => { // Nome do componente alterado
  const { user } = useAuthStore();
  const { updateUserProfile, changePassword, loading } = useProfileOperations();
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user?.user_metadata.display_name) {
      setDisplayName(user.user_metadata.display_name);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ display_name: displayName });
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar o perfil.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warn('As senhas não coincidem.');
      return;
    }
    try {
      await changePassword(newPassword);
      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu Perfil e Segurança</h1>
        <p className="text-sm text-gray-400 mt-1">Gerencie suas informações de perfil e segurança.</p>
      </div>
      {/* Formulários de Perfil e Senha aqui... (código completo na próxima mensagem se este passo funcionar) */}
    </div>
  );
};