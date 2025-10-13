/* Updated type definitions aligned with API docs */

// User types
export interface User {
  user_id: string;
  name: string;
  email: string;
  whatsapp?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  whatsapp?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Wallet types
export interface Wallet {
  wallet_id: string;
  wallet_name: string;
  balance: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletRequest {
  wallet_name: string;
}

export interface UpdateWalletRequest {
  wallet_name?: string;
}

// Category types
export interface Category {
  category_id: string;
  name: string;
  description?: string;
  color?: string; // opcional no retorno
  icon?: string; // opcional no retorno
  // A API usa 'active'; mantemos compat e também retemos 'is_active' para retrocompatibilidade interna
  active?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Transaction types
export interface Transaction {
  transaction_id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  description?: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Income {
  income_id: string;
  user_id: string;
  wallet_id: string;
  income_category_id: string;
  amount: number;
  description?: string;
  date: string;
  received: boolean;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  expense_id: string;
  user_id: string;
  wallet_id: string;
  expense_category_id: string;
  amount: number;
  description?: string;
  date: string;
  paid: boolean;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeRequest {
  income_category_id: string;
  amount: number;
  date: string;
  description?: string;
  received?: boolean;
}

export interface CreateExpenseRequest {
  expense_category_id: string;
  amount: number;
  date: string;
  description?: string;
  paid?: boolean;
}

export interface TransferRequest {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  description?: string;
}

// Goal types
export interface Goal {
  goal_id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  target_amount: number;
  start_date: string;
  end_date: string;
  expense_category_id?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  target_amount?: number;
  start_date?: string;
  end_date?: string;
  expense_category_id?: string;
}

export interface ContributeToGoalRequest {
  amount: number;
}

export interface GoalProgress {
  goal_id: string;
  target_amount: number;
  current_amount: number;
  percentage: number;
  remaining_amount: number;
  days_remaining: number;
}

// Limit types
export interface Limit {
  limit_id: string;
  user_id: string;
  expense_category_id: string;
  limit_amount: number;
  start_date: string;
  end_date: string;
  description?: string;
  is_active: boolean;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface CreateLimitRequest {
  expense_category_id: string;
  limit_amount: number;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface UpdateLimitRequest {
  expense_category_id?: string;
  limit_amount?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface LimitStatus {
  limit_amount: number;
  used: number;
  remaining: number;
  percentage: number;
}

// Dashboard types
export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  top_expense_categories: Array<{
    name: string;
    total: number;
  }>;
  recent_transactions: Transaction[];
}

export interface BalanceSummary {
  total_balance: number;
  wallets: Array<{
    wallet_id: string;
    wallet_name: string;
    balance: number;
  }>;
}

// Report types
export interface MonthlyReport {
  month: string;
  year: number;
  total_income: number;
  total_expense: number;
  balance: number;
  categories: Array<{
    name: string;
    income: number;
    expense: number;
  }>;
}

export interface CategoryReport {
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface TrendReport {
  period: string;
  income_trend: number;
  expense_trend: number;
  balance_trend: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  current?: boolean;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Theme types
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
}

// Filter types
export interface TransactionFilter {
  start_date?: string;
  end_date?: string;
  category_id?: string;
  wallet_id?: string;
  type?: 'income' | 'expense' | 'transfer';
  min_amount?: number;
  max_amount?: number;
}

export interface DateRange {
  start: string;
  end: string;
}

// Search types
export interface SearchResult {
  type: 'transaction' | 'category' | 'wallet' | 'goal';
  id: string;
  title: string;
  description?: string;
  amount?: number;
  date?: string;
}
