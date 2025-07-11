import { Injectable } from '@nestjs/common';
import { LegalQuery, QueryType, LegalQueryResponse } from '@/domain/entities/legal-query.entity';
import { ILegalQueryRepository } from '@/domain/repositories/legal-query.repository.interface';

@Injectable()
export class LegalQueryRepository implements ILegalQueryRepository {
  private queries: Map<string, LegalQuery> = new Map();
  private responses: Map<string, LegalQueryResponse> = new Map();

  async save(query: LegalQuery): Promise<LegalQuery> {
    this.queries.set(query.id, query);
    return query;
  }

  async findById(id: string): Promise<LegalQuery | null> {
    return this.queries.get(id) || null;
  }

  async findByType(queryType: QueryType): Promise<LegalQuery[]> {
    return Array.from(this.queries.values()).filter(q => q.queryType === queryType);
  }

  async findAll(): Promise<LegalQuery[]> {
    return Array.from(this.queries.values());
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.queries.has(id);
    this.queries.delete(id);
    return existed;
  }

  async saveResponse(response: LegalQueryResponse): Promise<LegalQueryResponse> {
    this.responses.set(response.id, response);
    return response;
  }

  async findResponseById(id: string): Promise<LegalQueryResponse | null> {
    return this.responses.get(id) || null;
  }

  async findResponsesByQueryId(queryId: string): Promise<LegalQueryResponse[]> {
    return Array.from(this.responses.values()).filter(r => r.queryId === queryId);
  }
} 