
import React from 'react';
import { 
  Table,
  TableBody,
} from '@/components/ui/table';
import { Contact } from '@/lib/types';
import { ContactTableHeader } from './ContactTableHeader';
import { ContactTableRow } from './ContactTableRow';
import { ContactEmptyState } from './ContactEmptyState';

interface ContactTableProps {
  contacts: Contact[];
  onSort: (key: string, direction: 'asc' | 'desc' | 'default') => void;
  sortKey: string;
  sortDirection: 'asc' | 'desc' | 'default';
  onFilterByTag: (tag: string | null) => void;
  activeTagFilter: string | null;
  onEditContact: (contact: Contact) => void;
  onViewNotes: (contact: Contact) => void;
  selectedContacts: Contact[];
  onSelectContact: (contact: Contact, isSelected: boolean) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({ 
  contacts, 
  onSort, 
  sortKey, 
  sortDirection,
  onFilterByTag,
  activeTagFilter,
  onEditContact,
  onViewNotes,
  selectedContacts,
  onSelectContact
}) => {
  // Get all unique tags from contacts for filter dropdown
  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags)));

  return (
    <div className="rounded-md border">
      <Table>
        <ContactTableHeader 
          onSort={onSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onFilterByTag={onFilterByTag}
          activeTagFilter={activeTagFilter}
          availableTags={allTags}
          hasCheckboxColumn={true}
        />
        <TableBody>
          {contacts.length === 0 ? (
            <ContactEmptyState />
          ) : (
            contacts.map((contact) => (
              <ContactTableRow 
                key={contact.id} 
                contact={contact} 
                onEditContact={onEditContact}
                onViewNotes={onViewNotes}
                isSelected={selectedContacts.some(c => c.id === contact.id)}
                onSelectContact={onSelectContact}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
