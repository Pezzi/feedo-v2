import React, { useState } from 'react';
import { Search, Bell, User, Menu, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { supabase } from '../../services/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPanel } from '../notifications/NotificationPanel';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const DropdownItem = ({ icon: Icon, children, onClick }: { icon: any; children: React.ReactNode; onClick?: () => void;}) => (
    <button onClick={onClick} className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-lemon transition-colors rounded">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );

  return (
    <header className="px-6 py-4">
      <div className="flex items-center justify-between">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-700">
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#161616] text-white focus:ring-2 focus:ring-lemon focus:outline-none" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg text-gray-400 hover:text-lemon" title={isDarkMode ? 'Modo claro' : 'Modo escuro'}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-700/50" 
              title="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel 
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={() => console.log("Marcar todas como lidas")}
              />
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-1 rounded-lg"
            >
              {/* --- AQUI ESTÁ A MUDANÇA --- */}
              {user?.user_metadata.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-lemon">
                  <User className="h-5 w-5 text-gray-900" />
                </div>
              )}
              <span className="hidden md:block font-medium text-white">{user?.email}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(35, 35, 35, 0.9)', border: '1px solid rgba(221, 242, 71, 0.2)'}}>
                <div className="py-2">
                  <DropdownItem icon={Settings} onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>Configurações</DropdownItem>
                  <hr className="my-1 border-gray-700" />
                  <DropdownItem icon={LogOut} onClick={handleLogout}>Log out</DropdownItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};