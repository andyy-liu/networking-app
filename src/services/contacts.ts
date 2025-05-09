import { supabase } from "@/lib/client";
import type { Contact, ContactTag } from "@/lib/types";

/**
 * Fetch all contacts for a given user
 */
export async function fetchContacts(userId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (
    data?.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role || "",
      company: item.company || "",
      tags: item.tags as ContactTag[],
      dateOfContact: item.dateofcontact,
      status: item.status as Contact["status"],
      todos: []
    })) ?? []
  );
}

/**
 * Create a new contact for a given user
 */
export async function createContact(
  userId: string,
  newData: Omit<Contact, "id">
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: userId,
      name: newData.name,
      email: newData.email,
      role: newData.role || null,
      company: newData.company || null,
      tags: newData.tags,
      dateofcontact: newData.dateOfContact,
      status: newData.status
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role || "",
    company: data.company || "",
    tags: data.tags as ContactTag[],
    dateOfContact: data.dateofcontact,
    status: data.status as Contact["status"],
    todos: []
  };
}

/**
 * Update an existing contact for a given user
 */
export async function updateContact(
  userId: string,
  updated: Contact
): Promise<void> {
  const { error } = await supabase
    .from("contacts")
    .update({
      name: updated.name,
      email: updated.email,
      role: updated.role || null,
      company: updated.company || null,
      tags: updated.tags,
      dateofcontact: updated.dateOfContact,
      status: updated.status,
      updated_at: new Date().toISOString()
    })
    .eq("id", updated.id)
    .eq("user_id", userId);
  if (error) throw error;
}

/**
 * Delete one or more contacts for a given user
 */
export async function deleteContacts(
  userId: string,
  ids: string[]
): Promise<void> {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .in("id", ids)
    .eq("user_id", userId);
  if (error) throw error;
}
