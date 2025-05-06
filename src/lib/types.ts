export type ContactStatus = 'Reached Out' | 'Responded' | 'Chatted';

export type ContactTag = string;

export interface Todo {
  id: string;
  contactId: string;
  task: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
  tags: ContactTag[];
  dateOfContact: string;
  status: ContactStatus;
  todos?: Todo[];
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
