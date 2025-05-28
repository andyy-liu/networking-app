import { describe, it, expect } from 'vitest';
import { createDefaultMappings, mapToContacts } from '../utils/fileImport';

describe('FileImport Utilities', () => {
  describe('createDefaultMappings', () => {
    it('should create mappings for known headers', () => {
      const headers = ['name', 'email', 'job title', 'company name', 'last contacted', 'status', 'tags'];
      const mappings = createDefaultMappings(headers);
      
      expect(mappings).toHaveLength(7);
      expect(mappings.find(m => m.sourceField === 'name')?.targetField).toBe('name');
      expect(mappings.find(m => m.sourceField === 'email')?.targetField).toBe('email');
      expect(mappings.find(m => m.sourceField === 'job title')?.targetField).toBe('role');
      expect(mappings.find(m => m.sourceField === 'company name')?.targetField).toBe('company');
      expect(mappings.find(m => m.sourceField === 'last contacted')?.targetField).toBe('dateOfContact');
      expect(mappings.find(m => m.sourceField === 'status')?.targetField).toBe('status');
      expect(mappings.find(m => m.sourceField === 'tags')?.targetField).toBe('tags');
    });
    
    it('should handle unknown headers', () => {
      const headers = ['unknown1', 'unknown2', 'email'];
      const mappings = createDefaultMappings(headers);
      
      expect(mappings).toHaveLength(1);
      expect(mappings[0].sourceField).toBe('email');
      expect(mappings[0].targetField).toBe('email');
    });
  });
  
  describe('mapToContacts', () => {
    it('should map data to contacts based on mappings', () => {
      const data = [
        { name: 'John Doe', email: 'john@example.com', role: 'Developer', tags: 'important,follow-up' },
        { name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', tags: 'new' }
      ];
      
      const mappings = [
        { sourceField: 'name', targetField: 'name' as const },
        { sourceField: 'email', targetField: 'email' as const },
        { sourceField: 'role', targetField: 'role' as const },
        { 
          sourceField: 'tags', 
          targetField: 'tags' as const,        transform: (value: unknown) => 
          typeof value === 'string' ? value.split(',').map(tag => tag.trim()) : []
        }
      ];
      
      const contacts = mapToContacts(data, mappings);
      
      expect(contacts).toHaveLength(2);
      expect(contacts[0].name).toBe('John Doe');
      expect(contacts[0].email).toBe('john@example.com');
      expect(contacts[0].role).toBe('Developer');
      expect(contacts[0].tags).toEqual(['important', 'follow-up']);
      
      expect(contacts[1].name).toBe('Jane Smith');
      expect(contacts[1].email).toBe('jane@example.com');
      expect(contacts[1].role).toBe('Designer');
      expect(contacts[1].tags).toEqual(['new']);
    });
    
    it('should set default values for missing fields', () => {
      const data = [
        { name: 'John Doe', email: 'john@example.com' }
      ];
      
      const mappings = [
        { sourceField: 'name', targetField: 'name' as const },
        { sourceField: 'email', targetField: 'email' as const }
      ];
      
      const contacts = mapToContacts(data, mappings);
      
      expect(contacts[0].name).toBe('John Doe');
      expect(contacts[0].email).toBe('john@example.com');
      expect(contacts[0].role).toBe('');
      expect(contacts[0].company).toBe('');
      expect(contacts[0].tags).toEqual([]);
      expect(contacts[0].status).toBe('Reached Out');
      expect(contacts[0].dateOfContact).toBeTruthy();
    });
  });
});
