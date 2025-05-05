
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AvatarWithInitialProps {
  name: string;
  className?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const AvatarWithInitial: React.FC<AvatarWithInitialProps> = ({ 
  name,
  className = ''
}) => {
  const initials = getInitials(name);
  const bgColor = getRandomColor(name);
  
  return (
    <Avatar className={className}>
      <AvatarFallback className={`${bgColor} text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
