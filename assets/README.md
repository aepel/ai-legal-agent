# Legal Documents Assets

This directory contains the legal documents that will be indexed by the Lawer.AI system.

## Supported Document Types

- **PENAL_CODE**: Argentine Penal Code documents
- **CIVIL_CODE**: Argentine Civil Code documents  
- **COMMERCIAL_CODE**: Argentine Commercial Code documents
- **CASE_LAW**: Legal precedents and case law
- **LEGAL_OPINION**: Legal opinions and analysis
- **OTHER**: Other legal documents

## File Format

- **PDF**: Primary format for legal documents
- **Text**: Plain text files for simple legal texts
- **Markdown**: For structured legal content

## Directory Structure

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

## Adding Documents

1. Place your PDF documents in the appropriate subdirectory
2. Use descriptive filenames
3. Ensure documents are in Spanish (for Argentine law)
4. Documents will be automatically indexed when the system starts

## Indexing Process

Documents are processed using:
- PDF parsing with `pdf-parse`
- Text extraction and cleaning
- Metadata generation
- Embedding creation for semantic search
- Storage in the document repository

## Example Documents

You can add sample documents like:
- `codigo-penal-argentino.pdf` - Argentine Penal Code
- `codigo-civil-argentino.pdf` - Argentine Civil Code
- `codigo-comercial-argentino.pdf` - Argentine Commercial Code
- `fallos-suprema-corte-2023.pdf` - Supreme Court rulings 

## LangChain Semantic Search

All PDF documents you add to the assets folder are now also indexed into the LangChain vector store. This enables:
- Semantic search and retrieval for advanced legal queries
- Context-aware document generation and validation
- Use of the `langchain` commands in the console to leverage these features

**Tip:**
- Run `yarn console` and use commands like `langchain query <question>` or `langchain generate ...` to get AI-powered results based on your own legal documents. 