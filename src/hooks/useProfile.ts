import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store';
import type { Provider } from './useProviders';
import { toast } from 'react-toastify';

// Hook unificado para buscar e gerenciar o perfil completo do prestador
export const useProfile = () => {
  const { user, setUser } = useAuthStore();
  
  const [profile, setProfile] = useState<Partial<Provider> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (err: any) {
      toast.error("Erro ao buscar perfil.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const uploadProfileImage = async (file: File, type: 'avatar' | 'cover'): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado.');
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${type}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
      return data.publicUrl;
    } finally {
      setLoading(false);
    }
  };

  const updateProviderProfile = async (updates: Partial<Provider>) => {
    if (!user) throw new Error('Usuário não autenticado.');
    setLoading(true);
    try {
      const { data: existingProfile, error: selectError } = await supabase.from('providers').select('id').eq('user_id', user.id).single();
      if (selectError && selectError.code !== 'PGRST116') throw selectError;
      
      let error;
      if (existingProfile) {
        ({ error } = await supabase.from('providers').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', user.id));
      } else {
        ({ error } = await supabase.from('providers').insert({ ...updates, user_id: user.id, name: user.user_metadata?.display_name || user.email! }));
      }
      if (error) throw error;
      
      // Sincroniza o avatar com o perfil de autenticação
      if (updates.avatar_url) {
        const { data: { user: updatedUser } } = await supabase.auth.updateUser({
          data: { avatar_url: updates.avatar_url }
        });
        if (updatedUser) setUser(updatedUser);
      }
      await fetchProfile();
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) throw new Error('Usuário não autenticado.');
    if (!newPassword || newPassword.length < 6) {
        throw new Error('A nova senha precisa ter no mínimo 6 caracteres.');
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, refetch: fetchProfile, updateProviderProfile, changePassword, uploadProfileImage };
};