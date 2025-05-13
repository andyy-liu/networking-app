import { supabase } from "@/lib/client";
import { Contact, ContactGroup } from "@/features/contacts/types";

/**
 * Fetch all contact groups for a user
 */
export async function fetchContactGroups(userId: string): Promise<ContactGroup[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("contact_groups")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      userId: item.user_id,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error("Error fetching contact groups:", error);
    return [];
  }
}

/**
 * Create a new contact group
 */
export async function createContactGroup(userId: string, name: string): Promise<ContactGroup | null> {
  if (!userId || !name) return null;

  try {
    const { data, error } = await supabase
      .from("contact_groups")
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error creating contact group:", error);
    return null;
  }
}

/**
 * Update a contact group
 */
export async function updateContactGroup(groupId: string, name: string): Promise<ContactGroup | null> {
  if (!groupId || !name) return null;

  try {
    const { data, error } = await supabase
      .from("contact_groups")
      .update({ name })
      .eq("id", groupId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error updating contact group:", error);
    return null;
  }
}

/**
 * Delete a contact group
 */
export async function deleteContactGroup(groupId: string): Promise<boolean> {
  if (!groupId) return false;

  try {
    const { error } = await supabase
      .from("contact_groups")
      .delete()
      .eq("id", groupId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting contact group:", error);
    return false;
  }
}

/**
 * Fetch a single contact group by ID
 */
export async function fetchContactGroup(groupId: string, userId: string): Promise<ContactGroup | null> {
  if (!userId || !groupId) return null;

  try {
    const { data, error } = await supabase
      .from("contact_groups")
      .select("*")
      .eq("id", groupId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error fetching contact group:", error);
    return null;
  }
}

/**
 * Fetch all contacts in a group
 */
export async function fetchContactsInGroup(groupId: string, userId: string): Promise<Contact[]> {
  if (!userId || !groupId) return [];

  try {
    // Get contact IDs in this group
    const { data: memberData, error: memberError } = await supabase
      .from("contact_group_members")
      .select("contact_id")
      .eq("group_id", groupId);

    if (memberError) throw memberError;

    if (memberData.length === 0) {
      return [];
    }

    // Get contact details
    const contactIds = memberData.map((member) => member.contact_id);
    const { data: contactsData, error: contactsError } = await supabase
      .from("contacts")
      .select("*")
      .in("id", contactIds)
      .eq("user_id", userId);

    if (contactsError) throw contactsError;

    // Transform database data to match our Contact type
    return contactsData.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role || "",
      company: item.company || "",
      tags: item.tags,
      dateOfContact: item.dateofcontact,
      status: item.status as Contact['status'],
    }));
  } catch (error) {
    console.error("Error fetching contacts in group:", error);
    return [];
  }
}

/**
 * Update a contact group's name
 */
export async function updateContactGroupName(
  groupId: string, 
  userId: string, 
  name: string
): Promise<boolean> {
  if (!userId || !groupId || !name) return false;

  try {
    const { error } = await supabase
      .from("contact_groups")
      .update({ name: name.trim() })
      .eq("id", groupId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating group name:", error);
    return false;
  }
}

/**
 * Update a contact
 */
export async function updateContact(
  contact: Contact,
  userId: string
): Promise<boolean> {
  if (!userId || !contact.id) return false;

  try {
    const { error } = await supabase
      .from("contacts")
      .update({
        name: contact.name,
        email: contact.email,
        role: contact.role,
        company: contact.company,
        tags: contact.tags,
        dateofcontact: contact.dateOfContact,
        status: contact.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contact.id)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating contact:", error);
    return false;
  }
}
