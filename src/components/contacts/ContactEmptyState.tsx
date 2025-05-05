
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

export const ContactEmptyState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        No contacts found. Add your first contact to get started.
      </TableCell>
    </TableRow>
  );
};
