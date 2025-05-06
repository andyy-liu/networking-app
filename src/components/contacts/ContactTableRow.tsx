import React, { useState, useRef, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Contact, ContactStatus, Todo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { StickyNote, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusColor, getTagColor, formatDate } from "./contact-utils";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { X, Plus, Check } from "lucide-react";
import { useTags } from "@/context/TagContext";

interface ContactTableRowProps {
  contact: Contact;
  onEditContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onViewNotes: (contact: Contact) => void;
  isSelected: boolean;
  onSelectContact: (contact: Contact, isSelected: boolean) => void;
  onOpenTodoPanel?: (contact: Contact) => void;
}

export const ContactTableRow: React.FC<ContactTableRowProps> = ({
  contact,
  onEditContact,
  onUpdateContact,
  onViewNotes,
  isSelected,
  onSelectContact,
  onOpenTodoPanel,
}) => {
  // State for each editable field
  const [name, setName] = useState(contact.name);
  const [email, setEmail] = useState(contact.email);
  const [role, setRole] = useState(contact.role || "");
  const [company, setCompany] = useState(contact.company || "");

  // Manual tracking of the selected date for display
  const [selectedDateDisplay, setSelectedDateDisplay] = useState(() => {
    // Extract the parts directly from the string for display
    const [year, month, day] = contact.dateOfContact.split("-").map(Number);
    return { year, month, day };
  });

  // Regular date object for the calendar component
  const [date, setDate] = useState<Date>(() => {
    const [year, month, day] = contact.dateOfContact.split("-").map(Number);
    return new Date(year, month - 1, day);
  });
  const [status, setStatus] = useState<ContactStatus>(contact.status);
  const [tags, setTags] = useState<string[]>(contact.tags);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
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

    // Update both date representations
    const [year, month, day] = contact.dateOfContact.split("-").map(Number);
    setSelectedDateDisplay({ year, month, day });
    setDate(new Date(year, month - 1, day));

    setStatus(contact.status);
    setTags(contact.tags);
  }, [contact]);

  // Handle field updates
  const handleUpdate = (updates: Partial<Contact>) => {
    // Check if any values have actually changed
    const hasChanges = Object.entries(updates).some(([key, value]) => {
      return contact[key as keyof Contact] !== value;
    });

    // Only trigger update if something changed
    if (hasChanges) {
      onUpdateContact({
        ...contact,
        ...updates,
      });
    }
  };

  const handleTagManagement = (selectedTag: string) => {
    let updatedTags: string[];
    if (tags.includes(selectedTag)) {
      updatedTags = tags.filter((tag) => tag !== selectedTag);
    } else {
      updatedTags = [...tags, selectedTag];
    }

    // Only update if tags actually changed
    if (JSON.stringify(updatedTags) !== JSON.stringify(tags)) {
      setTags(updatedTags);
      handleUpdate({ tags: updatedTags });
    }
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
  };

  // Find the most recent incomplete todo
  const getLatestTodo = (): Todo | null => {
    if (!contact.todos || contact.todos.length === 0) {
      return null;
    }

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
  };

  const latestTodo = getLatestTodo();

  return (
    <TableRow>
      <TableCell className="w-10 px-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelectContact(contact, !!checked);
          }}
          aria-label={`Select ${contact.name}`}
          className="flex h-4 w-4"
        />
      </TableCell>
      <TableCell>
        <Input
          ref={nameInputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== contact.name) {
              handleUpdate({ name });
            }
          }}
          className="w-full h-6 bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        />
      </TableCell>
      <TableCell>
        <Input
          ref={emailInputRef}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => {
            if (email !== contact.email) {
              handleUpdate({ email });
            }
          }}
          className="w-full h-6 bg-transparent border-0 p-0 focus-visible:ring-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        />
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

              {/* Small screens: only “May 8” */}
              <span className="inline sm:hidden">{format(date, "MMM d")}</span>

              {/* sm+ screens: full “May 8, 2025” */}
              <span className="hidden sm:inline">
                {format(date, "MMM d, yyyy")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  // Build ISO date string: YYYY-MM-DD
                  const year = date.getFullYear();
                  // Month is 0-based, so add 1 and pad with leading 0 if needed
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const formattedDate = `${year}-${month}-${day}`;

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
