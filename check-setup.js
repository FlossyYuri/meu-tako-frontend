#!/usr/bin/env node

/**
 * Script para verificar se a configuração do Meu Tako Frontend está correta
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuração do Meu Tako Frontend...\n');

// Verificar arquivos essenciais
const essentialFiles = [
  'package.json',
  'nuxt.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'app/app.vue',
  'app/types/index.ts',
  'app/stores/auth.ts',
  'app/composables/useApi.ts',
  'app/middleware/auth.ts',
  'app/middleware/guest.ts'
];

console.log('📁 Verificando arquivos essenciais:');
let allFilesExist = true;

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTANDO`);
    allFilesExist = false;
  }
});

// Verificar estrutura de diretórios
const essentialDirs = [
  'app/components',
  'app/pages',
  'app/layouts',
  'app/stores',
  'app/composables',
  'app/middleware',
  'app/types',
  'app/plugins'
];

console.log('\n📂 Verificando estrutura de diretórios:');
essentialDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ - FALTANDO`);
    allFilesExist = false;
  }
});

// Verificar package.json
console.log('\n📦 Verificando dependências:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredDeps = [
    'nuxt',
    'vue',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    'vue-sonner',
    'lucide-vue-next'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - FALTANDO`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Erro ao ler package.json');
  allFilesExist = false;
}

// Verificar configuração do Nuxt
console.log('\n⚙️ Verificando configuração do Nuxt:');
try {
  const nuxtConfig = fs.readFileSync(path.join(__dirname, 'nuxt.config.ts'), 'utf8');

  const requiredConfigs = [
    'srcDir:',
    'modules:',
    'runtimeConfig:',
    'apiBase:'
  ];

  requiredConfigs.forEach(config => {
    if (nuxtConfig.includes(config)) {
      console.log(`  ✅ ${config}`);
    } else {
      console.log(`  ❌ ${config} - FALTANDO`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Erro ao ler nuxt.config.ts');
  allFilesExist = false;
}

// Verificar páginas implementadas
console.log('\n📄 Verificando páginas implementadas:');
const pages = [
  'app/pages/index.vue',
  'app/pages/auth/login.vue',
  'app/pages/auth/register.vue',
  'app/pages/auth/forgot-password.vue',
  'app/pages/profile.vue',
  'app/pages/transactions/index.vue',
  'app/pages/transactions/new.vue',
  'app/pages/wallets/index.vue',
  'app/pages/wallets/new.vue',
  'app/pages/goals/index.vue',
  'app/pages/reports/index.vue',
  'app/pages/settings/index.vue'
];

pages.forEach(page => {
  const pagePath = path.join(__dirname, page);
  if (fs.existsSync(pagePath)) {
    console.log(`  ✅ ${page}`);
  } else {
    console.log(`  ❌ ${page} - FALTANDO`);
    allFilesExist = false;
  }
});

// Verificar componentes UI
console.log('\n🎨 Verificando componentes UI:');
const components = [
  'app/components/ui/Button.vue',
  'app/components/ui/Input.vue',
  'app/components/ui/Card.vue',
  'app/components/ui/Modal.vue',
  'app/components/ui/Badge.vue',
  'app/components/ui/LoadingSpinner.vue'
];

components.forEach(component => {
  const componentPath = path.join(__dirname, component);
  if (fs.existsSync(componentPath)) {
    console.log(`  ✅ ${component}`);
  } else {
    console.log(`  ❌ ${component} - FALTANDO`);
    allFilesExist = false;
  }
});

// Verificar stores
console.log('\n🏪 Verificando stores:');
const stores = [
  'app/stores/auth.ts',
  'app/stores/transactions.ts',
  'app/stores/wallets.ts'
];

stores.forEach(store => {
  const storePath = path.join(__dirname, store);
  if (fs.existsSync(storePath)) {
    console.log(`  ✅ ${store}`);
  } else {
    console.log(`  ❌ ${store} - FALTANDO`);
    allFilesExist = false;
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 CONFIGURAÇÃO COMPLETA!');
  console.log('\n✅ Todos os arquivos e diretórios essenciais estão presentes');
  console.log('✅ Dependências estão configuradas');
  console.log('✅ Estrutura do projeto está correta');
  console.log('\n🚀 Para iniciar o desenvolvimento:');
  console.log('   npm run dev');
  console.log('\n📋 Para verificar se a API está funcionando:');
  console.log('   - Certifique-se de que a API Meu Tako está rodando em http://localhost:5000');
  console.log('   - Verifique se a variável API_BASE_URL está configurada');
} else {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA!');
  console.log('\n⚠️ Alguns arquivos ou configurações estão faltando');
  console.log('📋 Verifique os itens marcados com ❌ acima');
  console.log('\n🔧 Para corrigir:');
  console.log('   1. Verifique se todos os arquivos foram criados');
  console.log('   2. Execute npm install para instalar dependências');
  console.log('   3. Verifique se a configuração está correta');
}

console.log('\n' + '='.repeat(50));
