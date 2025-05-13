import { supabase } from "@/lib/client";

/**
 * Add contacts to a group
 */
export async function addContactsToGroup(groupId: string, contactIds: string[]): Promise<boolean> {
  if (!groupId || contactIds.length === 0) return false;

  try {
    const groupMembers = contactIds.map((contactId) => ({
      contact_id: contactId,
      group_id: groupId,
    }));

    const { error } = await supabase
      .from("contact_group_members")
      .insert(groupMembers);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding contacts to group:", error);
    return false;
  }
}

/**
 * Remove contacts from a group
 */
export async function removeContactsFromGroup(groupId: string, contactIds: string[]): Promise<boolean> {
  if (!groupId || contactIds.length === 0) return false;

  try {
    const { error } = await supabase
      .from("contact_group_members")
      .delete()
      .eq("group_id", groupId)
      .in("contact_id", contactIds);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing contacts from group:", error);
    return false;
  }
}

/**
 * Get all contacts in a group
 */
export async function getContactsInGroup(groupId: string): Promise<string[]> {
  if (!groupId) return [];

  try {
    const { data, error } = await supabase
      .from("contact_group_members")
      .select("contact_id")
      .eq("group_id", groupId);

    if (error) throw error;
    return data.map(item => item.contact_id);
  } catch (error) {
    console.error("Error getting contacts in group:", error);
    return [];
  }
}
