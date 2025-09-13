import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  averageIncomePerMonth: number;
  averageExpensePerMonth: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private STORAGE_KEY = 'pft_transactions';

  constructor(private auth: AuthService) {}

  private getAllTransactions(): Record<string, Transaction[]> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private saveAllTransactions(data: Record<string, Transaction[]>) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  getTransactions(): Transaction[] {
    const user = this.auth.getCurrentUser();
    if (!user) return [];
    const all = this.getAllTransactions();
    return all[user.email] || [];
  }

  addTransaction(tx: Transaction) {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    const all = this.getAllTransactions();
    const list = all[user.email] || [];
    list.push(tx);
    all[user.email] = list;
    this.saveAllTransactions(all);
  }

  updateTransaction(updatedTx: Transaction) {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    const all = this.getAllTransactions();
    const list = all[user.email] || [];
    const index = list.findIndex(t => t.id === updatedTx.id);
    if (index !== -1) {
      list[index] = updatedTx;
      all[user.email] = list;
      this.saveAllTransactions(all);
    }
  }

  deleteTransaction(id: string) {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    const all = this.getAllTransactions();
    all[user.email] = (all[user.email] || []).filter(t => t.id !== id);
    this.saveAllTransactions(all);
  }

  getTransactionById(id: string): Transaction | undefined {
    const transactions = this.getTransactions();
    return transactions.find(t => t.id === id);
  }

  // Financial Summary Calculations
  getFinancialSummary(): FinancialSummary {
    const transactions = this.getTransactions();
    
    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalIncome - totalExpenses;

    // Calculate monthly averages
    const { averageIncomePerMonth, averageExpensePerMonth } = this.calculateMonthlyAverages(transactions);

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      averageIncomePerMonth,
      averageExpensePerMonth
    };
  }

  private calculateMonthlyAverages(transactions: Transaction[]): { averageIncomePerMonth: number; averageExpensePerMonth: number } {
    if (transactions.length === 0) {
      return { averageIncomePerMonth: 0, averageExpensePerMonth: 0 };
    }

    // Group transactions by month-year
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }

      if (t.type === 'Income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expense += t.amount;
      }
    });

    const months = Object.keys(monthlyData);
    const monthCount = months.length || 1; // Avoid division by zero

    const totalIncome = Object.values(monthlyData).reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = Object.values(monthlyData).reduce((sum, month) => sum + month.expense, 0);

    return {
      averageIncomePerMonth: totalIncome / monthCount,
      averageExpensePerMonth: totalExpenses / monthCount
    };
  }

  // Filter and Sort Methods (for Transaction History)
  filterTransactions(type?: string, category?: string, startDate?: string, endDate?: string): Transaction[] {
    let transactions = this.getTransactions();

    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }

    if (startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
    }

    if (endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
    }

    return transactions;
  }

  sortTransactions(transactions: Transaction[], sortBy: 'amount' | 'date', sortOrder: 'asc' | 'desc' = 'desc'): Transaction[] {
    return transactions.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'amount') {
        compareValue = a.amount - b.amount;
      } else if (sortBy === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }

  // Get unique categories for filtering
  getCategories(): { income: string[]; expense: string[] } {
    const transactions = this.getTransactions();
    const incomeCategories = new Set<string>();
    const expenseCategories = new Set<string>();

    transactions.forEach(t => {
      if (t.type === 'Income') {
        incomeCategories.add(t.category);
      } else {
        expenseCategories.add(t.category);
      }
    });

    return {
      income: Array.from(incomeCategories),
      expense: Array.from(expenseCategories)
    };
  }
}