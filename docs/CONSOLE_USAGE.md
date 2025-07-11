# Lawer.AI Console Interface Guide

The Lawer.AI system provides multiple ways to interact with the legal AI system through the console, offering both basic and full-featured interfaces.

## 🚀 Available Console Interfaces

### 1. Basic Console Interface
A simple Node.js console for basic system checks and information.

```bash
npm run console:basic
```

**Features:**
- Environment configuration check
- Assets directory structure verification
- System information display
- Example commands and API calls

### 2. Full Console Interface
A complete NestJS-based console with full AI functionality.

```bash
npm run console
```

**Features:**
- Document indexing
- Legal query processing
- Document generation
- Full AI integration with Gemini

## 📋 Basic Console Commands

### `help`
Shows available commands and usage instructions.

### `list`
Displays document types, writing types, and example API calls.

### `check-env`
Verifies environment configuration:
- Checks for `.env` file
- Validates `GEMINI_API_KEY` configuration
- Shows Node.js version
- Confirms `package.json` exists

### `check-assets`
Inspects assets directory structure:
- Verifies `assets/` directory exists
- Checks subdirectories (penal-code, civil-code, etc.)
- Counts PDF files in each directory
- Creates missing directories if needed

### `clear`
Clears the console screen.

### `exit`
Exits the console interface.

## 🤖 Full Console Commands

### `index <filePath> <documentType>`
Indexes a legal document for the system.

**Usage:**
```bash
index penal-code/codigo-penal.pdf PENAL_CODE
```

**Document Types:**
- `PENAL_CODE` - Argentine Penal Code
- `CIVIL_CODE` - Argentine Civil Code
- `COMMERCIAL_CODE` - Argentine Commercial Code
- `CASE_LAW` - Legal precedents and rulings
- `LEGAL_OPINION` - Legal opinions and analysis
- `OTHER` - Other legal documents

### `query <question>`
Asks a legal question and gets an AI-powered answer.

**Usage:**
```bash
query "¿Qué dice el Código Civil sobre la responsabilidad parental?"
```

**Features:**
- Natural language processing
- AI-powered legal reasoning
- Source citations
- Confidence scoring

### `generate <title> <prompt> <documentType>`
Generates a legal document using AI.

**Usage:**
```bash
generate "Demanda por Alimentos" "Redactar una demanda por alimentos para un menor" COMPLAINT
```

**Document Types:**
- `COMPLAINT` - Legal complaints
- `MOTION` - Legal motions
- `BRIEF` - Legal briefs
- `CONTRACT` - Legal contracts
- `LEGAL_OPINION` - Legal opinions
- `DEMAND_LETTER` - Demand letters
- `OTHER` - Other legal documents

## 🧪 Example Usage Scenarios

### Scenario 1: System Setup Verification
```bash
npm run console:basic
lawer.ai> check-env
lawer.ai> check-assets
lawer.ai> list
lawer.ai> exit
```

### Scenario 2: Document Indexing
```bash
npm run console
lawer.ai> index penal-code/codigo-penal-argentino.pdf PENAL_CODE
lawer.ai> index civil-code/codigo-civil-argentino.pdf CIVIL_CODE
lawer.ai> index commercial-code/codigo-comercial-argentino.pdf COMMERCIAL_CODE
```

### Scenario 3: Legal Query Processing
```bash
npm run console
lawer.ai> query "¿Qué dice el Código Civil sobre la responsabilidad parental?"
lawer.ai> query "¿Cuáles son los requisitos para una demanda por alimentos?"
lawer.ai> query "¿Qué establece el Código Penal sobre el hurto?"
```

### Scenario 4: Document Generation
```bash
npm run console
lawer.ai> generate "Demanda por Alimentos" "Redactar una demanda por alimentos para un menor de 5 años" COMPLAINT
lawer.ai> generate "Contrato de Compraventa" "Generar un contrato de compraventa de inmueble" CONTRACT
lawer.ai> generate "Recurso de Apelación" "Escribir un recurso de apelación en materia civil" MOTION
```

## 🔧 Console Configuration

### Environment Variables
The console interfaces use the same environment configuration as the main application:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
ASSETS_PATH=./assets
PORT=3000
NODE_ENV=development
```

### Assets Directory Structure
```
assets/
├── penal-code/
│   ├── codigo-penal-argentino.pdf
│   └── ...
├── civil-code/
│   ├── codigo-civil-argentino.pdf
│   └── ...
├── commercial-code/
│   ├── codigo-comercial-argentino.pdf
│   └── ...
├── case-law/
│   ├── fallos-suprema-corte.pdf
│   └── ...
└── legal-opinions/
    ├── opinion-legal-1.pdf
    └── ...
```

## 🚨 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not configured"**
   - Get your API key from: https://makersuite.google.com/app/apikey
   - Add it to your `.env` file

2. **"assets directory not found"**
   - Run `npm run console:basic` and use `check-assets` command
   - The system will create the directory structure automatically

3. **"Unknown command"**
   - Type `help` to see available commands
   - Check command syntax and parameters

4. **"Failed to process query"**
   - Ensure you have a valid Gemini API key
   - Check your internet connection
   - Verify the question format

### Debug Mode
For development and debugging:

```bash
# Start with debug logging
npm run console:dev

# Check environment in detail
npm run console:basic
lawer.ai> check-env
```

## 📚 Integration with REST API

The console interfaces work alongside the REST API:

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Use console for testing:**
   ```bash
   npm run console
   ```

3. **Access API documentation:**
   - Visit: http://localhost:3000/api

4. **Use both interfaces simultaneously:**
   - Console for interactive testing
   - REST API for programmatic access

## 🎯 Best Practices

1. **Start with basic console** to verify system setup
2. **Use full console** for AI-powered interactions
3. **Index documents first** before asking questions
4. **Use specific document types** for better results
5. **Check environment** before starting development
6. **Combine console and API** for comprehensive testing

## 🔮 Advanced Usage

### Batch Operations
```bash
# Index multiple documents
lawer.ai> index penal-code/doc1.pdf PENAL_CODE
lawer.ai> index penal-code/doc2.pdf PENAL_CODE
lawer.ai> index civil-code/doc1.pdf CIVIL_CODE
```

### Complex Queries
```bash
# Multi-part questions
lawer.ai> query "¿Qué dice el Código Civil sobre la responsabilidad parental y cómo se aplica en casos de custodia compartida?"
```

### Document Generation with Context
```bash
# Generate with specific context
lawer.ai> generate "Demanda por Alimentos" "Redactar una demanda por alimentos para un menor de 5 años, padre no cumple obligación alimentaria" COMPLAINT
```

The console interfaces provide a powerful way to interact with the Lawer.AI system, making it easy to test, develop, and use the legal AI capabilities directly from the command line. 