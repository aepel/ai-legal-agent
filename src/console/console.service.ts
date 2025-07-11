import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { IndexDocumentUseCase } from '@/application/use-cases/document-indexing.use-case';
import { ProcessLegalQueryUseCase } from '@/application/use-cases/legal-query.use-case';
import { GenerateLegalDocumentUseCase } from '@/application/use-cases/legal-writing.use-case';
import { DocumentType } from '@/domain/entities/legal-document.entity';
import { WritingDocumentType } from '@/domain/entities/legal-writing.entity';

export interface ConsoleCommand {
  name: string;
  description: string;
  handler: (args: string[]) => Promise<void>;
}

@Injectable()
export class ConsoleService {
  private rl: readline.Interface;
  private commands: Map<string, ConsoleCommand> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly indexDocumentUseCase: IndexDocumentUseCase,
    private readonly processLegalQueryUseCase: ProcessLegalQueryUseCase,
    private readonly generateLegalDocumentUseCase: GenerateLegalDocumentUseCase,
  ) {
    this.initializeCommands();
  }

  private initializeCommands(): void {
    this.commands.set('help', {
      name: 'help',
      description: 'Show available commands',
      handler: this.showHelp.bind(this),
    });

    this.commands.set('index', {
      name: 'index',
      description: 'Index a legal document: index <filePath> <documentType>',
      handler: this.indexDocument.bind(this),
    });

    this.commands.set('query', {
      name: 'query',
      description: 'Ask a legal question: query <question>',
      handler: this.processQuery.bind(this),
    });

    this.commands.set('generate', {
      name: 'generate',
      description: 'Generate a legal document: generate <title> <prompt> <documentType>',
      handler: this.generateDocument.bind(this),
    });

    this.commands.set('list', {
      name: 'list',
      description: 'List available document types and examples',
      handler: this.listExamples.bind(this),
    });

    this.commands.set('clear', {
      name: 'clear',
      description: 'Clear the console',
      handler: this.clearConsole.bind(this),
    });

    this.commands.set('exit', {
      name: 'exit',
      description: 'Exit the console',
      handler: this.exit.bind(this),
    });

    this.commands.set('auto-index', {
      name: 'auto-index',
      description: 'Automatically index all documents in assets folder',
      handler: this.autoIndexAssets.bind(this),
    });
  }

  async start(): Promise<void> {
    console.log('\n🚀 Welcome to Lawer.AI Console Interface');
    console.log('==========================================');
    
    // Auto-index assets on startup
    await this.autoIndexAssets();
    
    console.log('Type "help" to see available commands');
    console.log('Type "exit" to quit\n');

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'lawer.ai> ',
    });

    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const trimmedInput = input.trim();
      
      if (trimmedInput === '') {
        this.rl.prompt();
        return;
      }

      const [command, ...args] = trimmedInput.split(' ');
      const cmd = this.commands.get(command.toLowerCase());

      if (cmd) {
        try {
          await cmd.handler(args);
        } catch (error) {
          console.error(`❌ Error: ${error.message}`);
        }
      } else {
        console.error(`❌ Unknown command: ${command}`);
        console.log('Type "help" to see available commands');
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye!');
      process.exit(0);
    });
  }

  private async showHelp(): Promise<void> {
    console.log('\n📋 Available Commands:');
    console.log('======================');
    
    for (const command of this.commands.values()) {
      console.log(`${command.name.padEnd(10)} - ${command.description}`);
    }
    
    console.log('\n💡 Examples:');
    console.log('  index penal-code/codigo-penal.pdf PENAL_CODE');
    console.log('  query "¿Qué dice el Código Civil sobre la responsabilidad parental?"');
    console.log('  generate "Demanda por Alimentos" "Redactar demanda por alimentos" COMPLAINT');
  }

  public async indexDocument(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: index <filePath> <documentType>');
      console.log('📋 Document types: PENAL_CODE, CIVIL_CODE, COMMERCIAL_CODE, CASE_LAW, LEGAL_OPINION, OTHER');
      return;
    }

    const [filePath, documentType] = args;
    
    if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
      console.log('❌ Invalid document type. Available types:');
      console.log(Object.values(DocumentType).join(', '));
      return;
    }

    console.log(`📚 Indexing document: ${filePath}`);
    
    try {
      const result = await this.indexDocumentUseCase.execute({
        filePath,
        documentType: documentType as DocumentType,
      });

      if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log(`📄 Document ID: ${result.document.id}`);
        console.log(`📄 Title: ${result.document.title}`);
      } else {
        console.log(`❌ ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Failed to index document: ${error.message}`);
    }
  }

  public async processQuery(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log('❌ Usage: query <question>');
      console.log('💡 Example: query "¿Qué dice el Código Civil sobre la responsabilidad parental?"');
      return;
    }

    const question = args.join(' ');
    console.log(`🤖 Processing query: "${question}"`);
    
    try {
      const result = await this.processLegalQueryUseCase.execute({
        question,
        queryType: 'LEGAL_QUESTION',
      });

      if (result.success) {
        console.log('\n📝 Answer:');
        console.log('==========');
        console.log(result.response.answer);
        console.log(`\n🎯 Confidence: ${(result.response.confidence * 100).toFixed(1)}%`);
        
        if (result.response.sources.length > 0) {
          console.log('\n📚 Sources:');
          result.response.sources.forEach((source, index) => {
            console.log(`${index + 1}. ${source.title} (relevance: ${(source.relevanceScore * 100).toFixed(1)}%)`);
          });
        }
      } else {
        console.log(`❌ ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Failed to process query: ${error.message}`);
    }
  }

  public async generateDocument(args: string[]): Promise<void> {
    if (args.length < 3) {
      console.log('❌ Usage: generate <title> <prompt> <documentType>');
      console.log('📋 Document types: COMPLAINT, MOTION, BRIEF, CONTRACT, LEGAL_OPINION, DEMAND_LETTER, OTHER');
      return;
    }

    const title = args[0];
    const documentType = args[args.length - 1];
    const prompt = args.slice(1, -1).join(' ');

    if (!Object.values(WritingDocumentType).includes(documentType as WritingDocumentType)) {
      console.log('❌ Invalid document type. Available types:');
      console.log(Object.values(WritingDocumentType).join(', '));
      return;
    }

    console.log(`✍️  Generating document: ${title}`);
    console.log(`📝 Prompt: ${prompt}`);
    
    try {
      const result = await this.generateLegalDocumentUseCase.execute({
        title,
        prompt,
        documentType: documentType as WritingDocumentType,
      });

      if (result.success) {
        console.log('\n📄 Generated Document:');
        console.log('=====================');
        console.log(`Title: ${result.response.title}`);
        console.log(`Confidence: ${(result.response.confidence * 100).toFixed(1)}%`);
        
        console.log('\n📝 Content:');
        console.log('===========');
        console.log(result.response.content);
        
        if (result.response.sections.length > 0) {
          console.log('\n📋 Sections:');
          result.response.sections.forEach(section => {
            console.log(`${section.order}. ${section.title}`);
          });
        }
      } else {
        console.log(`❌ ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Failed to generate document: ${error.message}`);
    }
  }

  private async listExamples(): Promise<void> {
    console.log('\n📚 Document Types:');
    console.log('==================');
    console.log('PENAL_CODE      - Argentine Penal Code');
    console.log('CIVIL_CODE      - Argentine Civil Code');
    console.log('COMMERCIAL_CODE - Argentine Commercial Code');
    console.log('CASE_LAW       - Legal precedents and rulings');
    console.log('LEGAL_OPINION  - Legal opinions and analysis');
    console.log('OTHER          - Other legal documents');

    console.log('\n📝 Writing Document Types:');
    console.log('==========================');
    console.log('COMPLAINT      - Legal complaints');
    console.log('MOTION         - Legal motions');
    console.log('BRIEF          - Legal briefs');
    console.log('CONTRACT       - Legal contracts');
    console.log('LEGAL_OPINION  - Legal opinions');
    console.log('DEMAND_LETTER  - Demand letters');
    console.log('OTHER          - Other legal documents');

    console.log('\n💡 Example Commands:');
    console.log('===================');
    console.log('index penal-code/codigo-penal.pdf PENAL_CODE');
    console.log('query "¿Qué dice el Código Civil sobre la responsabilidad parental?"');
    console.log('generate "Demanda por Alimentos" "Redactar una demanda por alimentos para un menor" COMPLAINT');
    console.log('query "¿Cuáles son los requisitos para una demanda por alimentos?"');
    console.log('generate "Contrato de Compraventa" "Generar un contrato de compraventa de inmueble" CONTRACT');
  }

  private async clearConsole(): Promise<void> {
    console.clear();
    console.log('🚀 Lawer.AI Console Interface');
    console.log('==============================\n');
  }

  private async exit(): Promise<void> {
    console.log('\n👋 Goodbye!');
    this.rl.close();
  }

  public async getSystemInfo(): Promise<any> {
    return {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      features: [
        'Document Indexing',
        'Legal Querying', 
        'Document Generation',
        'Semantic Search'
      ]
    };
  }

  private async autoIndexAssets(): Promise<void> {
    console.log('📚 Auto-indexing assets folder...');
    
    const assetsPath = this.configService.get('ASSETS_PATH', './assets');
    
    if (!fs.existsSync(assetsPath)) {
      console.log('⚠️  Assets folder not found, skipping auto-indexing');
      return;
    }

    const documentTypeMapping: { [key: string]: DocumentType } = {
      'penal-code': DocumentType.PENAL_CODE,
      'civil-code': DocumentType.CIVIL_CODE,
      'commercial-code': DocumentType.COMMERCIAL_CODE,
      'case-law': DocumentType.CASE_LAW,
      'legal-opinion': DocumentType.LEGAL_OPINION,
      'constitution': DocumentType.OTHER,
      'laws': DocumentType.OTHER,
      'doctrine': DocumentType.LEGAL_OPINION,
    };

    let indexedCount = 0;
    let errorCount = 0;

    try {
      // Scan each subdirectory
      const subdirs = fs.readdirSync(assetsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const subdir of subdirs) {
        const subdirPath = path.join(assetsPath, subdir);
        const documentType = documentTypeMapping[subdir] || DocumentType.OTHER;
        
        console.log(`📁 Scanning ${subdir} (${documentType})...`);
        
        // Find all PDF files in the subdirectory
        const files = fs.readdirSync(subdirPath)
          .filter(file => file.toLowerCase().endsWith('.pdf'))
          .map(file => path.join(subdir, file));

        for (const file of files) {
          try {
            console.log(`  📄 Indexing: ${file}`);
            
            const result = await this.indexDocumentUseCase.execute({
              filePath: file,
              documentType,
            });

            if (result.success) {
              console.log(`    ✅ Indexed: ${result.document.title}`);
              indexedCount++;
            } else {
              console.log(`    ❌ Failed: ${result.message}`);
              errorCount++;
            }
          } catch (error) {
            console.log(`    ❌ Error indexing ${file}: ${error.message}`);
            errorCount++;
          }
        }
      }

      console.log(`\n📊 Auto-indexing complete:`);
      console.log(`   ✅ Successfully indexed: ${indexedCount} documents`);
      console.log(`   ❌ Errors: ${errorCount} documents`);
      
      if (indexedCount > 0) {
        console.log(`\n🎉 Your legal knowledge base is ready!`);
        console.log(`   Try: query "¿Qué dice el Código Civil sobre la responsabilidad parental?"`);
      }
      
    } catch (error) {
      console.log(`❌ Auto-indexing failed: ${error.message}`);
    }
  }
} 