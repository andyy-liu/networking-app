import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Contact } from '@/features/contacts/types';
import { 
  parseImportFile, 
  validateImportData, 
  createDefaultMappings, 
  FieldMapping, 
  ParsedFileData 
} from '@/features/import/utils/fileImport';
import { 
  importContacts, 
  checkForDuplicates,
  undoImport,
  ImportResult 
} from '@/features/import/services/importService';

export function useContactImport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for the import process
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: string[];
    validData: Record<string, unknown>[];
  } | null>(null);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'validation' | 'import' | 'complete'>('upload');
  const [lastImportedIds, setLastImportedIds] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [undoInProgress, setUndoInProgress] = useState(false);
  
  // Mutation for importing contacts
  const importMutation = useMutation({
    mutationFn: async (data: { 
      mappedData: Record<string, unknown>[]; 
      fieldMappings: FieldMapping[];
      skipDuplicates?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");
      console.log("[useContactImport] importMutation - Data to import:", JSON.parse(JSON.stringify(data.mappedData)));
      console.log("[useContactImport] importMutation - Field mappings:", data.fieldMappings);
      console.log("[useContactImport] importMutation - Skip duplicates:", data.skipDuplicates);
      // Correctly pass skipDuplicates to importContacts
      return importContacts(user.id, data.mappedData, data.fieldMappings, data.skipDuplicates);
    },
    onSuccess: (result: ImportResult) => {
      // Invalidate and refetch contacts query to update the UI
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      
      // Store imported IDs for potential undo
      setLastImportedIds(result.importedIds);
      setCanUndo(result.importedIds.length > 0);
      setImportResult(result);
      
      // Move to complete step
      setImportStep('complete');
      setIsProcessing(false);
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${result.imported} contacts.`,
      });
    },
    onError: (error: Error) => {
      console.error("Error importing contacts:", error);
      toast({
        title: "Import failed",
        description: error.message || "There was an error importing your contacts.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });
  
  // Mutation for undoing imports
  const undoImportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      if (lastImportedIds.length === 0) throw new Error("No contacts to undo");
      return undoImport(user.id, lastImportedIds);
    },
    onSuccess: (result) => {
      // Invalidate and refetch contacts query to update the UI
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
      
      toast({
        title: "Import undone",
        description: `Successfully removed ${result.undoneCount} imported contacts.`,
      });
      
      // Reset state
      resetImport();
    },
    onError: (error: Error) => {
      console.error("Error undoing import:", error);
      toast({
        title: "Undo failed",
        description: error.message || "There was an error undoing your import.",
        variant: "destructive",
      });
      setUndoInProgress(false);
    }
  });
    // Function to parse uploaded file
  const parseFile = async (file: File): Promise<ParsedFileData | null> => {
    setIsProcessing(true);
    try {
      console.log(`Starting to parse file: ${file.name} (${file.type}, ${file.size} bytes)`);
      const parsed = await parseImportFile(file);
      console.log(`Successfully parsed file with ${parsed.headers.length} columns and ${parsed.data.length} rows`);
      setParsedData(parsed);
      
      // Create default field mappings based on headers
      const defaultMappings = createDefaultMappings(parsed.headers);
      setFieldMappings(defaultMappings);
      
      // Move to mapping step
      setImportStep('mapping');
      return parsed;
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Error parsing file",
        description: error instanceof Error ? error.message : "There was an error parsing your file.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to update field mappings
  const updateFieldMapping = (index: number, mapping: Partial<FieldMapping>) => {
    setFieldMappings(prev => {
      const newMappings = [...prev];
      newMappings[index] = { ...newMappings[index], ...mapping };
      return newMappings;
    });
  };
  
  // Function to add a new field mapping
  const addFieldMapping = (mapping: FieldMapping) => {
    setFieldMappings(prev => [...prev, mapping]);
  };
  
  // Function to remove a field mapping
  const removeFieldMapping = (index: number) => {
    setFieldMappings(prev => prev.filter((_, i) => i !== index));
  };
    // Function to validate the mapped data
  const validateData = async (): Promise<{valid: boolean; errors: string[]; validData: Record<string, unknown>[]} | null> => {
    console.log("validateData called");
    if (!parsedData) {
      console.error("validateData: parsedData is null");
      return null;
    }
    
    setIsProcessing(true);
    try {
      console.log("Validating data with field mappings:", fieldMappings);      // Validate the data based on field mappings
      const validation = validateImportData(parsedData.data, fieldMappings);
      console.log("Validation results:", validation);
      setValidationResults(validation);
      
      if (validation.valid && validation.validData.length > 0) {
        console.log("Validation successful, checking for duplicates");
        // Check for duplicates
        if (!user) {
          console.error("User not authenticated");
          throw new Error("User not authenticated");
        }
        
        const emails = validation.validData
          .map(item => {
            // Find the email field mapping
            const emailMapping = fieldMappings.find(m => m.targetField === 'email');
            if (!emailMapping) return null;
            return item[emailMapping.sourceField] as string;
          })
          .filter((email): email is string => email !== null);
          const duplicateCheck = await checkForDuplicates(user.id, emails);
        console.log("Duplicate check results:", duplicateCheck);
        setDuplicateEmails(duplicateCheck.duplicates);
        
        // Move to validation step
        console.log("Moving to validation step");
        setImportStep('validation');
      } else {
        console.log("Validation failed or no valid data");
      }
      
      return validation;
    } catch (error) {
      console.error("Error validating data:", error);
      toast({
        title: "Validation error",
        description: error instanceof Error ? error.message : "There was an error validating your data.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to start the import process
  const startImport = (skipDuplicates: boolean = false) => {
    if (!validationResults || !validationResults.valid) return;
    
    setImportStep('import');
    setIsProcessing(true);
    
    let dataToImport = validationResults.validData;
    
    // If skipping duplicates, filter out any records with duplicate emails
    if (skipDuplicates && duplicateEmails.length > 0) {
      dataToImport = dataToImport.filter(item => {
        const emailMapping = fieldMappings.find(m => m.targetField === 'email');
        if (!emailMapping) return true;
        const email = item[emailMapping.sourceField] as string;
        return !duplicateEmails.includes(email);
      });
    }
    
    importMutation.mutate({
      mappedData: dataToImport,
      fieldMappings
    });
  };
    // Function to undo the import
  const handleUndoImport = () => {
    if (!user || !lastImportedIds.length) {
      toast({
        title: "Cannot undo import",
        description: "Unable to undo the import. You may have refreshed the page or the import session expired.",
        variant: "destructive",
      });
      return;
    }
    
    setUndoInProgress(true);
    undoImportMutation.mutate();
  };
  
  // Function to reset the import process
  const resetImport = () => {
    setParsedData(null);
    setFieldMappings([]);
    setValidationResults(null);
    setDuplicateEmails([]);
    setImportStep('upload');
    setIsProcessing(false);
    setLastImportedIds([]);
    setCanUndo(false);
    setImportResult(null);
    setUndoInProgress(false);
  };
  
  return {
    isProcessing,
    parsedData,
    fieldMappings,
    validationResults,
    duplicateEmails,
    importStep,
    importResult,
    canUndo,
    undoInProgress,
    parseFile,
    updateFieldMapping,
    addFieldMapping,
    removeFieldMapping,
    validateData,
    startImport,
    handleUndoImport,
    resetImport
  };
}
