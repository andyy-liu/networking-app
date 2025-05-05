
export type ContactStatus = 'Reached Out' | 'Responded' | 'Chatted';

export type ContactTag = 'Club' | 'Recruiter' | 'Alumni' | 'Professor' | 'Other';

export interface Contact {
  id: string;
  name: string;
  email: string;
  tags: ContactTag[];
  dateOfContact: string;
  status: ContactStatus;
}
