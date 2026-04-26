export type TransactionType = 'income' | 'expense_weekly' | 'expense_monthly';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string
  category: string;
  type: TransactionType;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string
}

export interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  removeGoal: (id: string) => void;
}
