import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { WeeklyData, HistoryEntry, Goal } from '../types/finance';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const MONTHLY_DIVISOR = 4.33;

interface FinanceContextType {
  weeklyData: WeeklyData;
  history: HistoryEntry[];
  goals: Goal[];
  totals: { gains: number; weeklyExpenses: number; monthlyEquiv: number };
  remaining: number;
  loading: boolean;
  addItem: (type: 'income' | 'expense' | 'monthly', item: any) => Promise<void>;
  removeItem: (type: 'income' | 'expense' | 'monthly', id: string) => Promise<void>;
  closeWeek: () => Promise<void>;
  deleteHistoryEntry: (id: string) => Promise<void>;
  addGoal: (goal: any) => Promise<void>;
  updateGoal: (id: string, amount: number) => Promise<void>;
  depositFromBalance: (goalId: string, amount: number, goalName: string) => Promise<void>;
  editGoal: (id: string, updates: any) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  fetchHistoryDetails: (weekId: string) => Promise<any>;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({ incomes: [], expenses: [], monthlyExpenses: [] });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    const [
      { data: incomes },
      { data: expenses },
      { data: monthly },
      { data: hist },
      { data: goalsData }
    ] = await Promise.all([
      supabase.from('income_items').select('*').eq('week_status', 'current'),
      supabase.from('weekly_expenses').select('*').eq('week_status', 'current'),
      supabase.from('monthly_expenses').select('*'),
      supabase.from('week_history').select('*').order('created_at', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false })
    ]);

    setWeeklyData({
      incomes: incomes || [],
      expenses: expenses || [],
      monthlyExpenses: monthly || []
    });
    setHistory(hist || []);
    setGoals(goalsData || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const gains = weeklyData.incomes.reduce((acc, item) => acc + item.amount, 0);
  const weeklyExpenses = weeklyData.expenses.reduce((acc, item) => acc + item.amount, 0);
  const monthlyEquiv = Number(
    weeklyData.monthlyExpenses.reduce((acc, item) => acc + item.value / MONTHLY_DIVISOR, 0).toFixed(2)
  );
  const totals = { gains, weeklyExpenses, monthlyEquiv };
  const remaining = Number((gains - weeklyExpenses - monthlyEquiv).toFixed(2));

  const addItem = async (type: 'income' | 'expense' | 'monthly', item: any) => {
    if (!user) return;
    const table = type === 'income' ? 'income_items' : type === 'expense' ? 'weekly_expenses' : 'monthly_expenses';
    
    const { data, error } = await supabase.from(table).insert([{ ...item, user_id: user.id }]).select().single();
    if (error) {
      console.error(error);
      return;
    }

    setWeeklyData((prev) => {
      if (type === 'income') return { ...prev, incomes: [...prev.incomes, data] };
      if (type === 'expense') return { ...prev, expenses: [...prev.expenses, data] };
      return { ...prev, monthlyExpenses: [...prev.monthlyExpenses, data] };
    });
  };

  const removeItem = async (type: 'income' | 'expense' | 'monthly', id: string) => {
    const table = type === 'income' ? 'income_items' : type === 'expense' ? 'weekly_expenses' : 'monthly_expenses';
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }

    setWeeklyData((prev) => {
      if (type === 'income') return { ...prev, incomes: prev.incomes.filter((i) => i.id !== id) };
      if (type === 'expense') return { ...prev, expenses: prev.expenses.filter((i) => i.id !== id) };
      return { ...prev, monthlyExpenses: prev.monthlyExpenses.filter((i) => i.id !== id) };
    });
  };

  const closeWeek = async () => {
    if (!user) return;
    setLoading(true);
    
    const newEntry = {
      user_id: user.id,
      week_end: new Date().toISOString().split('T')[0],
      total_income: gains,
      total_weekly_expenses: weeklyExpenses,
      total_monthly_equivalent: monthlyEquiv,
      final_balance: remaining,
    };

    const { data: histData, error: histError } = await supabase.from('week_history').insert([newEntry]).select().single();
    if (histError) {
      console.error(histError);
      setLoading(false);
      return;
    }

    if (weeklyData.incomes.length > 0) {
      await supabase.from('income_items').update({ week_status: 'closed', week_id: histData.id }).eq('week_status', 'current');
    }
    if (weeklyData.expenses.length > 0) {
      await supabase.from('weekly_expenses').update({ week_status: 'closed', week_id: histData.id }).eq('week_status', 'current');
    }

    setHistory((prev) => [histData, ...prev]);
    setWeeklyData({ incomes: [], expenses: [], monthlyExpenses: weeklyData.monthlyExpenses });
    setLoading(false);
  };

  const deleteHistoryEntry = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('week_history').delete().eq('id', id);
    if (!error) {
      setHistory((prev) => prev.filter((entry) => entry.id !== id));
    }
    setLoading(false);
  };
  
  const fetchHistoryDetails = async (weekId: string) => {
    const [{ data: incomes }, { data: expenses }, { data: monthly }] = await Promise.all([
      supabase.from('income_items').select('*').eq('week_id', weekId),
      supabase.from('weekly_expenses').select('*').eq('week_id', weekId),
      supabase.from('monthly_expenses').select('*') // monthly continues
    ]);
    return { incomes: incomes || [], expenses: expenses || [], monthly_expenses: monthly || [] };
  };

  const addGoal = async (goal: any) => {
    if (!user) return;
    const { data, error } = await supabase.from('goals').insert([{ ...goal, user_id: user.id }]).select().single();
    if (!error) {
      setGoals((prev) => [data, ...prev]);
    }
  };

  const updateGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newAmount = goal.current + amount;
    const { error } = await supabase.from('goals').update({ current: newAmount }).eq('id', id);
    if (!error) {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: newAmount } : g)));
    }
  };

  const depositFromBalance = async (goalId: string, amount: number, goalName: string) => {
    if (!user) return;
    setLoading(true);
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = goal.current + amount;
      await supabase.from('goals').update({ current: newAmount }).eq('id', goalId);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, current: newAmount } : g)));
    }

    const expenseItem = {
      user_id: user.id,
      name: `Meta: ${goalName}`,
      amount: amount,
      category: 'Meta',
    };
    
    const { data } = await supabase.from('weekly_expenses').insert([expenseItem]).select().single();
    if (data) {
      setWeeklyData((prev) => ({
        ...prev,
        expenses: [...prev.expenses, data],
      }));
    }
    setLoading(false);
  };

  const editGoal = async (id: string, updates: any) => {
    const { error } = await supabase.from('goals').update(updates).eq('id', id);
    if (!error) {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    }
  };

  const removeGoal = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
    setLoading(false);
  };

  return (
    <FinanceContext.Provider
      value={{
        weeklyData,
        history,
        goals,
        totals,
        remaining,
        loading,
        addItem,
        removeItem,
        closeWeek,
        deleteHistoryEntry,
        addGoal,
        updateGoal,
        depositFromBalance,
        editGoal,
        removeGoal,
        fetchHistoryDetails
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinanceContext must be used within FinanceProvider');
  return ctx;
}
