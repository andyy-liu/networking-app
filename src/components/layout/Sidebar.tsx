
import React, { useState } from 'react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Bell, 
  Settings, 
  Users, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', isActive: true },
    { icon: Bell, label: 'Reminders', isActive: false },
    { icon: Settings, label: 'Settings', isActive: false },
    { icon: Users, label: 'Groups', isActive: false },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${className} relative bg-white dark:bg-gray-900 h-screen shadow-sm flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <Logo />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-white dark:bg-gray-900 rounded-full shadow-sm border z-10"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      <Separator />
      <div className="flex-1 py-6">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 sidebar-item ${
                item.isActive ? 'active-sidebar-item' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
      </div>
      <div className="p-4">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            OutreachBuddy v1.0
          </div>
        )}
      </div>
    </div>
  );
};
