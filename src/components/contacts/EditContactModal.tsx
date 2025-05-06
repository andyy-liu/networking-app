import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, ContactStatus } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { getTagColor } from "./contact-utils";
import { useTags } from "@/context/TagContext";

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
  contact: Contact | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.string().optional(),
  company: z.string().optional(),
  dateOfContact: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format.",
  }),
  status: z.enum(["Reached Out", "Responded", "Chatted"] as const),
  tags: z.array(z.string()).default([]),
});

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
}) => {
  const { availableTags, addTag } = useTags();
  const [newTagInput, setNewTagInput] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Initialize with contact data or defaults
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email,
          role: contact.role || "",
          company: contact.company || "",
          dateOfContact: contact.dateOfContact,
          status: contact.status,
          tags: contact.tags,
        }
      : {
          name: "",
          email: "",
          role: "",
          company: "",
          dateOfContact: new Date().toISOString().split("T")[0],
          status: "Reached Out",
          tags: [],
        },
  });

  // Update form values when contact changes
  React.useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        email: contact.email,
        role: contact.role || "",
        company: contact.company || "",
        dateOfContact: contact.dateOfContact,
        status: contact.status,
        tags: contact.tags,
      });
    }
  }, [contact, form]);

  const addNewTag = () => {
    if (
      newTagInput.trim() !== "" &&
      !availableTags.includes(newTagInput.trim())
    ) {
      const newTag = newTagInput.trim();
      // Add to global available tags
      addTag(newTag);

      // Add to form
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(newTag)) {
        form.setValue("tags", [...currentTags, newTag], {
          shouldValidate: true,
        });
      }

      setNewTagInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewTag();
    }
  };

  const selectedTags = form.watch("tags") || [];

  const toggleTagSelection = (tag: string) => {
    const currentTags = [...selectedTags];
    const tagIndex = currentTags.indexOf(tag);

    if (tagIndex > -1) {
      currentTags.splice(tagIndex, 1);
    } else {
      currentTags.push(tag);
    }

    form.setValue("tags", currentTags, { shouldValidate: true });
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (!contact) return;

    onSubmit({
      ...contact,
      ...data,
    });
    onClose();
  };

  if (!contact) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update details for {contact.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                    />
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
                    <Input
                      placeholder="john.doe@example.com"
                      {...field}
                    />
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
                    <Input
                      placeholder="Software Engineer at Tech Corp"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tech Corp"
                      {...field}
                    />
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
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag}
                          className={`${getTagColor(
                            tag
                          )} cursor-pointer flex items-center gap-1 px-2 py-1`}
                          onClick={() => toggleTagSelection(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addNewTag}
                        disabled={!newTagInput.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {availableTags.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">
                          Available tags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map(
                            (tag) =>
                              !selectedTags.includes(tag) && (
                                <Badge
                                  key={tag}
                                  className={`${getTagColor(
                                    tag
                                  )} cursor-pointer opacity-70 hover:opacity-100`}
                                  variant="outline"
                                  onClick={() => toggleTagSelection(tag)}
                                >
                                  {tag}
                                </Badge>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
                    <Input
                      type="date"
                      {...field}
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
