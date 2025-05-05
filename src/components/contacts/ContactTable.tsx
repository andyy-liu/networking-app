
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Contact, ContactTag } from '@/lib/types';
import { AvatarWithInitial } from '@/components/ui/avatar-with-initial';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Filter, FilePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactTableProps {
  contacts: Contact[];
  onSort: (key: string, direction: 'asc' | 'desc' | 'default') => void;
  sortKey: string;
  sortDirection: 'asc' | 'desc' | 'default';
  onFilterByTag: (tag: ContactTag | null) => void;
  activeTagFilter: ContactTag | null;
  onEditContact: (contact: Contact) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({ 
  contacts, 
  onSort, 
  sortKey, 
  sortDirection,
  onFilterByTag,
  activeTagFilter,
  onEditContact
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reached Out':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Responded':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Chatted':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Club':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Recruiter':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Alumni':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Professor':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Other':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleSortClick = (key: string) => {
    if (sortKey === key) {
      // Cycle through sort directions: default -> asc -> desc -> default
      if (sortDirection === 'default') {
        onSort(key, 'asc');
      } else if (sortDirection === 'asc') {
        onSort(key, 'desc');
      } else {
        onSort(key, 'default');
      }
    } else {
      // New column, start with ascending
      onSort(key, 'asc');
    }
  };

  const renderSortIndicator = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-blue-500" />;
    } else if (sortDirection === 'desc') {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-blue-500 rotate-180" />;
    } else {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
  };

  // Get all unique tags from contacts for filter dropdown
  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags)));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-[200px] cursor-pointer"
              onClick={() => handleSortClick('name')}
            >
              <div className="flex items-center">
                Person
                {renderSortIndicator('name')}
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>
              <div className="flex items-center">
                Tags
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-2">
                    <Filter className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuCheckboxItem 
                      checked={activeTagFilter === null}
                      onCheckedChange={() => onFilterByTag(null)}
                    >
                      All Tags
                    </DropdownMenuCheckboxItem>
                    {allTags.map(tag => (
                      <DropdownMenuCheckboxItem 
                        key={tag} 
                        checked={activeTagFilter === tag}
                        onCheckedChange={() => onFilterByTag(tag)}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSortClick('dateOfContact')}
            >
              <div className="flex items-center">
                Contact Date
                {renderSortIndicator('dateOfContact')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSortClick('status')}
            >
              <div className="flex items-center">
                Status
                {renderSortIndicator('status')}
              </div>
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No contacts found. Add your first contact to get started.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditContact(contact)}
                    title="Edit contact"
                  >
                    <FilePen className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
