import { supabase } from "@/lib/client";
import { Contact } from "@/features/contacts/types";
import { mapToContacts } from "@/features/import/utils/fileImport";
import { FieldMapping } from "@/features/import/utils/fileImport";

// Type for import result that includes IDs for potential undo
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  importedIds: string[]; // Track IDs for undo functionality
}

/**
 * Service to handle bulk import of contacts into Supabase
 */
export async function importContacts(
  userId: string,
  mappedData: Record<string, unknown>[],
  fieldMappings: FieldMapping[],
  skipDuplicates?: boolean // Added skipDuplicates parameter
): Promise<ImportResult> {
  console.log("[importService] importContacts - Received mappedData:", JSON.parse(JSON.stringify(mappedData)));
  console.log("[importService] importContacts - Received fieldMappings:", fieldMappings);
  console.log("[importService] importContacts - Received skipDuplicates:", skipDuplicates);  try {
    // Map the data to Contact objects
    const contacts = mapToContacts(mappedData, fieldMappings);
    console.log("[importService] importContacts - Result of mapToContacts:", JSON.parse(JSON.stringify(contacts)));    // Prepare data for Supabase insert    
    const contactsToInsert = contacts.map(contact => ({
      user_id: userId,      name: contact.name,
      // Since email is required in the database, use a placeholder if empty
      email: contact.email || `placeholder_${Date.now()}_${Math.random().toString(36).substring(2, 15)}@example.com`,
      role: contact.role || null,
      company: contact.company || null,
      tags: contact.tags || [],
      linkedin_url: contact.linkedinUrl || null, // Note: database field is linkedin_url
      // Ensure dateOfContact is correctly formatted or handled if it's a number (Excel date)
      dateofcontact: typeof contact.dateOfContact === 'number' 
        ? new Date(Math.round((contact.dateOfContact - 25569) * 86400 * 1000)).toISOString().split('T')[0]
        : contact.dateOfContact,
      status: contact.status || 'Not Started',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    console.log("[importService] importContacts - Data prepared for Supabase (contactsToInsert):", JSON.parse(JSON.stringify(contactsToInsert)));

    // Check if we have any contacts to insert
    if (contactsToInsert.length === 0) {
      return {
        success: false,
        imported: 0,
        errors: ['No valid contacts to import'],
        importedIds: []
      };
    }
    
    // Insert contacts in batches to avoid potential limits
    const BATCH_SIZE = 50;
    const errors: string[] = [];
    let importedCount = 0;
    const importedIds: string[] = [];
      for (let i = 0; i < contactsToInsert.length; i += BATCH_SIZE) {
      const batch = contactsToInsert.slice(i, i + BATCH_SIZE);
      console.log(`[importService] importContacts - Inserting batch ${i / BATCH_SIZE + 1}:`, JSON.parse(JSON.stringify(batch)));

      const { data, error } = await supabase
        .from("contacts")
        .insert(batch)
        .select();
        if (error) {
        console.error(`[importService] Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
        console.error(`[importService] Error details:`, JSON.stringify(error, null, 2));
        console.error(`[importService] First few records in the batch:`, JSON.stringify(batch.slice(0, 3), null, 2));
        errors.push(`Batch ${i / BATCH_SIZE + 1} error: ${error.message}`);
      } else {
        console.log(`[importService] Successfully inserted batch ${i / BATCH_SIZE + 1}, count:`, data?.length || 0);
        importedCount += data?.length || 0;
        // Store the imported IDs for potential undo
        if (data) {
          data.forEach(contact => {
            importedIds.push(contact.id);
          });
        }
      }
    }
    
    return {
      success: errors.length === 0,
      imported: importedCount,
      errors,
      importedIds
    };
  } catch (error: unknown) {
    console.error("Error importing contacts:", error);
    return {
      success: false,
      imported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error during import'],
      importedIds: []
    };
  }
}

/**
 * Checks for duplicate email addresses in the existing contacts
 */
export async function checkForDuplicates(
  userId: string,
  emailsToCheck: string[]
): Promise<{ hasDuplicates: boolean; duplicates: string[] }> {
  console.log(`Checking for duplicates. User ID: ${userId}, Emails to check: ${emailsToCheck.length}`);
  try {
    // Filter out empty emails
    const validEmails = emailsToCheck.filter(email => email && email.trim() !== '');
    
    if (validEmails.length === 0) {
      console.log("No valid emails to check for duplicates");
      return { hasDuplicates: false, duplicates: [] };
    }
    
    // Query Supabase for existing contacts with the same emails
    console.log("Querying Supabase for duplicate emails");
    const { data, error } = await supabase
      .from("contacts")
      .select("email")
      .eq("user_id", userId)
      .in("email", validEmails);
    
    if (error) {
      console.error("Error checking for duplicates:", error);
      throw error;
    }
      // Extract the duplicate emails
    const duplicateEmails = data?.map(contact => contact.email) || [];
    
    console.log(`Found ${duplicateEmails.length} duplicate emails: ${duplicateEmails.join(', ')}`);
    return {
      hasDuplicates: duplicateEmails.length > 0,
      duplicates: duplicateEmails
    };
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    throw error;
  }
}

/**
 * Undo a contact import by deleting the recently imported contacts
 */
export async function undoImport(
  userId: string,
  importedIds: string[]
): Promise<{ success: boolean; undoneCount: number; errors: string[] }> {
  try {
    if (importedIds.length === 0) {
      return {
        success: false,
        undoneCount: 0,
        errors: ['No contacts to undo']
      };
    }
    
    // Delete contacts in batches to avoid potential limits
    const BATCH_SIZE = 50;
    const errors: string[] = [];
    let undoneCount = 0;
    
    for (let i = 0; i < importedIds.length; i += BATCH_SIZE) {
      const batchIds = importedIds.slice(i, i + BATCH_SIZE);
      
      const { error, count } = await supabase
        .from("contacts")
        .delete()
        .eq("user_id", userId)
        .in("id", batchIds);
      
      if (error) {
        errors.push(`Batch ${i / BATCH_SIZE + 1} error: ${error.message}`);
      } else {
        undoneCount += count || 0;
      }
    }
    
    return {
      success: errors.length === 0,
      undoneCount,
      errors
    };
  } catch (error: unknown) {
    console.error("Error undoing import:", error);
    return {
      success: false,
      undoneCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error during undo']
    };
  }
}
