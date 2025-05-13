import React from "react";

interface AuthSpinnerProps {
  message?: string;
}

export const AuthSpinner: React.FC<AuthSpinnerProps> = ({
  message = "Authenticating...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
