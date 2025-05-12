
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-outreach-blue flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-white"></div>
      </div>
      <span className="font-semibold text-lg">OutreachBuddy</span>
    </div>
  );
};
