import { supabase } from "@/lib/client";
import type { Contact, ContactTag, ContactCreate, ContactUpdate, ContactStatus } from "@/features/contacts/types";

export async function fetchContacts(userId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*, linkedin_url") // Explicitly select linkedin_url, assuming types will be fixed
    .eq("user_id", userId);
  if (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
  // If Supabase types are correct, data should be correctly typed here.
  if (!data) {
    return [];
  }
  return (
    data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      email: item.email,
      role: item.role || "",
      company: item.company || "",
      tags: item.tags as ContactTag[],
      dateOfContact: item.dateofcontact,
      status: item.status as ContactStatus, // Use imported ContactStatus
      linkedinUrl: item.linkedin_url || "", 
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      todos: [] 
    }))
  );
}


export async function createContact(
  userId: string,
  newData: ContactCreate 
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
      status: newData.status,
      linkedin_url: newData.linkedinUrl || null 
    })
    .select("*, linkedin_url") // Explicitly select linkedin_url
    .single();

  if (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create contact: No data returned from Supabase.");
  }
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    email: data.email,
    role: data.role || "",
    company: data.company || "",
    tags: data.tags as ContactTag[],
    dateOfContact: data.dateofcontact,
    status: data.status as ContactStatus, // Use imported ContactStatus
    linkedinUrl: data.linkedin_url || "", 
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    todos: []
  };
}


export async function updateContact(
  userId: string,
  updated: ContactUpdate 
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
      linkedin_url: updated.linkedinUrl || null, 
      updated_at: new Date().toISOString()
    })
    .eq("id", updated.id) 
    .eq("user_id", userId);
  if (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}


export async function deleteContacts(
  userId: string,
  ids: string[]
): Promise<void> {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .in("id", ids)
    .eq("user_id", userId);
  if (error) {
    console.error("Error deleting contacts:", error);
    throw error;
  }
}
