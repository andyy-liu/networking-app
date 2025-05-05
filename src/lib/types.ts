
export type ContactStatus = 'Reached Out' | 'Responded' | 'Chatted';

export type ContactTag = 'Club' | 'Recruiter' | 'Alumni' | 'Professor' | 'Other';

export interface Contact {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string; // Add company field
  tags: ContactTag[];
  dateOfContact: string;
  status: ContactStatus;
}
