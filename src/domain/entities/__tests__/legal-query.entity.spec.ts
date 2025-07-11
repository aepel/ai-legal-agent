import { LegalQuery, QueryType, LegalQueryResponse, LegalDocumentReference, LegalQueryRequest } from '../legal-query.entity';

describe('LegalQuery Entity', () => {
  const mockDocumentReference: LegalDocumentReference = {
    documentId: 'doc-123',
    title: 'Test Document',
    relevantSections: ['Section 1', 'Section 2'],
    relevanceScore: 0.85,
  };

  const mockQuery: LegalQuery = {
    id: 'query-123',
    question: '¿Qué dice el Código Civil sobre la responsabilidad parental?',
    context: 'Caso de custodia compartida',
    queryType: QueryType.LEGAL_QUESTION,
    createdAt: new Date('2024-01-01'),
    userId: 'user-123',
  };

  const mockResponse: LegalQueryResponse = {
    id: 'response-123',
    queryId: 'query-123',
    answer: 'La responsabilidad parental se regula en el Código Civil...',
    sources: [mockDocumentReference],
    confidence: 0.9,
    reasoning: 'Basado en el análisis del Código Civil...',
    createdAt: new Date('2024-01-01'),
  };

  describe('LegalQuery', () => {
    it('should create a valid legal query', () => {
      expect(mockQuery).toBeDefined();
      expect(mockQuery.id).toBe('query-123');
      expect(mockQuery.question).toBe('¿Qué dice el Código Civil sobre la responsabilidad parental?');
      expect(mockQuery.queryType).toBe(QueryType.LEGAL_QUESTION);
    });

    it('should have required properties', () => {
      expect(mockQuery).toHaveProperty('id');
      expect(mockQuery).toHaveProperty('question');
      expect(mockQuery).toHaveProperty('queryType');
      expect(mockQuery).toHaveProperty('createdAt');
    });

    it('should handle optional properties', () => {
      const queryWithoutOptional: LegalQuery = {
        id: 'query-456',
        question: 'Simple question',
        queryType: QueryType.DOCUMENT_SEARCH,
        createdAt: new Date(),
      };

      expect(queryWithoutOptional.context).toBeUndefined();
      expect(queryWithoutOptional.userId).toBeUndefined();
    });
  });

  describe('QueryType enum', () => {
    it('should have all required query types', () => {
      expect(QueryType.LEGAL_QUESTION).toBe('LEGAL_QUESTION');
      expect(QueryType.DOCUMENT_SEARCH).toBe('DOCUMENT_SEARCH');
      expect(QueryType.CASE_ANALYSIS).toBe('CASE_ANALYSIS');
      expect(QueryType.STATUTE_INTERPRETATION).toBe('STATUTE_INTERPRETATION');
    });

    it('should have correct number of query types', () => {
      const queryTypes = Object.values(QueryType);
      expect(queryTypes).toHaveLength(4);
    });
  });

  describe('LegalQueryResponse', () => {
    it('should create a valid query response', () => {
      expect(mockResponse).toBeDefined();
      expect(mockResponse.id).toBe('response-123');
      expect(mockResponse.queryId).toBe('query-123');
      expect(mockResponse.answer).toBe('La responsabilidad parental se regula en el Código Civil...');
      expect(mockResponse.confidence).toBe(0.9);
    });

    it('should have required properties', () => {
      expect(mockResponse).toHaveProperty('id');
      expect(mockResponse).toHaveProperty('queryId');
      expect(mockResponse).toHaveProperty('answer');
      expect(mockResponse).toHaveProperty('sources');
      expect(mockResponse).toHaveProperty('confidence');
      expect(mockResponse).toHaveProperty('reasoning');
      expect(mockResponse).toHaveProperty('createdAt');
    });

    it('should have confidence between 0 and 1', () => {
      expect(mockResponse.confidence).toBeGreaterThanOrEqual(0);
      expect(mockResponse.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('LegalDocumentReference', () => {
    it('should create a valid document reference', () => {
      expect(mockDocumentReference).toBeDefined();
      expect(mockDocumentReference.documentId).toBe('doc-123');
      expect(mockDocumentReference.title).toBe('Test Document');
      expect(mockDocumentReference.relevantSections).toEqual(['Section 1', 'Section 2']);
      expect(mockDocumentReference.relevanceScore).toBe(0.85);
    });

    it('should have relevance score between 0 and 1', () => {
      expect(mockDocumentReference.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(mockDocumentReference.relevanceScore).toBeLessThanOrEqual(1);
    });
  });

  describe('LegalQueryRequest', () => {
    const mockRequest: LegalQueryRequest = {
      question: 'Test question',
      context: 'Test context',
      queryType: QueryType.LEGAL_QUESTION,
      userId: 'user-123',
    };

    it('should create a valid query request', () => {
      expect(mockRequest).toBeDefined();
      expect(mockRequest.question).toBe('Test question');
      expect(mockRequest.context).toBe('Test context');
      expect(mockRequest.queryType).toBe(QueryType.LEGAL_QUESTION);
      expect(mockRequest.userId).toBe('user-123');
    });

    it('should handle optional properties', () => {
      const requestWithoutOptional: LegalQueryRequest = {
        question: 'Simple question',
      };

      expect(requestWithoutOptional.context).toBeUndefined();
      expect(requestWithoutOptional.queryType).toBeUndefined();
      expect(requestWithoutOptional.userId).toBeUndefined();
    });
  });

  describe('Query validation', () => {
    it('should validate query with all required fields', () => {
      const validQuery: LegalQuery = {
        id: 'valid-id',
        question: 'Valid question',
        queryType: QueryType.DOCUMENT_SEARCH,
        createdAt: new Date(),
      };

      expect(validQuery.id).toBeTruthy();
      expect(validQuery.question).toBeTruthy();
      expect(Object.values(QueryType)).toContain(validQuery.queryType);
    });

    it('should validate response with all required fields', () => {
      const validResponse: LegalQueryResponse = {
        id: 'valid-response-id',
        queryId: 'valid-query-id',
        answer: 'Valid answer',
        sources: [],
        confidence: 0.8,
        reasoning: 'Valid reasoning',
        createdAt: new Date(),
      };

      expect(validResponse.id).toBeTruthy();
      expect(validResponse.queryId).toBeTruthy();
      expect(validResponse.answer).toBeTruthy();
      expect(validResponse.confidence).toBeGreaterThanOrEqual(0);
      expect(validResponse.confidence).toBeLessThanOrEqual(1);
    });
  });
}); 