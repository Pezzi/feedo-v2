import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  // O 'isAuthenticated' foi removido porque ele pode ser derivado diretamente de 'user'
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Começa carregando, como antes
  setUser: (user) => set({ user }), // Apenas atualiza o usuário
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null }); // Apenas limpa o usuário
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}));

// A sua useAppStore permanece a mesma
interface AppState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'pt' | 'en';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'pt' | 'en') => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  language: 'pt',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language })
}));