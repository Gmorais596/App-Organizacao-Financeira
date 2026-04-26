export interface IncomeItem {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category?: string;
  created_at: string;
  week_status: string;
  week_id: string | null;
}

export interface WeeklyExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category?: string;
  created_at: string;
  week_status: string;
  week_id: string | null;
}

export interface MonthlyExpense {
  id: string;
  user_id: string;
  name: string;
  value: number;
  category?: string;
  created_at: string;
}

export interface WeeklyData {
  incomes: IncomeItem[];
  expenses: WeeklyExpense[];
  monthlyExpenses: MonthlyExpense[];
}

export interface HistoryEntry {
  id: string;
  user_id: string;
  week_start: string | null;
  week_end: string | null;
  total_income: number;
  total_weekly_expenses: number;
  total_monthly_equivalent: number;
  final_balance: number;
  created_at: string;
  
  // For UI expansion, we can fetch these separately, or join them
  incomes?: IncomeItem[];
  expenses?: WeeklyExpense[];
  monthly_expenses?: MonthlyExpense[];
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target: number;
  current: number;
  weekly_contribution: number;
  created_at: string;
}
