import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store';
import { type User } from '@supabase/supabase-js'; // <-- A CORREÇÃO ESTÁ AQUI
import { toast } from 'react-toastify';

// Interface para o tipo de dado de uma notificação
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  link_to?: string;
  created_at: string;
}

// Hook para gerenciar notificações
export const useNotifications = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (currentUser: User) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar notificações:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    setNotifications(currentNotifications =>
      currentNotifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );

    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (updateError) {
      console.error("Erro ao marcar notificação como lida:", updateError);
      toast.error("Não foi possível marcar a notificação como lida.");
      setNotifications(currentNotifications =>
        currentNotifications.map(n =>
          n.id === notificationId ? { ...n, is_read: false } : n
        )
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(user);

      const channel = supabase
        .channel(`public:notifications:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Nova notificação recebida!', payload.new);
            setNotifications(currentNotifications => [
              payload.new as Notification,
              ...currentNotifications,
            ]);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, unreadCount, loading, error, markAsRead };
};