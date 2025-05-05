
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ContactTable } from '@/components/contacts/ContactTable';
import { NewContactButton } from '@/components/contacts/NewContactButton';
import { NewContactModal } from '@/components/contacts/NewContactModal';
import { Contact } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

// Initial sample data
const initialContacts: Contact[] = [
  {
    id: uuidv4(),
    name: 'Jennifer Smith',
    email: 'jennifer.smith@example.com',
    tags: ['Alumni', 'Recruiter'],
    dateOfContact: '2023-05-15',
    status: 'Chatted',
  },
  {
    id: uuidv4(),
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    tags: ['Professor'],
    dateOfContact: '2023-05-10',
    status: 'Responded',
  },
  {
    id: uuidv4(),
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    tags: ['Club', 'Other'],
    dateOfContact: '2023-05-05',
    status: 'Reached Out',
  },
];

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <NewContactButton onClick={() => setIsModalOpen(true)} />
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
            <ContactTable contacts={contacts} />
          </div>
        </main>
      </div>
      
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddContact}
      />
    </div>
  );
};

export default Index;
