import React, { useState, useEffect } from "react";
import { useTags } from "@/context/TagContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, X } from "lucide-react";
import { getTagColor } from "../utils/contact-utils";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ContactStatus } from "@/features/contacts/types";

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Database contact structure
interface DbContact {
  id: string;
  user_id: string;
  tags: string[];
  dateofcontact: string;
  email: string;
  name: string;
  role?: string | null;
  company?: string | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { availableTags, addTag, deleteTag, isDefaultTag } = useTags();
  const { user } = useAuth();
  const [newTagInput, setNewTagInput] = useState("");
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<DbContact[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchContacts();
    }
  }, [isOpen, user]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Use type assertion to handle the database structure
      setContacts((data as DbContact[]) || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !availableTags.includes(newTagInput.trim())) {
      addTag(newTagInput.trim());
      setNewTagInput("");
      toast({
        title: "Tag added",
        description: `The tag "${newTagInput.trim()}" has been added.`,
      });
    }
  };

  const confirmDeleteTag = (tag: string) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete || !user) return;

    setIsLoading(true);

    try {
      // Use the TagContext's deleteTag function which handles the tag deletion
      // from both the database and the UI context
      const success = await deleteTag(tagToDelete);

      if (success) {
        // Update local contacts state to reflect the changes
        setContacts((prevContacts) =>
          prevContacts.map((contact) => {
            if (contact.tags && contact.tags.includes(tagToDelete)) {
              return {
                ...contact,
                tags: contact.tags.filter((tag) => tag !== tagToDelete),
              };
            }
            return contact;
          })
        );

        toast({
          title: "Tag deleted",
          description: `The tag "${tagToDelete}" has been removed from all contacts.`,
        });
      } else {
        toast({
          title: "Error",
          description: `Could not delete tag "${tagToDelete}". Default tags cannot be deleted.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the tag.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Add, edit, or remove tags. Default tags cannot be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Add new tag */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a new tag"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={
                  !newTagInput.trim() ||
                  availableTags.includes(newTagInput.trim())
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Available Tags</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        getTagColor(tag),
                        isDefaultTag(tag) ? "opacity-70" : "opacity-100"
                      )}
                    >
                      {tag}
                      {isDefaultTag(tag) && (
                        <span className="ml-1 text-xs opacity-70">
                          (default)
                        </span>
                      )}
                    </Badge>
                    {!isDefaultTag(tag) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1 text-gray-500 hover:text-red-600"
                        onClick={() => confirmDeleteTag(tag)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete {tag}</span>
                      </Button>
                    )}
                  </div>
                ))}
                {availableTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tags available
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag "{tagToDelete}"? This will
              remove the tag from all contacts where it's used. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
