import { Injectable, Inject } from '@nestjs/common';
import { LegalQueryRequest, LegalQueryResponse, QueryType } from '@/domain/entities/legal-query.entity';
import { ILegalQueryRepository } from '@/domain/repositories/legal-query.repository.interface';
import { ILegalQueryService } from '@/domain/services/legal-query.service.interface';
import { v4 as uuidv4 } from 'uuid';
import { LEGAL_QUERY_REPOSITORY } from '@/domain/repositories/legal-query.repository.interface';
import { LEGAL_QUERY_SERVICE } from '@/domain/services/legal-query.service.interface';

export interface ProcessLegalQueryRequest {
  question: string;
  context?: string;
  queryType?: string;
  userId?: string;
}

export interface ProcessLegalQueryResponse {
  response: LegalQueryResponse;
  success: boolean;
  message: string;
}

@Injectable()
export class ProcessLegalQueryUseCase {
  constructor(
    @Inject(LEGAL_QUERY_REPOSITORY)
    private readonly queryRepository: ILegalQueryRepository,
    @Inject(LEGAL_QUERY_SERVICE)
    private readonly queryService: ILegalQueryService,
  ) {}

  async execute(request: ProcessLegalQueryRequest): Promise<ProcessLegalQueryResponse> {
    try {
      // Create query request
      const queryRequest: LegalQueryRequest = {
        question: request.question,
        context: request.context,
        queryType: request.queryType as any,
        userId: request.userId,
      };

      // Create LegalQuery entity
      const legalQuery = {
        id: uuidv4(),
        question: queryRequest.question,
        context: queryRequest.context,
        queryType: queryRequest.queryType || QueryType.LEGAL_QUESTION,
        userId: queryRequest.userId,
        createdAt: new Date(),
      };

      // Process the query using domain service
      const queryResponse = await this.queryService.processQuery(queryRequest);

      // Save query and response to repository
      await this.queryRepository.save(legalQuery);
      await this.queryRepository.saveResponse(queryResponse);

      return {
        response: queryResponse,
        success: true,
        message: 'Legal query processed successfully',
      };
    } catch (error) {
      return {
        response: null,
        success: false,
        message: `Failed to process legal query: ${error.message}`,
      };
    }
  }
} 