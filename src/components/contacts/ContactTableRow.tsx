import React, { useState, useRef, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Contact, ContactStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";
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
}

export const ContactTableRow: React.FC<ContactTableRowProps> = ({
  contact,
  onEditContact,
  onUpdateContact,
  onViewNotes,
  isSelected,
  onSelectContact,
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

  return (
    <TableRow className="group !h-7 max-h-7">
      <TableCell className="w-10 !py-0 px-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelectContact(contact, !!checked);
          }}
          aria-label={`Select ${contact.name}`}
          className="h-4 w-4"
        />
      </TableCell>
      <TableCell className="!py-0 px-4">
        <Input
          ref={nameInputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== contact.name) {
              handleUpdate({ name });
            }
          }}
          className="w-full h-6 bg-transparent border-0 p-0 focus-visible:ring-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        />
      </TableCell>
      <TableCell className="!py-0 px-4">
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
      <TableCell className="!py-0 px-4">
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
      <TableCell className="!py-0 px-4">
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
      <TableCell className="!py-0 px-4">
        <Popover>
          <div className="flex flex-wrap gap-1 min-h-[20px] h-6 group">
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
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-gray-100"
                  title="Add Tags"
                >
                  <Plus
                    color="black"
                    className="h-4 w-4"
                  />
                </Button>
              </PopoverTrigger>
            </div>
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
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
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
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-half justify-start text-left font-normal hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 hover:text-gray-900" />
              {/* Display manually using our tracked date parts */}
              {selectedDateDisplay ? (
                `${new Date(0, selectedDateDisplay.month - 1).toLocaleString(
                  "default",
                  { month: "short" }
                )} ${selectedDateDisplay.day}, ${selectedDateDisplay.year}`
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  // Extract the exact parts we want to display
                  const year = newDate.getFullYear();
                  const month = newDate.getMonth() + 1; // Convert from 0-indexed
                  const day = newDate.getDate();

                  // Save these parts for direct display
                  setSelectedDateDisplay({ year, month, day });

                  // Create date string manually for database
                  const monthStr = String(month).padStart(2, "0");
                  const dayStr = String(day).padStart(2, "0");
                  const newDateStr = `${year}-${monthStr}-${dayStr}`;

                  // Update the calendar component date as well
                  setDate(newDate);

                  // Store in database
                  handleUpdate({
                    dateOfContact: newDateStr,
                  });
                }
              }}
              initialFocus
              className="[&_.rdp-day_button:focus]:bg-outreach-blue/90 [&_.rdp-day_button:hover]:bg-outreach-blue/90 [&_.rdp-day_button.rdp-day_selected]:bg-outreach-blue [&_.rdp-day_button.rdp-day_selected:hover]:bg-outreach-blue/90"
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Select
          value={status}
          onValueChange={(value: ContactStatus) => {
            if (value !== contact.status) {
              setStatus(value);
              handleUpdate({ status: value });
            }
          }}
        >
          <SelectTrigger className="w-full border-0 focus:ring-0 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900">
            <SelectValue>
              <Badge
                variant="outline"
                className={getStatusColor(status)}
              >
                {status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="[&_[data-highlighted]]:bg-outreach-blue [&_[data-highlighted]]:text-white">
            <SelectItem value="Reached Out">
              <Badge
                variant="outline"
                className={getStatusColor("Reached Out")}
              >
                Reached Out
              </Badge>
            </SelectItem>
            <SelectItem value="Responded">
              <Badge
                variant="outline"
                className={getStatusColor("Responded")}
              >
                Responded
              </Badge>
            </SelectItem>
            <SelectItem value="Chatted">
              <Badge
                variant="outline"
                className={getStatusColor("Chatted")}
              >
                Chatted
              </Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="!py-0 px-4">
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewNotes(contact)}
            title="Contact notes"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <StickyNote
              color="black"
              className="h-4 w-4"
            />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
