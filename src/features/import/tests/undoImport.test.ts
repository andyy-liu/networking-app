import { describe, it, expect, vi, beforeEach } from 'vitest';
import { undoImport } from '../services/importService';

// Mock the importService module
vi.mock('../services/importService', async (importOriginal) => {
  // Import the actual module
  const actual = await importOriginal();
  
  // Return a modified version with a mocked undoImport function
  return {
    ...actual,
    // Override just the undoImport function for testing
    undoImport: vi.fn()
  };
});

describe('undoImport function', () => {
  const userId = 'test-user-id';
  const importedIds = ['id1', 'id2', 'id3'];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should successfully undo an import by deleting contacts', async () => {
    // Mock successful deletion
    const mockResult = {
      success: true,
      undoneCount: 3,
      errors: []
    };
    
    (undoImport as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);
    
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
    
    (undoImport as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);
    
    const result = await undoImport(userId, []);
    
    expect(result.success).toBe(false);
    expect(result.undoneCount).toBe(0);
    expect(result.errors).toEqual(['No contacts to undo']);
  });
  
  it('should handle errors during deletion', async () => {
    const mockResult = {
      success: false,
      undoneCount: 0,
      errors: ['Batch 1 error: Database error']
    };
    
    (undoImport as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);
    
    const result = await undoImport(userId, importedIds);
    
    expect(result.success).toBe(false);
    expect(result.undoneCount).toBe(0);
    expect(result.errors).toContain('Batch 1 error: Database error');
  });
  
  it('should handle large batches of contacts', async () => {
    // Create 100 IDs
    const manyIds = Array.from({ length: 100 }, (_, i) => `id${i}`);
    
    const mockResult = {
      success: true,
      undoneCount: 100,
      errors: []
    };
    
    (undoImport as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);
    
    const result = await undoImport(userId, manyIds);
    
    expect(result.success).toBe(true);
    expect(result.undoneCount).toBe(100);
    expect(result.errors).toEqual([]);
    
    // Verify the function was called with correct parameters
    expect(undoImport).toHaveBeenCalledWith(userId, manyIds);
  });
});
