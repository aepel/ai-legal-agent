#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Simple console interface for Lawer.AI
class LawerAIConsole {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'lawer.ai> ',
    });
    
    this.commands = new Map();
    this.initializeCommands();
  }

  initializeCommands() {
    this.commands.set('help', {
      name: 'help',
      description: 'Show available commands',
      handler: this.showHelp.bind(this),
    });

    this.commands.set('list', {
      name: 'list',
      description: 'List available document types and examples',
      handler: this.listExamples.bind(this),
    });

    this.commands.set('check-env', {
      name: 'check-env',
      description: 'Check environment configuration',
      handler: this.checkEnvironment.bind(this),
    });

    this.commands.set('check-assets', {
      name: 'check-assets',
      description: 'Check assets directory structure',
      handler: this.checkAssets.bind(this),
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
  }

  async start() {
    console.log('\n🚀 Welcome to Lawer.AI Console Interface');
    console.log('==========================================');
    console.log('This is a basic console interface for testing.');
    console.log('For full functionality, use the NestJS application.');
    console.log('Type "help" to see available commands');
    console.log('Type "exit" to quit\n');

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

  async showHelp() {
    console.log('\n📋 Available Commands:');
    console.log('======================');
    
    for (const command of this.commands.values()) {
      console.log(`${command.name.padEnd(12)} - ${command.description}`);
    }
    
    console.log('\n💡 To use the full system:');
    console.log('  1. npm run start:dev    # Start the NestJS server');
    console.log('  2. npm run console      # Start the full console interface');
    console.log('  3. Visit http://localhost:3000/api for API documentation');
  }

  async listExamples() {
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

    console.log('\n💡 Example API Calls:');
    console.log('=====================');
    console.log('curl -X POST http://localhost:3000/legal-queries \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"question": "¿Qué dice el Código Civil sobre la responsabilidad parental?"}\'');
    console.log('');
    console.log('curl -X POST http://localhost:3000/legal-writing/generate \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"title": "Demanda por Alimentos", "prompt": "Redactar demanda por alimentos", "documentType": "COMPLAINT"}\'');
  }

  async checkEnvironment() {
    console.log('\n🔧 Environment Check:');
    console.log('====================');
    
    // Check if .env file exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file found');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('your_gemini_api_key_here')) {
        console.log('⚠️  GEMINI_API_KEY not configured');
        console.log('   Get your API key from: https://makersuite.google.com/app/apikey');
      } else if (envContent.includes('GEMINI_API_KEY=')) {
        console.log('✅ GEMINI_API_KEY configured');
      } else {
        console.log('❌ GEMINI_API_KEY missing from .env file');
      }
    } else {
      console.log('❌ .env file not found');
      console.log('   Run: cp env.example .env');
    }

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`✅ Node.js version: ${nodeVersion}`);
    
    // Check if package.json exists
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      console.log('✅ package.json found');
    } else {
      console.log('❌ package.json not found');
    }
  }

  async checkAssets() {
    console.log('\n📁 Assets Directory Check:');
    console.log('==========================');
    
    const assetsPath = path.join(process.cwd(), 'assets');
    if (fs.existsSync(assetsPath)) {
      console.log('✅ assets directory found');
      
      const subdirs = ['penal-code', 'civil-code', 'commercial-code', 'case-law', 'legal-opinions'];
      for (const subdir of subdirs) {
        const subdirPath = path.join(assetsPath, subdir);
        if (fs.existsSync(subdirPath)) {
          const files = fs.readdirSync(subdirPath).filter(file => file.endsWith('.pdf'));
          console.log(`✅ ${subdir}: ${files.length} PDF files`);
        } else {
          console.log(`⚠️  ${subdir}: directory not found`);
        }
      }
    } else {
      console.log('❌ assets directory not found');
      console.log('   Creating assets directory structure...');
      
      try {
        fs.mkdirSync(assetsPath, { recursive: true });
        const subdirs = ['penal-code', 'civil-code', 'commercial-code', 'case-law', 'legal-opinions'];
        for (const subdir of subdirs) {
          fs.mkdirSync(path.join(assetsPath, subdir), { recursive: true });
        }
        console.log('✅ Assets directory structure created');
      } catch (error) {
        console.log(`❌ Failed to create assets directory: ${error.message}`);
      }
    }
  }

  async clearConsole() {
    console.clear();
    console.log('🚀 Lawer.AI Console Interface');
    console.log('==============================\n');
  }

  async exit() {
    console.log('\n👋 Goodbye!');
    this.rl.close();
  }
}

// Start the console if this file is run directly
if (require.main === module) {
  const console = new LawerAIConsole();
  console.start();
}

module.exports = LawerAIConsole; 