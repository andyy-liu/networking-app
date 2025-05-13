import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Contact } from "@/features/contacts/types";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useContactGroups } from "@/features/contacts/hooks/useContactGroups";
import { useContactGroupMembers } from "@/features/contacts/hooks/useContactGroupMembers";

interface AddToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContacts: Contact[];
  onGroupAdded: () => void;
}

export const AddToGroupModal: React.FC<AddToGroupModalProps> = ({
  isOpen,
  onClose,
  selectedContacts,
  onGroupAdded,
}) => {
  const { user } = useAuth();
  const { data: groups = [], createGroup } = useContactGroups();
  const { addContactsToGroup } = useContactGroupMembers();
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | "new">("new");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (groups.length > 0 && selectedGroupId === "new") {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedContacts.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to add to the group",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let groupId = selectedGroupId;

      // Create a new group if selected
      if (selectedGroupId === "new" && newGroupName.trim()) {
        const newGroup = await createGroup(newGroupName.trim());
        if (newGroup) {
          groupId = newGroup.id;
        } else {
          throw new Error("Failed to create group");
        }
      }

      if (typeof groupId === "string" && groupId !== "new") {
        // Add contacts to the group
        const contactIds = selectedContacts.map((contact) => contact.id);
        const success = await addContactsToGroup({
          groupId,
          contactIds,
        });

        if (success) {
          toast({
            title: "Success",
            description: `${selectedContacts.length} contacts added to group`,
          });
          onGroupAdded();
          onClose();
        } else {
          throw new Error("Failed to add contacts to group");
        }
      }
    } catch (error) {
      console.error("Error adding contacts to group:", error);
      toast({
        title: "Error",
        description: "Failed to add contacts to group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedGroupId}
              onValueChange={setSelectedGroupId}
              className="gap-3"
            >
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={group.id}
                    id={group.id}
                  />
                  <Label htmlFor={group.id}>{group.name}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="new"
                  id="new-group"
                />
                <Label htmlFor="new-group">Create new group</Label>
              </div>
            </RadioGroup>

            {selectedGroupId === "new" && (
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required={selectedGroupId === "new"}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add to Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
