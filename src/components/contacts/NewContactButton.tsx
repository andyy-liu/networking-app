import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewContactButtonProps {
  onClick: () => void;
}

export const NewContactButton: React.FC<NewContactButtonProps> = ({
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      className="hover:bg/90"
    >
      <Plus className="mr-2 h-4 w-4" /> New Contact
    </Button>
  );
};
