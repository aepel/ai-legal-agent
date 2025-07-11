import { LegalQuery, QueryType, LegalQueryResponse } from '../entities/legal-query.entity';

export interface ILegalQueryRepository {
  save(query: LegalQuery): Promise<LegalQuery>;
  findById(id: string): Promise<LegalQuery | null>;
  findByType(queryType: QueryType): Promise<LegalQuery[]>;
  findAll(): Promise<LegalQuery[]>;
  delete(id: string): Promise<boolean>;
  saveResponse(response: LegalQueryResponse): Promise<LegalQueryResponse>;
  findResponseById(id: string): Promise<LegalQueryResponse | null>;
  findResponsesByQueryId(queryId: string): Promise<LegalQueryResponse[]>;
}

export const LEGAL_QUERY_REPOSITORY = 'LEGAL_QUERY_REPOSITORY'; 