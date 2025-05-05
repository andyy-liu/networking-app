
export type ContactStatus = 'Reached Out' | 'Responded' | 'Chatted';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfContact: string;
  status: ContactStatus;
}
