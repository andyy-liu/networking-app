import { Todo } from 'src/features/todos/types';

export type ContactStatus = 'Reached Out' | 'Responded' | 'Chatted';

export type ContactTag = string;

export interface BaseContact {
  name: string;
  email: string;
  role?: string;
  company?: string;
  tags: ContactTag[];
  dateOfContact: string;
  status: ContactStatus;
  todos?: Todo[];
  linkedinUrl?: string; // Added new field
}

export interface Contact extends BaseContact {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface ContactGroupMember {
  id: string;
  contactId: string;
  groupId: string;
  createdAt: string;
}

export interface ContactWithTodos extends Contact {
  todos: Todo[];
}

export type ContactUpdate = Partial<Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt" | "todos" | "groupMemberships">> & {
  id: string;
  linkedinUrl?: string; // Added new field
};

export type ContactCreate = Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt" | "todos" | "groupMemberships"> & {
  linkedinUrl?: string; // Added new field
};
