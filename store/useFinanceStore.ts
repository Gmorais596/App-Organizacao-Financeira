import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { FinanceState, Transaction, Goal } from '../types';

// Mock data para iniciar o MVP com algo visual
const mockTransactions: Transaction[] = [
  { id: uuidv4(), title: 'Salário', amount: 1500, date: new Date().toISOString(), category: 'Renda', type: 'income' },
  { id: uuidv4(), title: 'Mercado', amount: 200, date: new Date().toISOString(), category: 'Alimentação', type: 'expense_weekly' },
  { id: uuidv4(), title: 'Aluguel', amount: 2000, date: new Date().toISOString(), category: 'Moradia', type: 'expense_monthly' },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: mockTransactions,
      goals: [],
      
      addTransaction: (transaction) => set((state) => ({
        transactions: [{ ...transaction, id: uuidv4() }, ...state.transactions],
      })),
      
      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id),
      })),
      
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: uuidv4(), currentAmount: 0 }],
      })),
      
      updateGoalProgress: (id, amount) => set((state) => ({
        goals: state.goals.map(g => 
          g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
        ),
      })),
      
      removeGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id),
      })),
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
