# Meu Tako - Frontend

Uma aplicação web moderna para gestão financeira pessoal, construída com Nuxt 4, Vue 3, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Framework**: Nuxt 4
- **Frontend**: Vue 3 com Composition API
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Gerenciamento de Estado**: Pinia
- **Validação de Formulários**: VeeValidate + Zod
- **Notificações**: Vue Sonner
- **Ícones**: Lucide Vue Next
- **Utilitários**: VueUse

## 📁 Estrutura do Projeto

```
meu-tako-frontend/
├── app/                          # Diretório principal da aplicação
│   ├── assets/                   # Assets não compilados
│   │   └── css/                 # Estilos globais
│   ├── components/              # Componentes Vue
│   │   └── ui/                  # Componentes de UI reutilizáveis
│   ├── composables/             # Composables Vue
│   ├── layouts/                 # Layouts da aplicação
│   ├── middleware/              # Middleware de rotas
│   ├── pages/                   # Páginas (roteamento automático)
│   ├── plugins/                 # Plugins Nuxt
│   ├── stores/                  # Stores Pinia
│   ├── types/                   # Definições TypeScript
│   └── app.vue                  # Componente raiz
├── public/                      # Assets estáticos
├── nuxt.config.ts              # Configuração do Nuxt
├── tailwind.config.js          # Configuração do Tailwind
└── package.json                # Dependências do projeto
```

## 🛠️ Instalação

1. **Clone o repositório**

   ```bash
   git clone <repository-url>
   cd meu-tako-frontend
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas configurações:

   ```env
   API_BASE_URL=http://localhost:5000/api
   ```

4. **Execute o projeto em desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

## 🎨 Funcionalidades

### Autenticação

- ✅ Login e registro de usuários
- ✅ Recuperação de senha
- ✅ Gerenciamento de perfil
- ✅ Middleware de autenticação

### Gestão Financeira

- ✅ Dashboard com visão geral
- ✅ Carteiras múltiplas
- ✅ Registro de receitas e despesas
- ✅ Categorização de transações
- ✅ Transferências entre carteiras

### Metas e Relatórios

- ✅ Metas financeiras
- ✅ Relatórios e análises
- ✅ Gráficos e visualizações

### Interface

- ✅ Design responsivo (mobile-first)
- ✅ Tema claro/escuro
- ✅ Componentes reutilizáveis
- ✅ Notificações toast
- ✅ Loading states

## 🎯 Páginas Principais

- **Dashboard** (`/`) - Visão geral das finanças
- **Transações** (`/transactions`) - Gestão de receitas e despesas
- **Carteiras** (`/wallets`) - Gerenciamento de carteiras
- **Metas** (`/goals`) - Metas financeiras
- **Relatórios** (`/reports`) - Análises e gráficos
- **Configurações** (`/settings`) - Preferências do usuário
- **Perfil** (`/profile`) - Informações do usuário

## 🔧 Componentes UI

### Componentes Básicos

- `Button` - Botões com variantes e estados
- `Input` - Campos de entrada com validação
- `Card` - Containers de conteúdo
- `Modal` - Janelas modais
- `Badge` - Etiquetas de status
- `LoadingSpinner` - Indicadores de carregamento

### Layouts

- `default` - Layout principal com navegação
- `auth` - Layout para páginas de autenticação

## 📱 Responsividade

A aplicação é totalmente responsiva e otimizada para:

- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🎨 Tema

### Cores Principais

- **Primária**: Azul (#1E3A8A)
- **Secundária**: Azul claro (#3B82F6)
- **Sucesso**: Verde (#10B981)
- **Erro**: Vermelho (#EF4444)

### Modo Escuro

Suporte completo ao modo escuro com alternância automática baseada na preferência do sistema.

## 🔌 Integração com API

A aplicação se conecta com a API backend através de:

- **Base URL**: Configurável via `API_BASE_URL`
- **Autenticação**: JWT Bearer Token
- **Interceptadores**: Para refresh automático de tokens
- **Tratamento de Erros**: Global e específico por página

## 🚀 Build e Deploy

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

### Deploy

A aplicação pode ser deployada em qualquer plataforma que suporte Node.js:

- Vercel
- Netlify
- AWS Amplify
- Heroku
- Docker

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build
- `npm run generate` - Geração estática

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através de:

- 📧 Email: suporte@meutako.com
- 💬 Discord: [Servidor Meu Tako](https://discord.gg/meutako)
- 📱 WhatsApp: +258 84 000 0000

---

Desenvolvido com ❤️ para ajudar pessoas a gerenciarem suas finanças pessoais de forma simples e eficiente.
