
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Contact, ContactStatus, ContactTag } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Omit<Contact, 'id'>) => void;
  contact: Contact | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  role: z.string().optional(),
  company: z.string().optional(), // Add company field to schema
  dateOfContact: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format.' }),
  status: z.enum(['Reached Out', 'Responded', 'Chatted'] as const),
  tags: z.array(z.enum(['Club', 'Recruiter', 'Alumni', 'Professor', 'Other'] as const)).min(1, { 
    message: 'Please select at least one tag.' 
  }),
});

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Initialize with contact data or defaults
    defaultValues: contact ? {
      name: contact.name,
      email: contact.email,
      role: contact.role || '',
      company: contact.company || '', // Add company field default value
      dateOfContact: contact.dateOfContact,
      status: contact.status,
      tags: contact.tags,
    } : {
      name: '',
      email: '',
      role: '',
      company: '', // Add default value for company
      dateOfContact: new Date().toISOString().split('T')[0],
      status: 'Reached Out',
      tags: ['Other'],
    },
  });

  // Update form values when contact changes
  React.useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        email: contact.email,
        role: contact.role || '',
        company: contact.company || '', // Add company to reset form
        dateOfContact: contact.dateOfContact,
        status: contact.status,
        tags: contact.tags,
      });
    }
  }, [contact, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!contact) return;
    
    // Make sure all required fields are present
    const contactData: Omit<Contact, 'id'> = {
      name: values.name,
      email: values.email,
      role: values.role,
      company: values.company, // Add company to contact data
      tags: values.tags,
      dateOfContact: values.dateOfContact,
      status: values.status,
    };
    
    onSubmit(contact.id, contactData);
    onClose();
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update details for {contact.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer at Tech Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add new company field */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Tech Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      className="flex flex-wrap gap-2"
                      value={field.value}
                      onValueChange={(value) => {
                        // Ensure at least one tag is selected
                        if (value.length > 0) {
                          field.onChange(value);
                        }
                      }}
                    >
                      <ToggleGroupItem value="Club" aria-label="Club">
                        Club
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Recruiter" aria-label="Recruiter">
                        Recruiter
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Alumni" aria-label="Alumni">
                        Alumni
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Professor" aria-label="Professor">
                        Professor
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Other" aria-label="Other">
                        Other
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateOfContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Contact</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Reached Out">Reached Out</SelectItem>
                      <SelectItem value="Responded">Responded</SelectItem>
                      <SelectItem value="Chatted">Chatted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-outreach-blue hover:bg-outreach-blue/90">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
