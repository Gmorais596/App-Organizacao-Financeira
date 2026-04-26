import { Transaction, Goal } from '../types';
import { isThisWeek, parseISO } from 'date-fns';

export const WEEKS_IN_MONTH = 4.33;

export const calculateTotals = (transactions: Transaction[]) => {
  const weeklyIncomes = transactions.filter(t => t.type === 'income' && isThisWeek(parseISO(t.date)));
  const weeklyExpenses = transactions.filter(t => t.type === 'expense_weekly' && isThisWeek(parseISO(t.date)));
  const monthlyExpenses = transactions.filter(t => t.type === 'expense_monthly');

  const totalWeeklyIncome = weeklyIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWeeklyExpense = weeklyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Rateio das despesas mensais
  const totalMonthlyExpense = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyImpactOnWeek = totalMonthlyExpense / WEEKS_IN_MONTH;

  const realWeeklySpending = totalWeeklyExpense + monthlyImpactOnWeek;
  const availableBalance = totalWeeklyIncome - realWeeklySpending;
  
  const percentageCommitted = totalWeeklyIncome > 0 
    ? (realWeeklySpending / totalWeeklyIncome) * 100 
    : 0;

  return {
    totalWeeklyIncome,
    totalWeeklyExpense,
    monthlyImpactOnWeek,
    realWeeklySpending,
    availableBalance,
    percentageCommitted
  };
};

export const getHealthMessage = (percentage: number) => {
  if (percentage >= 90) return "Cuidado! Sua renda está quase toda comprometida.";
  if (percentage >= 70) return "Atenção: seus gastos estão altos. Tente economizar mais.";
  if (percentage > 0) return "Ótimo! Você está mantendo seus gastos sob controle.";
  return "Adicione receitas e despesas para ver sua saúde financeira.";
};
