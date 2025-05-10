import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Contact } from "@/lib/types";
import { ContactTableHeader } from "./ContactTableHeader";
import { ContactTableRow } from "./ContactTableRow";
import { ContactEmptyState } from "./ContactEmptyState";

interface ContactTableProps {
  contacts: Contact[];
  onSort: (key: string, direction: "asc" | "desc" | "default") => void;
  sortKey: string;
  sortDirection: "asc" | "desc" | "default";
  onFilterByTag: (tag: string | null) => void;
  activeTagFilter: string | null;
  onEditContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  selectedContacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onOpenTodoPanel?: (contact: Contact) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onSort,
  sortKey,
  sortDirection,
  onFilterByTag,
  activeTagFilter,
  onEditContact,
  onUpdateContact,
  selectedContacts,
  onSelectContact,
  onOpenTodoPanel,
}) => {
  // Get all unique tags from contacts for filter dropdown
  const allTags = Array.from(
    new Set(contacts.flatMap((contact) => contact.tags))
  );

  return (
    // outer wrapper enables horizontal scrolling when needed
    <div className="rounded-md border overflow-x-auto">
      {/* inner wrapper forces table to its full content width */}
      <div className="min-w-max">
        <Table className="w-full table-auto whitespace-nowrap">
          <ContactTableHeader
            onSort={onSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onFilterByTag={onFilterByTag}
            activeTagFilter={activeTagFilter}
            availableTags={allTags}
            hasCheckboxColumn={true}
          />
          <TableBody className="[&_tr]:!h-10 [&_td]:!py-0.5">
            {contacts.length === 0 ? (
              <ContactEmptyState />
            ) : (
              contacts.map((contact) => (
                <ContactTableRow
                  key={contact.id}
                  contact={contact}
                  onEditContact={onEditContact}
                  onUpdateContact={onUpdateContact}
                  isSelected={selectedContacts.some((c) => c.id === contact.id)}
                  onSelectContact={onSelectContact}
                  onOpenTodoPanel={onOpenTodoPanel}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
