export interface Todo {
  id: string;
  contactId: string;
  task: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}