import React, { useState, useRef, useEffect, useMemo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Contact, ContactStatus } from "@/features/contacts/types";
import { Todo } from "@/features/todos/types";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusColor, getTagColor } from "../utils/contact-utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { X, Plus } from "lucide-react";
import { useTags } from "@/features/tags/hooks/useTags";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContactTableRowProps {
  contact: Contact;
  onEditContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  isSelected: boolean;
  onSelectContact: (contact: Contact) => void;
  onOpenTodoPanel?: (contact: Contact) => void;
}

export const ContactTableRow: React.FC<ContactTableRowProps> = ({
  contact,
  onEditContact,
  onUpdateContact,
  isSelected,
  onSelectContact,
  onOpenTodoPanel,
}) => {
  // State for each editable field
  const [name, setName] = useState(contact.name);
  const [email, setEmail] = useState(contact.email);
  const [role, setRole] = useState(contact.role || "");
  const [company, setCompany] = useState(contact.company || "");
  const [date, setDate] = useState<Date>(() => {
    return new Date(`${contact.dateOfContact}T00:00:00`);
  });
  const [status, setStatus] = useState<ContactStatus>(contact.status);
  const [tags, setTags] = useState<string[]>(contact.tags);
  const [newTagInput, setNewTagInput] = useState("");

  // Refs for handling blur events
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);

  // Use the shared tags context
  const { availableTags, addTag } = useTags();
  // Update local state when contact prop changes
  useEffect(() => {
    setName(contact.name);
    setEmail(contact.email);
    setRole(contact.role || "");
    setCompany(contact.company || "");
    setDate(new Date(`${contact.dateOfContact}T00:00:00`));
    setStatus(contact.status);
    setTags(contact.tags);

    // Debug: Check if todos is properly passed
    if (contact.todos) {
      console.log(`Updated todos for ${contact.name}:`, contact.todos.length);
    } else {
      console.log(`No todos available for ${contact.name}`);
    }
  }, [contact]);

  // Handle field updates
  const handleUpdate = (updates: Partial<Contact>) => {
    // Only trigger update if something changed
    onUpdateContact({
      ...contact,
      ...updates,
    });
  };

  const handleTagManagement = (selectedTag: string) => {
    let updatedTags: string[];
    if (tags.includes(selectedTag)) {
      updatedTags = tags.filter((tag) => tag !== selectedTag);
    } else {
      updatedTags = [...tags, selectedTag];
    }

    setTags(updatedTags);
    handleUpdate({ tags: updatedTags });
  };

  const handleAddNewTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      const newTag = newTagInput.trim();
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      handleUpdate({ tags: updatedTags });
      setNewTagInput("");

      // Add the new tag to the global available tags
      addTag(newTag);
    }
  };
  const handleOpenTodoPanel = () => {
    if (onOpenTodoPanel) {
      onOpenTodoPanel(contact);
    }
  }; // Calculate latest todo and update when contact or todos change
  const latestTodo = useMemo(() => {
    // Directly compute the latest todo here
    if (!contact.todos || contact.todos.length === 0) {
      return null;
    }

    // Debug info
    console.log(`Recalculating latest todo for ${contact.name}:`, {
      todoCount: contact.todos.length,
      todoData: contact.todos,
    });

    // First look for incomplete todos
    const incompleteTodos = contact.todos.filter((todo) => !todo.completed);

    if (incompleteTodos.length > 0) {
      // Sort by due date (if available) or creation date
      return incompleteTodos.sort((a, b) => {
        // If both have due dates, compare them
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        // If only one has a due date, it comes first
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        // If neither has due dates, sort by created date (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })[0]; // Get the first one (earliest due date or most recent)
    }

    // If no incomplete todos, return the most recently completed one
    return contact.todos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [contact.todos, contact.name]);

  // Debug: Log the latestTodo value
  useEffect(() => {
    console.log(`Latest todo for ${contact.name}:`, latestTodo);
  }, [latestTodo, contact.name]);

  return (
    <TableRow key={contact.id}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-semibold">{contact.name}</span>
          <span className="text-sm text-gray-500">{contact.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          ref={roleInputRef}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onBlur={() => {
            if (role !== contact.role) {
              handleUpdate({ role });
            }
          }}
          className="w-full h-6 bg-transparent border-0 p-0 focus-visible:ring-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          placeholder="-"
        />
      </TableCell>
      <TableCell>
        <Input
          ref={companyInputRef}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          onBlur={() => {
            if (company !== contact.company) {
              handleUpdate({ company });
            }
          }}
          className="w-full h-6 bg-transparent border-0 p-0 focus-visible:ring-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          placeholder="-"
        />
      </TableCell>
      <TableCell className="py-2">
        <Popover>
          <div className="flex flex-wrap gap-1 min-h-[24px] group">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(getTagColor(tag), "gap-1 pr-1")}
              >
                {tag}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTagManagement(tag);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleTagManagement(tag)}
                >
                  <X className="h-3 w-3 hover:text-destructive" />
                  <span className="sr-only">Remove {tag} tag</span>
                </button>
              </Badge>
            ))}
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus
                  color="black"
                  className="h-4 w-4"
                />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent
            className="w-[200px] p-2"
            align="start"
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTagInput.trim()) {
                      handleAddNewTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNewTag}
                  disabled={!newTagInput.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      getTagColor(tag),
                      "cursor-pointer",
                      tags.includes(tag)
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => handleTagManagement(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell className="min-w-0">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "ml-4 flex h-6 items-center justify-center gap-1 rounded-md border bg-background px-2 text-sm",
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              <span className="hidden sm:inline">
                {format(date, "MMM d, yyyy")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  const formattedDate = format(newDate, "yyyy-MM-dd");
                  handleUpdate({ dateOfContact: formattedDate });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <button
          className="w-full flex items-center gap-2 h-6 px-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
          onClick={handleOpenTodoPanel}
        >
          <ClipboardList className="h-4 w-4 text-blue-500" />
          {latestTodo ? (
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {latestTodo.completed ? (
                <span className="text-gray-400 line-through">
                  {latestTodo.task}
                </span>
              ) : (
                <span>{latestTodo.task}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Add to-do</span>
          )}
        </button>
      </TableCell>
      <TableCell className="!py-2 px-4 text-center">
        <div className="ml-4">
          <Select
            value={status}
            onValueChange={(value: ContactStatus) => {
              setStatus(value);
              handleUpdate({ status: value });
            }}
          >
            <SelectTrigger
              className={cn(
                "h-6 border-none w-[140px] focus:ring-0",
                getStatusColor(status)
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
