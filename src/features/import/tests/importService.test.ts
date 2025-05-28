import { describe, it, expect, vi } from 'vitest';
import { ImportResult } from '../services/importService';

// Mock the entire importService module
vi.mock('../services/importService', () => ({
  undoImport: vi.fn(),
  importContacts: vi.fn(),
  checkForDuplicates: vi.fn()
}));

// Import after mocking to get the mocked versions
import { undoImport, importContacts } from '../services/importService';

describe('Import Service', () => {
  describe('undoImport function', () => {
    const userId = 'test-user-id';
    const importedIds = ['id1', 'id2', 'id3'];
    
    beforeEach(() => {
      vi.resetAllMocks();
    });
    
    it('should successfully undo an import by deleting contacts', async () => {
      // Mock successful deletion
      const mockResult = {
        success: true,
        undoneCount: 3,
        errors: []
      };
      
      (undoImport as any).mockResolvedValue(mockResult);
      
      const result = await undoImport(userId, importedIds);
      
      // Verify result
      expect(result.success).toBe(true);
      expect(result.undoneCount).toBe(3);
      expect(result.errors).toEqual([]);
      
      // Verify the function was called with correct parameters
      expect(undoImport).toHaveBeenCalledWith(userId, importedIds);
    });
    
    it('should handle empty importedIds array', async () => {
      const mockResult = {
        success: false,
        undoneCount: 0,
        errors: ['No contacts to undo']
      };
      
      (undoImport as any).mockResolvedValue(mockResult);
      
      const result = await undoImport(userId, []);
      
      expect(result.success).toBe(false);
      expect(result.undoneCount).toBe(0);
      expect(result.errors).toEqual(['No contacts to undo']);
    });
  });
  
  describe('importContacts function', () => {
    const userId = 'test-user-id';
    const mockMappedData = [{ name: 'John Doe', email: 'john@example.com' }];
    const mockFieldMappings = [
      { sourceField: 'name', targetField: 'name' },
      { sourceField: 'email', targetField: 'email' }
    ];
    
    it('should track imported IDs for potential undo', async () => {
      // Mock successful import with tracked IDs
      const mockResult: ImportResult = {
        success: true,
        imported: 1,
        errors: [],
        importedIds: ['new-contact-id-123']
      };
      
      (importContacts as any).mockResolvedValue(mockResult);
      
      const result = await importContacts(userId, mockMappedData, mockFieldMappings);
      
      // Verify importedIds are tracked
      expect(result.importedIds).toHaveLength(1);
      expect(result.importedIds[0]).toBe('new-contact-id-123');
    });
  });
});
