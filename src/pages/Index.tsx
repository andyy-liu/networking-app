import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ContactTable } from '@/components/contacts/ContactTable';
import { NewContactButton } from '@/components/contacts/NewContactButton';
import { NewContactModal } from '@/components/contacts/NewContactModal';
import { EditContactModal } from '@/components/contacts/EditContactModal';
import { ContactNotesModal } from '@/components/contacts/ContactNotesModal';
import { AddToGroupModal } from '@/components/contacts/AddToGroupModal';
import { Contact, ContactTag } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactForNotes, setContactForNotes] = useState<Contact | null>(null);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>('default');
  const [activeTagFilter, setActiveTagFilter] = useState<ContactTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Fetch contacts on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Transform database data to match our Contact type
      const transformedContacts: Contact[] = data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role || '',
        company: item.company || '',
        tags: item.tags as ContactTag[],
        dateOfContact: item.dateofcontact,
        status: item.status as Contact['status'],
      }));
      
      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (newContactData: Omit<Contact, 'id'>) => {
    if (!user) return;
    
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          name: newContactData.name,
          email: newContactData.email,
          role: newContactData.role,
          company: newContactData.company,
          tags: newContactData.tags,
          dateofcontact: newContactData.dateOfContact,
          status: newContactData.status,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create Contact object from the returned data
      const newContact: Contact = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || '',
        company: data.company || '',
        tags: data.tags as ContactTag[],
        dateOfContact: data.dateofcontact,
        status: data.status as Contact['status'],
      };
      
      // Update local state
      setContacts([newContact, ...contacts]);
      
      toast({
        title: "Contact added",
        description: `${newContact.name} has been added to your contacts.`,
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add the contact',
        variant: 'destructive',
      });
    }
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsEditModalOpen(true);
  };

  const handleViewNotes = (contact: Contact) => {
    setContactForNotes(contact);
    setIsNotesModalOpen(true);
  };

  const handleUpdateContact = async (id: string, updatedData: Omit<Contact, 'id'>) => {
    if (!user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('contacts')
        .update({
          name: updatedData.name,
          email: updatedData.email,
          role: updatedData.role,
          company: updatedData.company,
          tags: updatedData.tags,
          dateofcontact: updatedData.dateOfContact,
          status: updatedData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedContacts = contacts.map(contact => 
        contact.id === id ? { ...updatedData, id } : contact
      );
      
      setContacts(updatedContacts);
      
      toast({
        title: "Contact updated",
        description: `${updatedData.name} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the contact',
        variant: 'destructive',
      });
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | 'default') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterByTag = (tag: string | null) => {
    setActiveTagFilter(tag);
  };

  const handleSelectContact = (contact: Contact, isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts(prev => [...prev, contact]);
    } else {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    }
  };

  const handleGroupAdded = () => {
    // Clear selections after adding to group
    setSelectedContacts([]);
    // Refresh sidebar groups
    // The sidebar component will refresh its own data on next render
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
            <div className="flex gap-2">
              {selectedContacts.length > 0 && (
                <Button 
                  onClick={() => setIsAddToGroupModalOpen(true)}
                  variant="outline"
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Add to Group ({selectedContacts.length})
                </Button>
              )}
              <NewContactButton onClick={() => setIsNewModalOpen(true)} />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
              <ContactTable 
                contacts={filteredAndSortedContacts} 
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onFilterByTag={handleFilterByTag}
                activeTagFilter={activeTagFilter}
                onEditContact={handleEditContact}
                onViewNotes={handleViewNotes}
                selectedContacts={selectedContacts}
                onSelectContact={handleSelectContact}
              />
            </div>
          )}
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
      
      <ContactNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        contact={contactForNotes}
      />

      <AddToGroupModal
        isOpen={isAddToGroupModalOpen}
        onClose={() => setIsAddToGroupModalOpen(false)}
        selectedContacts={selectedContacts}
        onGroupAdded={handleGroupAdded}
      />
    </div>
  );
};

export default Index;
