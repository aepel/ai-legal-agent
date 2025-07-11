import { LegalWriting, WritingDocumentType, LegalWritingResponse, DocumentSection, LegalDocumentReference, LegalWritingRequest } from '../legal-writing.entity';

describe('LegalWriting Entity', () => {
  const mockDocumentReference: LegalDocumentReference = {
    documentId: 'doc-123',
    title: 'Test Document',
    relevantSections: ['Section 1', 'Section 2'],
    relevanceScore: 0.85,
  };

  const mockDocumentSection: DocumentSection = {
    title: 'Introduction',
    content: 'This is the introduction section.',
    order: 1,
  };

  const mockWriting: LegalWriting = {
    id: 'writing-123',
    title: 'Demanda por Alimentos',
    prompt: 'Redactar una demanda por alimentos para un menor',
    documentType: WritingDocumentType.COMPLAINT,
    context: 'Padre no cumple con obligación alimentaria',
    createdAt: new Date('2024-01-01'),
    userId: 'user-123',
  };

  const mockResponse: LegalWritingResponse = {
    id: 'response-123',
    writingId: 'writing-123',
    content: 'DEMANDA POR ALIMENTOS\n\nVISTO: El presente escrito...',
    title: 'Demanda por Alimentos',
    sections: [mockDocumentSection],
    sources: [mockDocumentReference],
    confidence: 0.9,
    createdAt: new Date('2024-01-01'),
  };

  describe('LegalWriting', () => {
    it('should create a valid legal writing', () => {
      expect(mockWriting).toBeDefined();
      expect(mockWriting.id).toBe('writing-123');
      expect(mockWriting.title).toBe('Demanda por Alimentos');
      expect(mockWriting.documentType).toBe(WritingDocumentType.COMPLAINT);
    });

    it('should have required properties', () => {
      expect(mockWriting).toHaveProperty('id');
      expect(mockWriting).toHaveProperty('title');
      expect(mockWriting).toHaveProperty('prompt');
      expect(mockWriting).toHaveProperty('documentType');
      expect(mockWriting).toHaveProperty('createdAt');
    });

    it('should handle optional properties', () => {
      const writingWithoutOptional: LegalWriting = {
        id: 'writing-456',
        title: 'Simple Document',
        prompt: 'Simple prompt',
        documentType: WritingDocumentType.OTHER,
        createdAt: new Date(),
      };

      expect(writingWithoutOptional.context).toBeUndefined();
      expect(writingWithoutOptional.userId).toBeUndefined();
    });
  });

  describe('WritingDocumentType enum', () => {
    it('should have all required document types', () => {
      expect(WritingDocumentType.COMPLAINT).toBe('COMPLAINT');
      expect(WritingDocumentType.MOTION).toBe('MOTION');
      expect(WritingDocumentType.BRIEF).toBe('BRIEF');
      expect(WritingDocumentType.CONTRACT).toBe('CONTRACT');
      expect(WritingDocumentType.LEGAL_OPINION).toBe('LEGAL_OPINION');
      expect(WritingDocumentType.DEMAND_LETTER).toBe('DEMAND_LETTER');
      expect(WritingDocumentType.OTHER).toBe('OTHER');
    });

    it('should have correct number of document types', () => {
      const documentTypes = Object.values(WritingDocumentType);
      expect(documentTypes).toHaveLength(7);
    });
  });

  describe('LegalWritingResponse', () => {
    it('should create a valid writing response', () => {
      expect(mockResponse).toBeDefined();
      expect(mockResponse.id).toBe('response-123');
      expect(mockResponse.writingId).toBe('writing-123');
      expect(mockResponse.title).toBe('Demanda por Alimentos');
      expect(mockResponse.confidence).toBe(0.9);
    });

    it('should have required properties', () => {
      expect(mockResponse).toHaveProperty('id');
      expect(mockResponse).toHaveProperty('writingId');
      expect(mockResponse).toHaveProperty('content');
      expect(mockResponse).toHaveProperty('title');
      expect(mockResponse).toHaveProperty('sections');
      expect(mockResponse).toHaveProperty('sources');
      expect(mockResponse).toHaveProperty('confidence');
      expect(mockResponse).toHaveProperty('createdAt');
    });

    it('should have confidence between 0 and 1', () => {
      expect(mockResponse.confidence).toBeGreaterThanOrEqual(0);
      expect(mockResponse.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('DocumentSection', () => {
    it('should create a valid document section', () => {
      expect(mockDocumentSection).toBeDefined();
      expect(mockDocumentSection.title).toBe('Introduction');
      expect(mockDocumentSection.content).toBe('This is the introduction section.');
      expect(mockDocumentSection.order).toBe(1);
    });

    it('should have required properties', () => {
      expect(mockDocumentSection).toHaveProperty('title');
      expect(mockDocumentSection).toHaveProperty('content');
      expect(mockDocumentSection).toHaveProperty('order');
    });

    it('should have positive order number', () => {
      expect(mockDocumentSection.order).toBeGreaterThan(0);
    });
  });

  describe('LegalWritingRequest', () => {
    const mockRequest: LegalWritingRequest = {
      title: 'Test Document',
      prompt: 'Test prompt',
      documentType: WritingDocumentType.CONTRACT,
      context: 'Test context',
      userId: 'user-123',
    };

    it('should create a valid writing request', () => {
      expect(mockRequest).toBeDefined();
      expect(mockRequest.title).toBe('Test Document');
      expect(mockRequest.prompt).toBe('Test prompt');
      expect(mockRequest.documentType).toBe(WritingDocumentType.CONTRACT);
      expect(mockRequest.context).toBe('Test context');
      expect(mockRequest.userId).toBe('user-123');
    });

    it('should handle optional properties', () => {
      const requestWithoutOptional: LegalWritingRequest = {
        title: 'Simple Document',
        prompt: 'Simple prompt',
        documentType: WritingDocumentType.OTHER,
      };

      expect(requestWithoutOptional.context).toBeUndefined();
      expect(requestWithoutOptional.userId).toBeUndefined();
    });
  });

  describe('Writing validation', () => {
    it('should validate writing with all required fields', () => {
      const validWriting: LegalWriting = {
        id: 'valid-id',
        title: 'Valid Document',
        prompt: 'Valid prompt',
        documentType: WritingDocumentType.BRIEF,
        createdAt: new Date(),
      };

      expect(validWriting.id).toBeTruthy();
      expect(validWriting.title).toBeTruthy();
      expect(validWriting.prompt).toBeTruthy();
      expect(Object.values(WritingDocumentType)).toContain(validWriting.documentType);
    });

    it('should validate response with all required fields', () => {
      const validResponse: LegalWritingResponse = {
        id: 'valid-response-id',
        writingId: 'valid-writing-id',
        content: 'Valid content',
        title: 'Valid title',
        sections: [],
        sources: [],
        confidence: 0.8,
        createdAt: new Date(),
      };

      expect(validResponse.id).toBeTruthy();
      expect(validResponse.writingId).toBeTruthy();
      expect(validResponse.content).toBeTruthy();
      expect(validResponse.title).toBeTruthy();
      expect(validResponse.confidence).toBeGreaterThanOrEqual(0);
      expect(validResponse.confidence).toBeLessThanOrEqual(1);
    });

    it('should validate document section with all required fields', () => {
      const validSection: DocumentSection = {
        title: 'Valid Section',
        content: 'Valid content',
        order: 1,
      };

      expect(validSection.title).toBeTruthy();
      expect(validSection.content).toBeTruthy();
      expect(validSection.order).toBeGreaterThan(0);
    });
  });

  describe('Document type validation', () => {
    it('should validate all writing document types', () => {
      const documentTypes = Object.values(WritingDocumentType);
      
      documentTypes.forEach(type => {
        const validWriting: LegalWriting = {
          id: `test-${type}`,
          title: `Test ${type}`,
          prompt: `Test prompt for ${type}`,
          documentType: type,
          createdAt: new Date(),
        };

        expect(validWriting.documentType).toBe(type);
        expect(Object.values(WritingDocumentType)).toContain(validWriting.documentType);
      });
    });
  });
}); 