import { LegalDocument, DocumentType, DocumentMetadata, LegalDocumentSearchResult } from '../legal-document.entity';

describe('LegalDocument Entity', () => {
  const mockMetadata: DocumentMetadata = {
    fileName: 'test-document.pdf',
    fileSize: 1024,
    pageCount: 10,
    language: 'es',
    jurisdiction: 'Argentina',
    tags: ['test', 'legal'],
    summary: 'Test document summary',
  };

  const mockDocument: LegalDocument = {
    id: 'test-id-123',
    title: 'Test Legal Document',
    content: 'This is the content of the test legal document.',
    source: 'test-document.pdf',
    documentType: DocumentType.CIVIL_CODE,
    metadata: mockMetadata,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('LegalDocument', () => {
    it('should create a valid legal document', () => {
      expect(mockDocument).toBeDefined();
      expect(mockDocument.id).toBe('test-id-123');
      expect(mockDocument.title).toBe('Test Legal Document');
      expect(mockDocument.documentType).toBe(DocumentType.CIVIL_CODE);
    });

    it('should have required properties', () => {
      expect(mockDocument).toHaveProperty('id');
      expect(mockDocument).toHaveProperty('title');
      expect(mockDocument).toHaveProperty('content');
      expect(mockDocument).toHaveProperty('source');
      expect(mockDocument).toHaveProperty('documentType');
      expect(mockDocument).toHaveProperty('metadata');
      expect(mockDocument).toHaveProperty('createdAt');
      expect(mockDocument).toHaveProperty('updatedAt');
    });

    it('should have valid metadata', () => {
      expect(mockDocument.metadata.fileName).toBe('test-document.pdf');
      expect(mockDocument.metadata.language).toBe('es');
      expect(mockDocument.metadata.jurisdiction).toBe('Argentina');
      expect(mockDocument.metadata.tags).toContain('test');
      expect(mockDocument.metadata.tags).toContain('legal');
    });
  });

  describe('DocumentType enum', () => {
    it('should have all required document types', () => {
      expect(DocumentType.PENAL_CODE).toBe('PENAL_CODE');
      expect(DocumentType.CIVIL_CODE).toBe('CIVIL_CODE');
      expect(DocumentType.COMMERCIAL_CODE).toBe('COMMERCIAL_CODE');
      expect(DocumentType.CASE_LAW).toBe('CASE_LAW');
      expect(DocumentType.LEGAL_OPINION).toBe('LEGAL_OPINION');
      expect(DocumentType.OTHER).toBe('OTHER');
    });

    it('should have correct number of document types', () => {
      const documentTypes = Object.values(DocumentType);
      expect(documentTypes).toHaveLength(6);
    });
  });

  describe('DocumentMetadata', () => {
    it('should create valid metadata', () => {
      expect(mockMetadata.fileName).toBe('test-document.pdf');
      expect(mockMetadata.fileSize).toBe(1024);
      expect(mockMetadata.pageCount).toBe(10);
      expect(mockMetadata.language).toBe('es');
      expect(mockMetadata.jurisdiction).toBe('Argentina');
      expect(mockMetadata.tags).toEqual(['test', 'legal']);
      expect(mockMetadata.summary).toBe('Test document summary');
    });

    it('should handle optional properties', () => {
      const metadataWithoutOptional: DocumentMetadata = {
        fileName: 'test.pdf',
        fileSize: 512,
        language: 'es',
        jurisdiction: 'Argentina',
        tags: [],
      };

      expect(metadataWithoutOptional.pageCount).toBeUndefined();
      expect(metadataWithoutOptional.summary).toBeUndefined();
    });
  });

  describe('LegalDocumentSearchResult', () => {
    const mockSearchResult: LegalDocumentSearchResult = {
      document: mockDocument,
      relevanceScore: 0.85,
      matchedSections: ['Section 1', 'Section 2'],
    };

    it('should create valid search result', () => {
      expect(mockSearchResult.document).toBe(mockDocument);
      expect(mockSearchResult.relevanceScore).toBe(0.85);
      expect(mockSearchResult.matchedSections).toEqual(['Section 1', 'Section 2']);
    });

    it('should have relevance score between 0 and 1', () => {
      expect(mockSearchResult.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(mockSearchResult.relevanceScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Document validation', () => {
    it('should validate document with all required fields', () => {
      const validDocument: LegalDocument = {
        id: 'valid-id',
        title: 'Valid Document',
        content: 'Valid content',
        source: 'valid.pdf',
        documentType: DocumentType.PENAL_CODE,
        metadata: {
          fileName: 'valid.pdf',
          fileSize: 1000,
          language: 'es',
          jurisdiction: 'Argentina',
          tags: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validDocument.id).toBeTruthy();
      expect(validDocument.title).toBeTruthy();
      expect(validDocument.content).toBeTruthy();
      expect(validDocument.source).toBeTruthy();
      expect(Object.values(DocumentType)).toContain(validDocument.documentType);
    });
  });
}); 