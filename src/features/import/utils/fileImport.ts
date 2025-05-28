import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Contact, ContactStatus, ContactTag } from '@/features/contacts/types';

// Define the types for the parsed data
export interface ParsedFileData {
  data: Record<string, unknown>[];
  headers: string[];
  fileName: string;
  fileType: 'csv' | 'excel' | 'unknown';
}

// Mapping interface for user customization
export interface FieldMapping {
  sourceField: string;
  targetField: keyof Omit<Contact, 'id' | 'todos'>;
  transform?: (value: unknown) => unknown;
}

/**
 * Parses CSV or Excel files and returns the data in a structured format
 */
export async function parseImportFile(file: File): Promise<ParsedFileData> {
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  try {
    // Handle CSV files
    if (fileExtension === 'csv') {
      return new Promise((resolve, reject) => {        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,          complete: (results) => {
            const headers = results.meta.fields || [];
            console.log(`CSV Import: Extracted ${headers.length} columns:`, headers);
            resolve({
              data: results.data as Record<string, unknown>[],
              headers,
              fileName,
              fileType: 'csv'
            });
          },
          error: (error) => {
            reject(new Error(`Failed to parse CSV file: ${error.message}`));
          }
        });
      });
    }    // Handle Excel files
    else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
        // Get all headers from the first row (even empty ones)
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Ensure we capture enough columns - sometimes Excel files have data beyond their declared range
      // Default to at least 26 columns (A-Z) if the sheet has less
      const maxColumns = Math.max(range.e.c, 25); // 0-based index, so 25 is column Z
      
      const headers: string[] = [];
        // Extract all column headers from the first row
      for (let C = range.s.c; C <= maxColumns; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
        const cell = worksheet[cellAddress];
          // Use the column header or a default if empty
        if (cell && cell.v) {
          headers.push(String(cell.v));
        } else {
          // Use "Column X" as fallback where X is the column letter (A, B, C, etc.)
          headers.push(`Column ${XLSX.utils.encode_col(C)}`);
        }
      }
        // Convert worksheet to JSON objects with header-to-value mapping
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: null, // Use null for empty cells
        header: headers, // Use our extracted headers
        range: range.s.r + 1 // Start data extraction from the row AFTER the header row
      });
      
      console.log(`Excel Import: Extracted ${headers.length} columns:`, headers);
      
      return {
        data,
        headers,
        fileName,
        fileType: 'excel'
      };
    } else {
      throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
}

/**
 * Validates data to ensure it meets requirements for import
 */
export function validateImportData(data: Record<string, unknown>[], mappings: FieldMapping[]): {
  valid: boolean;
  errors: string[];
  validData: Record<string, unknown>[];
} {  console.log(`validateImportData called with ${data.length} rows and ${mappings.length} mappings`);
  const errors: string[] = [];
  const validData: Record<string, unknown>[] = [];
    // Required fields for a valid contact - only name and dateOfContact are mandatory
  const requiredFields: (keyof Omit<Contact, 'id' | 'todos'>)[] = ['name', 'dateOfContact'];
  
  // Check if mappings cover all required fields
  const mappedFields = mappings.map(m => m.targetField);
  console.log("Mapped fields:", mappedFields);
  const missingRequiredMappings = requiredFields.filter(field => !mappedFields.includes(field));
  
  if (missingRequiredMappings.length > 0) {
    console.log("Missing required mappings:", missingRequiredMappings);
    errors.push(`Missing required field mappings: ${missingRequiredMappings.join(', ')}`);
    return { valid: false, errors, validData: [] };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    const transformedRow: Record<string, unknown> = {};
      // Apply mappings and transformations
    for (const mapping of mappings) {
      const { sourceField, targetField, transform } = mapping;
      let value = row[sourceField];
      
      // Apply transformation if provided
      if (transform) {
        try {
          value = transform(value);
        } catch (e) {
          rowErrors.push(`Error transforming ${sourceField} to ${targetField}: ${e}`);
          continue;
        }
      }
      
      // Check if required field is missing or empty
      if (requiredFields.includes(targetField) && (value === undefined || value === null || value === '')) {
        rowErrors.push(`Missing required field: ${targetField}`);
      }
      
      transformedRow[targetField] = value;
    }    // Validate status is a valid ContactStatus (if provided)
    if (transformedRow.status !== undefined && 
        transformedRow.status !== null && 
        transformedRow.status !== '' && 
        !['Not Started', 'Reached Out', 'Responded', 'Chatted'].includes(transformedRow.status as string)) {
      rowErrors.push(`Invalid status value: ${transformedRow.status}. Must be one of: Not Started, Reached Out, Responded, Chatted`);
    }
    
    // If status is empty, we'll set a default later, so don't consider it an error
    if (transformedRow.status === undefined || 
        transformedRow.status === null || 
        transformedRow.status === '') {
      transformedRow.status = 'Not Started';
    }
      // Ensure tags is an array
    if (transformedRow.tags) {
      if (!Array.isArray(transformedRow.tags)) {
        // Try to convert comma-separated string to array
        if (typeof transformedRow.tags === 'string') {
          transformedRow.tags = transformedRow.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
        } else {
          rowErrors.push('Tags must be an array or comma-separated string');
        }
      }
    } else {
      // Initialize empty tags array if not provided
      transformedRow.tags = [];
    }
    
    // If there are errors for this row, add them to the overall errors
    if (rowErrors.length > 0) {
      errors.push(`Row ${index + 1}: ${rowErrors.join('; ')}`);
    } else {
      validData.push(transformedRow);
    }  });
  
  const result = {
    valid: errors.length === 0,
    errors,
    validData
  };
  
  console.log(`Validation complete. Valid: ${result.valid}, Errors: ${result.errors.length}, Valid data: ${result.validData.length} rows`);
  return result;
}

/**
 * Maps parsed data to Contact objects based on user-defined field mappings
 */
export function mapToContacts(data: Record<string, unknown>[], mappings: FieldMapping[]): Omit<Contact, 'id' | 'todos'>[] {
  console.log("[mapToContacts] Input data:", JSON.parse(JSON.stringify(data)));
  console.log("[mapToContacts] Input mappings:", mappings);

  return data.map(row => {
    const contact: Partial<Omit<Contact, 'id' | 'todos'>> = {
      tags: [] // Initialize with empty tags array
    };

    // The `row` object here already has keys corresponding to `targetField` names
    // because it comes from `validData` which is processed by `validateImportData`.
    for (const mapping of mappings) {
      const { targetField, transform } = mapping; // Use targetField to access data from row
      let value = row[targetField]; // Access value using targetField      console.log(`[mapToContacts] Processing mapping - Target: ${targetField}, Value from row:`, value);

      if (transform) {
        try {
          value = transform(value);
          console.log(`[mapToContacts] Value after transform for ${targetField}:`, value);
        } catch (e) {
          console.error(`[mapToContacts] Error transforming ${targetField}:`, e);
          value = row[targetField]; // Revert to original value on transform error
        }
      }      // Assign value to the corresponding property in the contact object
      switch (targetField) {
        case 'name':
          contact[targetField] = String(value || '');
          break;
        case 'email':
          // Only set email if it's not empty or null
          contact[targetField] = value ? String(value) : undefined;
          break;
        case 'role':
        case 'company':
        case 'linkedinUrl':
          contact[targetField] = String(value || '');
          break;
        case 'tags':
          if (Array.isArray(value)) {
            contact.tags = value as ContactTag[];
          } else if (typeof value === 'string' && value.trim() !== '') {
            contact.tags = value.split(',').map(tag => tag.trim()) as ContactTag[];          } else {
            contact.tags = [];
          }
          break;
        case 'status':
          contact.status = (value || 'Not Started') as ContactStatus;
          break;
        case 'dateOfContact':
          if (typeof value === 'number') { // Excel date number
            contact.dateOfContact = new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString().split('T')[0];
          } else if (typeof value === 'string') {
            contact.dateOfContact = value; // Assume it's already a valid date string
          } else {
            contact.dateOfContact = new Date().toISOString().split('T')[0]; // Default to today
          }
          break;
        // No default case needed as all keys of Omit<Contact, 'id' | 'todos'> are handled
        // or should not be manually assigned here if they are not part of the explicit cases.
      }
    }// Ensure essential fields have defaults if somehow still missing
    contact.name = contact.name || '';
    // Email is optional, so don't default it to empty string
    contact.status = contact.status || 'Not Started';
    contact.dateOfContact = contact.dateOfContact || new Date().toISOString().split('T')[0];

    console.log("[mapToContacts] Constructed contact:", JSON.parse(JSON.stringify(contact)));
    return contact as Omit<Contact, 'id' | 'todos'>;
  });
}

/**
 * Helper function to create default field mappings based on headers
 */
export function createDefaultMappings(headers: string[]): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  const fieldMap: Record<string, keyof Omit<Contact, 'id' | 'todos'>> = {
    // Common field names and their variations
    name: 'name',
    fullname: 'name',
    'full name': 'name',
    'contact name': 'name',
    
    email: 'email',
    'email address': 'email',
    'contact email': 'email',
    
    role: 'role',
    position: 'role',
    title: 'role',
    'job title': 'role',
    
    company: 'company',
    organization: 'company',
    'company name': 'company',
      tags: 'tags',
    categories: 'tags',
    labels: 'tags',
    
    status: 'status',
    'contact status': 'status',
    
    date: 'dateOfContact',
    'date of contact': 'dateOfContact',
    'contact date': 'dateOfContact',
    'last contact': 'dateOfContact',
    'last contacted': 'dateOfContact',
    
    linkedin: 'linkedinUrl',
    'linkedin url': 'linkedinUrl',
    'linkedinurl': 'linkedinUrl',
    'linkedin profile': 'linkedinUrl',
    'linkedin link': 'linkedinUrl'
  };
    // Create mappings based on header names
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    
    if (fieldMap[normalizedHeader]) {
      let transform: ((value: unknown) => unknown) | undefined;
      
      // Add transformations for specific fields
      if (fieldMap[normalizedHeader] === 'tags' && normalizedHeader !== 'tags') {
        transform = (value: unknown) => 
          typeof value === 'string' 
            ? value.split(',').map(tag => tag.trim()).filter(Boolean)
            : Array.isArray(value) ? value : [];
      }
      
      if (fieldMap[normalizedHeader] === 'dateOfContact') {
        transform = (value: unknown) => {
          if (!value) return new Date().toISOString().split('T')[0];
          
          // Try to parse date and format as YYYY-MM-DD
          try {
            const date = new Date(value as string);
            if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
            return date.toISOString().split('T')[0];
          } catch {
            return new Date().toISOString().split('T')[0];
          }
        };
      }
      
      mappings.push({
        sourceField: header,
        targetField: fieldMap[normalizedHeader],
        transform
      });
    }
  });
  
  return mappings;
}
