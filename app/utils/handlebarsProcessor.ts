import Handlebars from 'handlebars';
import type { NotificationChannel } from '~/types';

/**
 * Processador consolidado de templates Handlebars
 * Centraliza toda a lógica de processamento, validação e helpers
 */

// Configuração de limites por canal
const CHANNEL_LIMITS: Record<NotificationChannel, number> = {
  whatsapp: 1000,
  email: 10000,
  push: 200,
};

// Helpers customizados do Handlebars
const registerCustomHelpers = () => {
  // Helper para formatação de data
  Handlebars.registerHelper(
    'formatDate',
    (date: string | Date, format: string = 'DD/MM/YYYY') => {
      if (!date) return '';

      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');

      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year.toString())
        .replace('HH', hours)
        .replace('mm', minutes);
    }
  );

  // Helper para formatação de moeda
  Handlebars.registerHelper(
    'formatCurrency',
    (amount: number, currency: string = 'BRL') => {
      if (typeof amount !== 'number') return 'R$ 0,00';

      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency === 'BRL' ? 'BRL' : 'USD',
      }).format(amount);
    }
  );

  // Helper para formatação de número
  Handlebars.registerHelper(
    'formatNumber',
    (value: number, decimals: number = 2) => {
      if (typeof value !== 'number') return '0';

      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    }
  );

  // Helper para capitalizar texto
  Handlebars.registerHelper('capitalize', (text: string) => {
    if (typeof text !== 'string') return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  });

  // Helper para texto em maiúsculas
  Handlebars.registerHelper('uppercase', (text: string) => {
    if (typeof text !== 'string') return '';
    return text.toUpperCase();
  });

  // Helper para texto em minúsculas
  Handlebars.registerHelper('lowercase', (text: string) => {
    if (typeof text !== 'string') return '';
    return text.toLowerCase();
  });

  // Helper para truncar texto
  Handlebars.registerHelper(
    'truncate',
    (text: string, length: number = 50, suffix: string = '...') => {
      if (typeof text !== 'string') return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + suffix;
    }
  );

  // Helper para condicionais avançadas
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
  Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
  Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
  Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

  // Helper para operações matemáticas
  Handlebars.registerHelper(
    'add',
    (a: number, b: number) => (a || 0) + (b || 0)
  );
  Handlebars.registerHelper(
    'subtract',
    (a: number, b: number) => (a || 0) - (b || 0)
  );
  Handlebars.registerHelper(
    'multiply',
    (a: number, b: number) => (a || 0) * (b || 0)
  );
  Handlebars.registerHelper('divide', (a: number, b: number) =>
    b !== 0 ? (a || 0) / b : 0
  );

  // Helper para arrays
  Handlebars.registerHelper('length', (array: unknown[]) =>
    Array.isArray(array) ? array.length : 0
  );
  Handlebars.registerHelper('first', (array: unknown[]) =>
    Array.isArray(array) && array.length > 0 ? array[0] : null
  );
  Handlebars.registerHelper('last', (array: unknown[]) =>
    Array.isArray(array) && array.length > 0 ? array[array.length - 1] : null
  );

  // Helper para strings
  Handlebars.registerHelper('contains', (text: string, substring: string) => {
    if (typeof text !== 'string' || typeof substring !== 'string') return false;
    return text.toLowerCase().includes(substring.toLowerCase());
  });

  // Helper para URLs
  Handlebars.registerHelper('url', (path: string, baseUrl: string = '') => {
    if (typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  });
};

// Registrar helpers na inicialização
registerCustomHelpers();

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  variables: string[];
  helpers: string[];
}

/**
 * Interface para dados de preview
 */
export interface PreviewData {
  template: {
    name: string;
    channel: NotificationChannel;
    language: string;
  };
  processed: {
    content: string;
    subject?: string;
  };
  originalData: Record<string, unknown>;
}

/**
 * Classe principal do processador Handlebars
 */
export class HandlebarsProcessor {
  private static instance: HandlebarsProcessor;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): HandlebarsProcessor {
    if (!HandlebarsProcessor.instance) {
      HandlebarsProcessor.instance = new HandlebarsProcessor();
    }
    return HandlebarsProcessor.instance;
  }

  /**
   * Valida um template Handlebars
   */
  public validateTemplate(
    content: string,
    channel: NotificationChannel,
    options: {
      maxLength?: number;
      strictMode?: boolean;
    } = {}
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      variables: [],
      helpers: [],
    };

    // Verificar se o conteúdo não está vazio
    if (!content || content.trim().length === 0) {
      result.errors.push('Template não pode estar vazio');
      result.isValid = false;
      return result;
    }

    // Verificar limite de caracteres
    const maxLength = options.maxLength ?? CHANNEL_LIMITS[channel];
    if (content.length > maxLength) {
      result.errors.push(
        `Template excede o limite de ${maxLength} caracteres (${content.length})`
      );
      result.isValid = false;
    }

    // Verificar sintaxe Handlebars
    try {
      const _template = Handlebars.compile(content);

      // Extrair variáveis do template
      const variableRegex = /\{\{([^#/][^}]*)\}\}/g;
      let match: RegExpExecArray | null;
      const variables = new Set<string>();

      while ((match = variableRegex.exec(content)) !== null) {
        const variable = match[1]?.trim();
        if (variable && !variable.includes(' ')) {
          // Variáveis simples
          variables.add(variable);
        }
      }

      result.variables = Array.from(variables);

      // Extrair helpers utilizados
      const helperRegex = /\{\{#([^}]+)\}\}/g;
      const helpers = new Set<string>();

      while ((match = helperRegex.exec(content)) !== null) {
        const helper = match[1]?.trim().split(' ')[0];
        if (helper && !['if', 'unless', 'each', 'with'].includes(helper)) {
          helpers.add(helper);
        }
      }

      result.helpers = Array.from(helpers);
    } catch (error) {
      result.errors.push(
        `Erro de sintaxe Handlebars: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      );
      result.isValid = false;
    }

    // Verificações específicas por canal
    this.validateChannelSpecific(content, channel, result);

    // Verificações de boas práticas
    this.validateBestPractices(content, result);

    return result;
  }

  /**
   * Processa um template com dados
   */
  public processTemplate(
    content: string,
    data: Record<string, unknown>,
    options: {
      strictMode?: boolean;
      allowUndefined?: boolean;
    } = {}
  ): string {
    try {
      const template = Handlebars.compile(content, {
        strict: options.strictMode || false,
        noEscape: false,
      });

      return template(data);
    } catch (error) {
      throw new Error(
        `Erro ao processar template: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      );
    }
  }

  /**
   * Gera preview de um template
   */
  public generatePreview(
    template: {
      name: string;
      channel: NotificationChannel;
      language: string;
      content: string;
    },
    data: Record<string, unknown> = {}
  ): PreviewData {
    // Gerar dados de exemplo se não fornecidos
    const exampleData =
      Object.keys(data).length > 0
        ? data
        : this.generateExampleData(template.channel);

    try {
      const processedContent = this.processTemplate(
        template.content,
        exampleData
      );

      return {
        template: {
          name: template.name,
          channel: template.channel,
          language: template.language,
        },
        processed: {
          content: processedContent,
          subject:
            template.channel === 'email'
              ? this.extractSubject(processedContent)
              : undefined,
        },
        originalData: exampleData,
      };
    } catch (error) {
      throw new Error(
        `Erro ao gerar preview: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      );
    }
  }

  /**
   * Extrai variáveis de um template
   */
  public extractVariables(content: string): string[] {
    const variableRegex = /\{\{([^#/][^}]*)\}\}/g;
    const variables = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1]?.trim();
      if (variable && !variable.includes(' ') && !variable.includes('(')) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }

  /**
   * Gera dados de exemplo para preview
   */
  public generateExampleData(
    channel: NotificationChannel
  ): Record<string, unknown> {
    const baseData = {
      user: {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '+55 11 99999-9999',
      },
      amount: 150.75,
      date: new Date().toISOString(),
      description: 'Pagamento de conta',
      category: 'Alimentação',
      wallet: 'Carteira Principal',
      balance: 1250.5,
    };

    // Dados específicos por canal
    switch (channel) {
      case 'whatsapp':
        return {
          ...baseData,
          message: 'Olá! Você tem uma nova transação.',
          link: 'https://app.exemplo.com/transacao/123',
        };

      case 'email':
        return {
          ...baseData,
          subject: 'Nova transação registrada',
          company: 'Meu Tako',
          supportEmail: 'suporte@exemplo.com',
        };

      case 'push':
        return {
          ...baseData,
          title: 'Nova transação',
          action: 'Ver detalhes',
        };

      default:
        return baseData;
    }
  }

  /**
   * Validações específicas por canal
   */
  private validateChannelSpecific(
    content: string,
    channel: NotificationChannel,
    result: ValidationResult
  ): void {
    switch (channel) {
      case 'whatsapp':
        // WhatsApp não suporta HTML
        if (content.includes('<') && content.includes('>')) {
          result.warnings.push('WhatsApp não suporta HTML. Use texto simples.');
        }
        break;

      case 'email':
        // Email pode conter HTML
        if (!content.includes('<html>') && content.includes('<')) {
          result.warnings.push(
            'Para emails, considere usar HTML completo com tags <html>, <body>, etc.'
          );
        }
        break;

      case 'push':
        // Push notifications devem ser concisas
        if (content.length > 100) {
          result.warnings.push(
            'Push notifications devem ser concisas (máximo 100 caracteres recomendado).'
          );
        }
        break;
    }
  }

  /**
   * Validações de boas práticas
   */
  private validateBestPractices(
    content: string,
    result: ValidationResult
  ): void {
    // Verificar uso de variáveis não definidas
    const undefinedVars = content.match(/\{\{([^}]+)\}\}/g);
    if (undefinedVars) {
      undefinedVars.forEach((match) => {
        const variable = match.replace(/\{\{|\}\}/g, '').trim();
        if (variable.includes('undefined') || variable.includes('null')) {
          result.warnings.push(`Possível variável indefinida: ${variable}`);
        }
      });
    }

    // Verificar loops infinitos potenciais
    if (content.includes('{{#each') && content.includes('{{#each')) {
      result.warnings.push(
        'Múltiplos loops aninhados podem causar problemas de performance.'
      );
    }

    // Verificar condicionais complexas
    const conditionalCount = (content.match(/\{\{#if/g) || []).length;
    if (conditionalCount > 5) {
      result.warnings.push(
        'Muitas condicionais podem tornar o template difícil de manter.'
      );
    }
  }

  /**
   * Extrai subject de um email
   */
  private extractSubject(content: string): string | undefined {
    const subjectMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
    if (subjectMatch) {
      return subjectMatch[1];
    }

    // Se não encontrar title tag, usar primeira linha
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 100) {
      return firstLine;
    }

    return undefined;
  }

  /**
   * Compila um template para uso posterior
   */
  public compileTemplate(content: string): HandlebarsTemplateDelegate<any> {
    return Handlebars.compile(content);
  }

  /**
   * Registra um helper customizado
   */
  public registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    Handlebars.registerHelper(name, fn);
  }

  /**
   * Remove um helper
   */
  public unregisterHelper(name: string): void {
    if (name in Handlebars.helpers) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete Handlebars.helpers[name];
    }
  }

  /**
   * Lista todos os helpers disponíveis
   */
  public getAvailableHelpers(): string[] {
    return Object.keys(Handlebars.helpers);
  }
}

// Instância singleton
export const handlebarsProcessor = HandlebarsProcessor.getInstance();

// Funções de conveniência para uso direto
export const validateTemplate = (
  content: string,
  channel: NotificationChannel,
  options?: { maxLength?: number; strictMode?: boolean }
) => handlebarsProcessor.validateTemplate(content, channel, options);

export const processTemplate = (
  content: string,
  data: Record<string, unknown>,
  options?: { strictMode?: boolean; allowUndefined?: boolean }
) => handlebarsProcessor.processTemplate(content, data, options);

export const generatePreview = (
  template: {
    name: string;
    channel: NotificationChannel;
    language: string;
    content: string;
  },
  data?: Record<string, unknown>
) => handlebarsProcessor.generatePreview(template, data);

export const extractVariables = (content: string) =>
  handlebarsProcessor.extractVariables(content);

export const generateExampleData = (channel: NotificationChannel) =>
  handlebarsProcessor.generateExampleData(channel);

// Types are already exported in their declarations above
