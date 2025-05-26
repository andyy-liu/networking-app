import React, { useState } from "react";
import { Contact, ContactStatus } from "../types";
import { ReminderCategory, getReminderCategoryTitle, getDaysSinceLastContact } from "../utils/reminder-utils";
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate, getTagColor, getStatusColor } from "../utils/contact-utils";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClipboardList } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ReminderTableProps {
  category: ReminderCategory;
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onOpenTodoPanel?: (contact: Contact) => void;
  defaultOpen?: boolean;
}

// Custom enhanced table row component for reminders
const ReminderTableRowEnhanced = ({ 
  contact, 
  onUpdateContact,
  onOpenTodoPanel 
}: {
  contact: Contact;
  onUpdateContact: (contact: Contact) => void;
  onOpenTodoPanel?: (contact: Contact) => void;
}) => {
  const daysSinceLastContact = getDaysSinceLastContact(contact.dateOfContact);
  const [date, setDate] = useState<Date>(new Date(contact.dateOfContact));
  
  // Update the contact when date changes
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const formattedDate = format(newDate, "yyyy-MM-dd");
      onUpdateContact({
        ...contact,
        dateOfContact: formattedDate
      });
    }
  };
  
  return (
    <TableRow className="h-10">
      <TableCell className="py-0.5">{contact.name}</TableCell>
      <TableCell className="py-0.5">{contact.email}</TableCell>
      <TableCell className="py-0.5">{contact.role || "-"}</TableCell>
      <TableCell className="py-0.5">{contact.company || "-"}</TableCell>
      <TableCell className="py-0.5">
        <div className="flex flex-wrap gap-1">
          {contact.tags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className={cn("text-xs", getTagColor(tag))}
            >
              {tag}
            </Badge>
          ))}
          {contact.tags.length === 0 && "-"}
        </div>
      </TableCell>
      <TableCell className="py-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-6 items-center justify-center gap-1 rounded-md border bg-background px-2 text-sm",
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              <span className="hidden sm:inline">
                {formatDate(contact.dateOfContact)}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell className="py-0.5">
        <Badge variant={daysSinceLastContact > 30 ? "destructive" : "secondary"}>
          {daysSinceLastContact} days
        </Badge>
      </TableCell>
      <TableCell className="py-0.5">
        <button 
          className="w-full flex items-center gap-2 h-6 px-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
          onClick={() => onOpenTodoPanel?.(contact)}
        >
          <ClipboardList className="h-4 w-4 text-blue-500" />
          {contact.todos && contact.todos.length > 0 ? (
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {/* Find the first incomplete todo, or use the most recent one */}
              {(() => {
                if (!contact.todos) return <span className="text-gray-400">Add todo</span>;
                
                // First look for incomplete todos
                const incompleteTodos = contact.todos.filter(todo => !todo.completed);
                
                if (incompleteTodos.length > 0) {
                  // Sort by due date (if available) or creation date
                  const sortedTodos = incompleteTodos.sort((a, b) => {
                    // If both have due dates, compare them
                    if (a.dueDate && b.dueDate) {
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    }
                    // If only one has a due date, it comes first
                    if (a.dueDate) return -1;
                    if (b.dueDate) return 1;
                    
                    // If neither has due dates, sort by created date (newest first)
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  });
                  
                  return <span>{sortedTodos[0].task}</span>;
                }
                
                // If no incomplete todos, show the most recently completed one
                const latestTodo = contact.todos.sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];
                
                return latestTodo ? (
                  <span className="text-gray-400 line-through">{latestTodo.task}</span>
                ) : (
                  <span className="text-gray-400">Add todo</span>
                );
              })()}
            </div>
          ) : (
            <span className="text-gray-400">Add todo</span>
          )}
        </button>
      </TableCell>
      <TableCell className="py-0.5">
        <div className="ml-4">
          <Select
            value={contact.status}
            onValueChange={(value: ContactStatus) => {
              onUpdateContact({
                ...contact,
                status: value
              });
            }}
          >
            <SelectTrigger
              className={cn(
                "h-6 border-none w-[140px] focus:ring-0",
                getStatusColor(contact.status)
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Reached Out">Reached Out</SelectItem>
              <SelectItem value="Responded">Responded</SelectItem>
              <SelectItem value="Chatted">Chatted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const ReminderTable: React.FC<ReminderTableProps> = ({
  category,
  contacts,
  onUpdateContact,
  onOpenTodoPanel,
  defaultOpen = true
}) => {
  if (contacts.length === 0) {
    return null;
  }

  const getBadgeColor = (category: ReminderCategory) => {
    switch (category) {
      case ReminderCategory.OVER_MONTH:
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300";
      case ReminderCategory.OVER_THREE_WEEKS:
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300";
      case ReminderCategory.OVER_TWO_WEEKS:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      case ReminderCategory.OVER_ONE_WEEK:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300";
      case ReminderCategory.LESS_THAN_WEEK:
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <Accordion type="single" collapsible defaultValue={defaultOpen ? category : undefined}>
        <AccordionItem value={category} className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{getReminderCategoryTitle(category)}</h2>
              <Badge variant="outline" className={cn("ml-2", getBadgeColor(category))}>
                {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0 pb-3">
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Last Contacted</TableHead>
                      <TableHead>Days Since</TableHead>
                      <TableHead>To-do</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map(contact => (
                      <ReminderTableRowEnhanced
                        key={contact.id}
                        contact={contact}
                        onUpdateContact={onUpdateContact}
                        onOpenTodoPanel={onOpenTodoPanel}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
