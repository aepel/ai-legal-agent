const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Sample API usage for Lawer.AI
async function sampleApiUsage() {
  console.log('🚀 Lawer.AI API Sample Usage\n');

  try {
    // 1. Index a legal document
    console.log('1. Indexing a legal document...');
    const indexResponse = await axios.post(`${API_BASE_URL}/documents/index`, {
      filePath: 'penal-code/codigo-penal-argentino.pdf',
      documentType: 'PENAL_CODE',
      title: 'Código Penal Argentino',
      tags: ['penal', 'argentina', 'código']
    });
    console.log('✅ Document indexed:', indexResponse.data.message);

    // 2. Ask a legal question
    console.log('\n2. Asking a legal question...');
    const queryResponse = await axios.post(`${API_BASE_URL}/legal-queries`, {
      question: '¿Qué dice el Código Civil sobre la responsabilidad parental?',
      context: 'Caso de custodia compartida',
      queryType: 'LEGAL_QUESTION'
    });
    console.log('✅ Legal answer received');
    console.log('Answer:', queryResponse.data.response.answer.substring(0, 200) + '...');
    console.log('Confidence:', queryResponse.data.response.confidence);

    // 3. Generate a legal document
    console.log('\n3. Generating a legal document...');
    const documentResponse = await axios.post(`${API_BASE_URL}/legal-writing/generate`, {
      title: 'Demanda por Alimentos',
      prompt: 'Redactar una demanda por alimentos para un menor de 5 años',
      documentType: 'COMPLAINT',
      context: 'Padre no cumple con obligación alimentaria'
    });
    console.log('✅ Legal document generated');
    console.log('Title:', documentResponse.data.response.title);
    console.log('Confidence:', documentResponse.data.response.confidence);

    // 4. Search for documents
    console.log('\n4. Searching for documents...');
    const searchResponse = await axios.get(`${API_BASE_URL}/documents/search/responsabilidad%20parental`);
    console.log('✅ Search completed');
    console.log('Found documents:', searchResponse.data.length);

    // 5. Get all documents
    console.log('\n5. Getting all indexed documents...');
    const documentsResponse = await axios.get(`${API_BASE_URL}/documents`);
    console.log('✅ Documents retrieved');
    console.log('Total documents:', documentsResponse.data.length);

    console.log('\n🎉 All API calls completed successfully!');

  } catch (error) {
    console.error('❌ Error during API usage:', error.response?.data || error.message);
  }
}

// Example legal questions for testing
const sampleLegalQuestions = [
  '¿Qué dice el Código Civil sobre la responsabilidad parental?',
  '¿Cuáles son los requisitos para una demanda por alimentos?',
  '¿Qué establece el Código Penal sobre el hurto?',
  '¿Cómo se regula la custodia compartida en Argentina?',
  '¿Qué derechos tienen los menores en materia de alimentos?'
];

// Example document generation prompts
const sampleDocumentPrompts = [
  {
    title: 'Demanda por Alimentos',
    prompt: 'Redactar una demanda por alimentos para un menor de 5 años',
    documentType: 'COMPLAINT'
  },
  {
    title: 'Contrato de Compraventa',
    prompt: 'Generar un contrato de compraventa de inmueble',
    documentType: 'CONTRACT'
  },
  {
    title: 'Recurso de Apelación',
    prompt: 'Escribir un recurso de apelación en materia civil',
    documentType: 'MOTION'
  }
];

// Run the sample
if (require.main === module) {
  sampleApiUsage();
}

module.exports = {
  sampleApiUsage,
  sampleLegalQuestions,
  sampleDocumentPrompts
}; 