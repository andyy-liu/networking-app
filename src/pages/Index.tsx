
import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ContactTable } from '@/components/contacts/ContactTable';
import { NewContactButton } from '@/components/contacts/NewContactButton';
import { NewContactModal } from '@/components/contacts/NewContactModal';
import { EditContactModal } from '@/components/contacts/EditContactModal';
import { Contact, ContactTag } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

// Initial sample data
const initialContacts: Contact[] = [
  {
    id: uuidv4(),
    name: 'Jennifer Smith',
    email: 'jennifer.smith@example.com',
    role: 'Product Manager at Tech Co.',
    tags: ['Alumni', 'Recruiter'],
    dateOfContact: '2023-05-15',
    status: 'Chatted',
  },
  {
    id: uuidv4(),
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    role: 'Computer Science Professor',
    tags: ['Professor'],
    dateOfContact: '2023-05-10',
    status: 'Responded',
  },
  {
    id: uuidv4(),
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    role: 'President of Coding Club',
    tags: ['Club', 'Other'],
    dateOfContact: '2023-05-05',
    status: 'Reached Out',
  },
];

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>('default');
  const [activeTagFilter, setActiveTagFilter] = useState<ContactTag | null>(null);

  const handleAddContact = (newContactData: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      id: uuidv4(),
      ...newContactData,
    };
    
    setContacts([newContact, ...contacts]);
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts.`,
    });
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsEditModalOpen(true);
  };

  const handleUpdateContact = (id: string, updatedData: Omit<Contact, 'id'>) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === id ? { ...updatedData, id } : contact
    );
    
    setContacts(updatedContacts);
    toast({
      title: "Contact updated",
      description: `${updatedData.name} has been updated.`,
    });
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | 'default') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterByTag = (tag: ContactTag | null) => {
    setActiveTagFilter(tag);
  };

  // Apply sorting and filtering
  const filteredAndSortedContacts = useMemo(() => {
    // First apply tag filtering
    let filtered = activeTagFilter 
      ? contacts.filter(contact => contact.tags.includes(activeTagFilter))
      : contacts;
    
    // Then apply sorting
    if (sortKey && sortDirection !== 'default') {
      return [...filtered].sort((a, b) => {
        const aValue = a[sortKey as keyof Contact];
        const bValue = b[sortKey as keyof Contact];
        
        // Handle different types of values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          // For dates, convert to timestamp first
          if (sortKey === 'dateOfContact') {
            const aDate = new Date(aValue).getTime();
            const bDate = new Date(bValue).getTime();
            return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
          }
          
          // For normal strings
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Fallback for non-string values (though we shouldn't have any)
        return 0;
      });
    }
    
    return filtered;
  }, [contacts, sortKey, sortDirection, activeTagFilter]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Contacts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your professional network
              </p>
            </div>
            <NewContactButton onClick={() => setIsNewModalOpen(true)} />
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
            <ContactTable 
              contacts={filteredAndSortedContacts} 
              onSort={handleSort}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onFilterByTag={handleFilterByTag}
              activeTagFilter={activeTagFilter}
              onEditContact={handleEditContact}
            />
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <NewContactModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleAddContact}
      />
      
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateContact}
        contact={contactToEdit}
      />
    </div>
  );
};

export default Index;
