/**
 * Exemplo de uso do processador Handlebars consolidado
 * Demonstra como usar todas as funcionalidades do sistema
 */

import {
  handlebarsProcessor,
  validateTemplate,
  processTemplate,
  generatePreview,
  extractVariables,
  generateExampleData,
} from './handlebarsProcessor';

// Exemplo 1: Validação de template
export const exampleValidation = () => {
  const template = `
    Olá {{user.name}}!
    
    Você tem uma nova transação de {{formatCurrency amount}} 
    na categoria {{category}}.
    
    Data: {{formatDate date "DD/MM/YYYY"}}
    Saldo atual: {{formatCurrency balance}}
  `;

  const result = validateTemplate(template, 'whatsapp');

  console.log('Resultado da validação:', result);
  return result;
};

// Exemplo 2: Processamento de template
export const exampleProcessing = () => {
  const template = `
    <h1>Nova Transação</h1>
    <p>Olá {{user.name}},</p>
    <p>Você registrou uma transação de <strong>{{formatCurrency amount}}</strong>.</p>
    <p>Data: {{formatDate date "DD/MM/YYYY HH:mm"}}</p>
    <p>Categoria: {{capitalize category}}</p>
    {{#if description}}
    <p>Descrição: {{description}}</p>
    {{/if}}
    <p>Saldo atual: {{formatCurrency balance}}</p>
  `;

  const data = {
    user: { name: 'João Silva' },
    amount: 150.75,
    date: new Date().toISOString(),
    category: 'alimentação',
    description: 'Compra no supermercado',
    balance: 1250.5,
  };

  const processed = processTemplate(template, data);

  console.log('Template processado:', processed);
  return processed;
};

// Exemplo 3: Preview de template
export const examplePreview = () => {
  const template = {
    name: 'Notificação de Transação',
    channel: 'whatsapp' as const,
    language: 'pt-BR',
    content: `
      🏦 *Nova Transação*
      
      Olá {{user.name}}!
      
      💰 Valor: {{formatCurrency amount}}
      📅 Data: {{formatDate date "DD/MM/YYYY"}}
      🏷️ Categoria: {{capitalize category}}
      {{#if description}}
      📝 Descrição: {{description}}
      {{/if}}
      
      💳 Saldo atual: {{formatCurrency balance}}
      
      Acesse: {{url "transacoes" "https://app.meutako.com"}}
    `,
  };

  const preview = generatePreview(template);

  console.log('Preview gerado:', preview);
  return preview;
};

// Exemplo 4: Extração de variáveis
export const exampleVariableExtraction = () => {
  const template = `
    {{#if user.isPremium}}
    Olá {{user.name}}, membro premium!
    {{else}}
    Olá {{user.name}}!
    {{/if}}
    
    Sua transação de {{formatCurrency amount}} foi {{#if amount > 100}}alta{{else}}baixa{{/if}}.
    
    {{#each categories}}
    - {{this.name}}: {{formatCurrency this.amount}}
    {{/each}}
  `;

  const variables = extractVariables(template);

  console.log('Variáveis extraídas:', variables);
  return variables;
};

// Exemplo 5: Dados de exemplo por canal
export const exampleChannelData = () => {
  const whatsappData = generateExampleData('whatsapp');
  const emailData = generateExampleData('email');
  const pushData = generateExampleData('push');

  console.log('Dados WhatsApp:', whatsappData);
  console.log('Dados Email:', emailData);
  console.log('Dados Push:', pushData);

  return { whatsappData, emailData, pushData };
};

// Exemplo 6: Template complexo com helpers
export const exampleComplexTemplate = () => {
  const template = `
    <html>
    <head>
      <title>{{subject}}</title>
    </head>
    <body>
      <h1>{{capitalize user.name}}, sua transação foi registrada!</h1>
      
      <div class="transaction-details">
        <h2>Detalhes da Transação</h2>
        <p><strong>Valor:</strong> {{formatCurrency amount}}</p>
        <p><strong>Data:</strong> {{formatDate date "DD/MM/YYYY 'às' HH:mm"}}</p>
        <p><strong>Categoria:</strong> {{capitalize category}}</p>
        
        {{#if description}}
        <p><strong>Descrição:</strong> {{description}}</p>
        {{/if}}
        
        <p><strong>Saldo atual:</strong> {{formatCurrency balance}}</p>
      </div>
      
      {{#if categories.length}}
      <div class="category-breakdown">
        <h3>Resumo por Categoria</h3>
        <ul>
          {{#each categories}}
          <li>{{capitalize this.name}}: {{formatCurrency this.amount}} ({{formatNumber this.percentage}}%)</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
      
      <div class="actions">
        <a href="{{url 'dashboard' baseUrl}}">Ver Dashboard</a>
        <a href="{{url 'transacoes' baseUrl}}">Ver Todas as Transações</a>
      </div>
      
      <footer>
        <p>Enviado em {{formatDate 'now' "DD/MM/YYYY HH:mm"}} por {{company}}</p>
        <p>Para suporte, entre em contato: {{supportEmail}}</p>
      </footer>
    </body>
    </html>
  `;

  const data = {
    subject: 'Nova Transação - Meu Tako',
    user: { name: 'maria silva' },
    amount: 89.9,
    date: new Date().toISOString(),
    category: 'alimentação',
    description: 'Compra no mercado',
    balance: 2150.75,
    categories: [
      { name: 'alimentação', amount: 89.9, percentage: 100 },
      { name: 'transporte', amount: 0, percentage: 0 },
    ],
    baseUrl: 'https://app.meutako.com',
    company: 'Meu Tako',
    supportEmail: 'suporte@meutako.com',
  };

  const processed = processTemplate(template, data);

  console.log('Template complexo processado:', processed);
  return processed;
};

// Exemplo 7: Validação com diferentes canais
export const exampleChannelValidation = () => {
  const templates = {
    whatsapp: 'Olá {{user.name}}! Nova transação: {{formatCurrency amount}}',
    email:
      '<h1>Nova Transação</h1><p>Olá {{user.name}}!</p><p>Valor: {{formatCurrency amount}}</p>',
    push: 'Nova transação: {{formatCurrency amount}}',
  };

  const results = Object.entries(templates).map(([channel, template]) => {
    const result = validateTemplate(template, channel as any);
    return { channel, result };
  });

  console.log('Validações por canal:', results);
  return results;
};

// Exemplo 8: Uso do processador singleton
export const exampleProcessorUsage = () => {
  // Registrar helper customizado
  handlebarsProcessor.registerHelper('greeting', (time: string) => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  const template = '{{greeting}}, {{user.name}}!';
  const data = { user: { name: 'João' } };

  const result = handlebarsProcessor.processTemplate(template, data);

  console.log('Resultado com helper customizado:', result);
  return result;
};

// Função para executar todos os exemplos
export const runAllExamples = () => {
  console.log('=== Exemplos do Processador Handlebars ===\n');

  console.log('1. Validação de template:');
  exampleValidation();

  console.log('\n2. Processamento de template:');
  exampleProcessing();

  console.log('\n3. Preview de template:');
  examplePreview();

  console.log('\n4. Extração de variáveis:');
  exampleVariableExtraction();

  console.log('\n5. Dados de exemplo por canal:');
  exampleChannelData();

  console.log('\n6. Template complexo:');
  exampleComplexTemplate();

  console.log('\n7. Validação por canal:');
  exampleChannelValidation();

  console.log('\n8. Processador singleton:');
  exampleProcessorUsage();

  console.log('\n=== Fim dos Exemplos ===');
};

// Exportar função principal
export default runAllExamples;

