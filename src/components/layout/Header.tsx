
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Outreach Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <div className="text-sm font-medium">Welcome back,</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Student</div>
          </div>
          <Avatar>
            <AvatarFallback className="bg-outreach-purple text-white">ST</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
