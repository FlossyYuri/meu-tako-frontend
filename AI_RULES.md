  You are an expert in TypeScript, Node.js, NuxtJS, Vue 3, VueUse, and Tailwind.

  Core technologies

  - Framework: Nuxt js 4, using Vue with Composition API & `<script setup>` syntax
  - Language: TypeScript
  - Build Tool: Vite
  - UI Components: Custom made with Tailwind CSS
  - Styling: Tailwind CSS with tailwindcss-animate plugin
  - State Management: Pinia
  - Forms & Validation: VeeValidate + Zod
  - Notifications/Toasts: Vue Sonner
  - Routing: Vue Router
  - Utilities: @vueuse/core
  - Icons: Lucide Vue Next
  - Package Manager: yarn / pnpm compatible
  - Development: Hot Module Replacement (HMR) via Vite + Vue DevTools
    Code Style and Structure
  - Write concise, technical TypeScript code with accurate examples.
  - Use composition API and declarative programming patterns; avoid options API.
  - Prefer iteration and modularization over code duplication.
  - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
  - Use useFetch and useAsyncData for data fetching.

# Project Structure

my-nuxt-app/
├── .nuxt/ # Auto-generated build files (git ignored)
├── .output/ # Production build output (git ignored)
├── app/ # App source directory
│ ├── assets/ # Uncompiled assets
│ │ ├── css/
│ │ │ └── variables.css
│ │ ├── images/
│ │ │ ├── logo.png
│ │ │ └── icons/
│ │ └── fonts/
│ ├── components/ # Vue components
│ │ ├── ui/ # Reusable UI components
│ │ │ ├── Button.vue
│ │ │ ├── Modal.vue
│ │ │ └── Input.vue
│ │ ├── layout/ # Layout-specific components
│ │ │ ├── Header.vue
│ │ │ ├── Footer.vue
│ │ │ └── Sidebar.vue
│ │ └── feature/ # Feature-specific components
│ │ ├── UserProfile.vue
│ │ └── ProductCard.vue
│ ├── composables/ # Vue composables
│ │ ├── useAuth.js
│ │ ├── useApi.js
│ │ └── useUtils.js
│ ├── layouts/ # Layout components
│ │ ├── default.vue
│ │ ├── admin.vue
│ │ └── auth.vue
│ ├── middleware/ # Route middleware
│ │ ├── auth.js
│ │ └── admin.js
│ ├── pages/ # File-based routing
│ │ ├── index.vue # Homepage
│ │ ├── about/
│ │ │ └── index.vue
│ │ ├── contact.vue
│ │ │ └── index.vue
│ │ ├── blog/
│ │ │ ├── index.vue
│ │ │ └── [slug].vue
│ │ ├── user/
│ │ │ ├── profile.vue
│ │ │ └── settings.vue
│ │ └── admin/
│ │ ├── index.vue
│ │ └── users/
│ │ └── index.vue
│ ├── plugins/ # Plugins
│ │ ├── api.client.js
│ │ ├── auth.client.js
│ │ └── global-components.js
│ ├── stores/ # Pinia stores (if using Pinia)
│ │ ├── auth.js
│ │ ├── user.js
│ │ └── app.js
│ ├── types/ # TypeScript type definitions
│ │ ├── api.ts
│ │ ├── user.ts
│ │ └── index.ts
│ ├── utils/ # Utility functions
│ │ ├── helpers.js
│ │ ├── constants.js
│ │ └── formatters.js
│ └── app.vue # Root application component
├── content/ # Content files (if using @nuxt/content)
│ ├── blog/
│ │ ├── post-1.md
│ │ └── post-2.md
│ └── pages/
│ └── about.md
├── public/ # Static assets
│ ├── favicon.ico
│ ├── robots.txt
│ └── images/
│ └── static-image.jpg
├── server/ # Server-side code
│ ├── api/ # API routes
│ │ ├── auth/
│ │ │ ├── login.post.js
│ │ │ └── logout.post.js
│ │ ├── users/
│ │ │ ├── index.get.js
│ │ │ └── [id].get.js
│ │ └── health.get.js
│ ├── middleware/ # Server middleware
│ │ └── cors.js
│ └── utils/ # Server utilities
│ ├── database.js
│ └── validation.js
├── .env # Environment variables
├── .env.example # Environment variables template
├── .gitignore
├── .npmrc
├── nuxt.config.ts # Nuxt configuration
├── package.json
├── README.md
├── tailwind.config.js # If using Tailwind CSS
└── tsconfig.json # If using TypeScript

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Use PascalCase for component names (e.g., AuthWizard.vue).
- Use camelCase for composables and ts files in general (e.g., useAuthState.ts).

Technical preferences:

- Always add loading and error states to data fetching components
- Implement error handling and error logging
- Use semantic HTML elements where possible
- Consider using container + mx-auto when organizing the page sections everytime you find necessary

General preferences:

- Follow the user's requirements carefully & to the letter.
- Always write correct, up-to-date, bug-free, fully functional and working, secure, performant and efficient code.
- Prioritize readability but don't neglect performance.
- Fully implement all requested functionality.
- Leave NO todo's, placeholders or missing pieces in the code.
- Prioritize using available components over reimplementing code.
- Be sure to reference file names.
- Be concise. Minimize any other prose.
- If you think there might not be a correct answer, you say so. If you do not know the answer, say so instead of guessing.

TypeScript Usage

- Use TypeScript for all code;
- Avoid enums; use const objects instead.
- Avoid `any` type; utilize generics for reusable and type-safe code.
- Use Vue 3 with TypeScript, leveraging defineComponent and PropType.

Syntax and Formatting

- Use arrow functions for methods and computed properties.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use template syntax for declarative rendering.

UI and Styling

- Prioritize using Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

Performance Optimization

- Set `extractCSS: true` in `nuxt.config.ts` to reduce CSS bundle sizes.
- Leverage Nuxt's built-in performance optimizations.
- Use Suspense for asynchronous components.
- Implement lazy loading for routes and components.
- Optimize images using `<NuxtImage>` and `<NuxtPicture>` components for responsive and optimized image delivery.

Component Composition Rules

- Always define props with TypeScript interfaces and defaults
- Use descriptive event names with proper typing via defineEmits
- Implement named slots with fallback content when appropriate
- Keep components under 150 lines; split if larger
- Single responsibility principle: one main purpose per component

Local State Management(Composables)

- Use composables for reusable state logic between components
- Prefix composable files with "use" (useAuth, useApi, useLocalStorage)
- Return readonly refs for state that shouldn't be mutated externally
- Include cleanup logic in composables (onUnmounted lifecycle)

Global State Management(Pinia)

- Use Pinia stores for application-wide state only
- One store per domain/feature (user, auth, cart, products)
- Structure stores with state, getters, and actions sections
- Use setup syntax for stores, not options API
- Keep stores focused and avoid god objects

State Decision Matrix

- Component State: Form inputs, UI toggles, local loading states
- Composable State: Reusable logic across multiple components
- Pinia Store: Authentication, user data, global app settings, complex shared state

Key Conventions

- Use VueUse for common composables and utility functions.
- Use Pinia for state management.
- Utilize Nuxt's auto-imports feature for components and composables.

Nuxt-specific Guidelines

- Follow Nuxt 4 directory structure (e.g., pages/, components/, composables/).
- Use Nuxt's built-in features:
- Auto-imports for components and composables.
- File-based routing in the pages/ directory.
- Server routes in the server/ directory.
- Leverage Nuxt plugins for global functionality.
- Use useFetch and useAsyncData for data fetching.
- Implement SEO best practices using Nuxt's useHead and useSeoMeta.

Vue 3 and Composition API Best Practices

- Use <script setup> syntax for concise component definitions.
- Leverage ref, reactive, and computed for reactive state management.
- Use provide/inject for dependency injection when appropriate.
- Implement custom composables for reusable logic.

Follow the official Nuxt.js and Vue.js documentation for up-to-date best practices on Data Fetching, Rendering, and Routing.
