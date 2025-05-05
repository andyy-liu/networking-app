
export type ContactStatus = 'Reached Out' | 'Responded' | 'Chatted';

export type ContactTag = 'Club' | 'Recruiter' | 'Alumni' | 'Professor' | 'Other';

export interface Contact {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
  tags: ContactTag[];
  dateOfContact: string;
  status: ContactStatus;
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
