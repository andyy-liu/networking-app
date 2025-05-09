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
import { Contact, ContactGroup } from "@/lib/types";
import { supabase } from "@/lib/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

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
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | "new">("new");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchGroups();
    }
  }, [isOpen, user]);

  const fetchGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("contact_groups")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      const transformedGroups: ContactGroup[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        userId: item.user_id,
        createdAt: item.created_at,
      }));

      setGroups(transformedGroups);
      if (transformedGroups.length > 0) {
        setSelectedGroupId(transformedGroups[0].id);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load contact groups",
        variant: "destructive",
      });
    }
  };

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
        const { data, error } = await supabase
          .from("contact_groups")
          .insert({
            name: newGroupName.trim(),
            user_id: user.id,
          })
          .select("id")
          .single();

        if (error) throw error;
        groupId = data.id;
      }

      if (typeof groupId === "string" && groupId !== "new") {
        // Add contacts to the group
        const groupMembers = selectedContacts.map((contact) => ({
          contact_id: contact.id,
          group_id: groupId,
        }));

        const { error } = await supabase
          .from("contact_group_members")
          .insert(groupMembers);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${selectedContacts.length} contacts added to group`,
        });

        onGroupAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error adding to group:", error);
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
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Group</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <RadioGroup
              value={selectedGroupId}
              onValueChange={(value) => setSelectedGroupId(value)}
            >
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={group.id}
                    id={`group-${group.id}`}
                  />
                  <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                </div>
              ))}
              <div className="flex items-start space-x-2">
                <RadioGroupItem
                  value="new"
                  id="new-group"
                  className="mt-2"
                />
                <div className="flex-1">
                  <Label htmlFor="new-group">Create new group</Label>
                  <Input
                    className="mt-1"
                    placeholder="Enter new group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    disabled={selectedGroupId !== "new"}
                  />
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                isLoading || (selectedGroupId === "new" && !newGroupName.trim())
              }
            >
              {isLoading ? "Adding..." : "Add to Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
