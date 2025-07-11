# Lawer.AI - Intelligent Legal System

An intelligent legal system built with NestJS, LangChain, and Google Gemini AI, following Clean Architecture principles. The system provides legal document indexing, semantic search, legal query processing, and AI-powered document generation for Argentine law.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/                 # Core business logic and entities
│   ├── entities/          # Domain models and interfaces
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain service interfaces
├── application/           # Application business rules
│   └── use-cases/        # Use case implementations
├── infrastructure/        # External concerns and implementations
│   ├── repositories/     # Repository implementations
│   └── services/         # External service implementations
└── interface/            # Presentation layer
    ├── document/         # Document management endpoints
    ├── legal-query/      # Legal query processing endpoints
    └── legal-writing/    # Document generation endpoints
```

### Architecture Layers

1. **Domain Layer**: Contains business entities, interfaces, and core business rules
2. **Application Layer**: Orchestrates use cases and application logic
3. **Infrastructure Layer**: Implements external concerns (databases, AI services)
4. **Interface Layer**: Handles HTTP requests and responses

## 🚀 Features

### 📚 Document Management
- **PDF Indexing**: Process and index legal documents from PDF files
- **Semantic Search**: Find relevant legal content using AI-powered search
- **Document Classification**: Automatically categorize documents by type
- **Metadata Extraction**: Extract key information from legal documents

### 🤖 Legal Query Processing
- **Natural Language Queries**: Ask legal questions in plain language
- **AI-Powered Answers**: Get comprehensive legal answers using Gemini AI
- **Source Citations**: View relevant legal sources and precedents
- **Confidence Scoring**: Understand the reliability of AI responses

### ✍️ Legal Document Generation
- **AI Document Writing**: Generate legal documents from prompts
- **Multiple Document Types**: Complaints, motions, briefs, contracts, etc.
- **Legal Validation**: Validate generated documents for legal accuracy
- **Section Organization**: Structured document generation with proper sections

### 🔍 Advanced Capabilities
- **Vector Search**: Semantic similarity search using embeddings
- **Context-Aware Responses**: AI responses based on relevant legal context
- **Multi-language Support**: Primarily Spanish for Argentine law
- **Extensible Architecture**: Easy to add new document types and features

## 🛠️ Technology Stack

- **Backend Framework**: NestJS (TypeScript)
- **AI/ML**: Google Gemini AI, LangChain
- **Document Processing**: PDF-parse, Multer
- **Vector Database**: ChromaDB (planned)
- **Architecture**: Clean Architecture with SOLID principles
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator, Class-transformer

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key
- PDF legal documents (optional for testing)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lawer.AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Add legal documents** (optional)
   ```bash
   # Create subdirectories for different document types
   mkdir -p assets/penal-code assets/civil-code assets/commercial-code assets/case-law
   
   # Add your PDF documents to the appropriate directories
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api`

## 🖥️ Console Interface

The system also provides console interfaces for direct interaction:

### Basic Console (System Checks)
```bash
npm run console:basic
```
- Environment verification
- Assets directory checks
- System information

### Full Console (AI Features)
```bash
npm run console
```
- Document indexing
- Legal query processing
- Document generation
- Full AI integration

**Example console usage:**
```bash
lawer.ai> index penal-code/codigo-penal.pdf PENAL_CODE
lawer.ai> query "¿Qué dice el Código Civil sobre la responsabilidad parental?"
lawer.ai> generate "Demanda por Alimentos" "Redactar demanda por alimentos" COMPLAINT
```

📖 **See [Console Usage Guide](docs/CONSOLE_USAGE.md) for detailed instructions.**

## 🧪 Testing

The project includes comprehensive unit tests following Clean Architecture principles:

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage report
npm run test:debug    # Run tests in debug mode
```

### Test Coverage
- **Target**: 70% coverage for branches, functions, lines, and statements
- **Reports**: HTML and LCOV reports in `coverage/` directory
- **Structure**: Tests organized by Clean Architecture layers

### Test Categories
- **Unit Tests**: Domain entities, use cases, repositories, controllers
- **Integration Tests**: Service interactions and data persistence
- **End-to-End Tests**: Complete workflow testing

📖 **See [Testing Documentation](docs/TESTING.md) for comprehensive testing guide.**

## 📖 API Usage

### Document Management

**Index a legal document:**
```bash
POST /documents/index
{
  "filePath": "penal-code/codigo-penal.pdf",
  "documentType": "PENAL_CODE",
  "title": "Código Penal Argentino",
  "tags": ["penal", "argentina"]
}
```

**Search documents:**
```bash
GET /documents/search/responsabilidad%20parental
```

### Legal Queries

**Ask a legal question:**
```bash
POST /legal-queries
{
  "question": "¿Qué dice el Código Civil sobre la responsabilidad parental?",
  "context": "Caso de custodia compartida",
  "queryType": "LEGAL_QUESTION"
}
```

**Get query history:**
```bash
GET /legal-queries
```

### Document Generation

**Generate a legal document:**
```bash
POST /legal-writing/generate
{
  "title": "Demanda por Alimentos",
  "prompt": "Redactar una demanda por alimentos para un menor de 5 años",
  "documentType": "COMPLAINT",
  "context": "Padre no cumple con obligación alimentaria"
}
```

**Validate a document:**
```bash
POST /legal-writing/validate
{
  "content": "Contenido del documento legal a validar..."
}
```

## 🧪 Example Queries

### Legal Questions
- "¿Qué dice el Código Civil sobre la responsabilidad parental?"
- "¿Cuáles son los requisitos para una demanda por alimentos?"
- "¿Qué establece el Código Penal sobre el hurto?"

### Document Generation Prompts
- "Redactar una demanda para iniciar un juicio por alimentos"
- "Generar un contrato de compraventa de inmueble"
- "Escribir un recurso de apelación en materia civil"

## 🔧 Development

### Project Structure
```
src/
├── domain/                    # Business logic
│   ├── entities/             # Domain models
│   ├── repositories/         # Repository interfaces
│   └── services/             # Service interfaces
├── application/              # Use cases
│   └── use-cases/           # Business use cases
├── infrastructure/           # External implementations
│   ├── repositories/        # Repository implementations
│   └── services/            # External services
└── interface/               # Controllers and modules
    ├── document/            # Document endpoints
    ├── legal-query/         # Query endpoints
    └── legal-writing/       # Writing endpoints
```

### Available Scripts
```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run console        # Start full console interface
npm run console:basic  # Start basic console interface
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:debug     # Run tests in debug mode
npm run test:e2e       # Run end-to-end tests
npm run lint           # Lint code
npm run format         # Format code
```

### Adding New Features

1. **Domain Layer**: Define entities and interfaces
2. **Application Layer**: Create use cases
3. **Infrastructure Layer**: Implement external services
4. **Interface Layer**: Add controllers and endpoints

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `ASSETS_PATH` | Path to legal documents | No (default: ./assets) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `AI_PROVIDER` | AI provider to use (`google` or `openai`) | No (default: google) |
| `OPENAI_API_KEY` | OpenAI API key | No (required if using OpenAI) |
| `OPENAI_MODEL` | OpenAI model name (e.g., gpt-4o) | No (default: gpt-4o) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow Clean Architecture principles
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api`
- Review the example queries and usage patterns

## 🔮 Roadmap

- [ ] Vector database integration (ChromaDB/Pinecone)
- [ ] Advanced document parsing with OCR
- [ ] Multi-language support
- [ ] User authentication and authorization
- [ ] Document versioning and history
- [ ] Advanced legal reasoning capabilities
- [ ] Integration with legal databases
- [ ] Mobile API support
- [ ] Real-time document collaboration 