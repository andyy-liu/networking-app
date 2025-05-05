
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Contact } from '@/lib/types';
import { AvatarWithInitial } from '@/components/ui/avatar-with-initial';
import { Badge } from '@/components/ui/badge';
import { FilePen, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStatusColor, getTagColor, formatDate } from './contact-utils';

interface ContactTableRowProps {
  contact: Contact;
  onEditContact: (contact: Contact) => void;
  onViewNotes: (contact: Contact) => void;
}

export const ContactTableRow: React.FC<ContactTableRowProps> = ({ 
  contact, 
  onEditContact,
  onViewNotes
}) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <AvatarWithInitial name={contact.name} className="h-8 w-8" />
          <span className="font-medium">{contact.name}</span>
        </div>
      </TableCell>
      <TableCell>{contact.email}</TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">{contact.role || '-'}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">{contact.company || '-'}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {contact.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className={getTagColor(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>{formatDate(contact.dateOfContact)}</TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={getStatusColor(contact.status)}
        >
          {contact.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onViewNotes(contact)}
            title="Contact notes"
          >
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEditContact(contact)}
            title="Edit contact"
          >
            <FilePen className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
