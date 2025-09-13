// dashboard.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Transaction, TransactionService, FinancialSummary } from '../services/transaction.service';
import { TransactionModalComponent } from '../components/transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  financialSummary: FinancialSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    averageIncomePerMonth: 0,
    averageExpensePerMonth: 0
  };

  // Filtering and Sorting
  filterType: string = '';
  filterCategory: string = '';
  startDate: string = '';
  endDate: string = '';
  sortBy: 'amount' | 'date' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Available categories for filtering
  availableCategories: string[] = [];

  // Bar Chart Options (Apex)
  public barChartOptions: any = {
    series: [
      { name: "Income", data: [] },
      { name: "Expenses", data: [] }
    ],
    chart: {
      type: "bar",
      height:200,
      toolbar: { show: true }
    },
    colors: ['#22c55e', '#ef4444'],
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 4 }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: [] },
    yaxis: {
      title: { text: "Amount (₹)" },
      labels: {
        formatter: function (val: number) {
          return "₹" + val.toLocaleString();
        }
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: function (val: number) { return "₹" + val.toLocaleString(); } }
    },
    title: {
      text: 'Monthly Income vs Expenses',
      align: 'center',
      style: { fontSize: '10px',fontWeight:'normal' }
    }
  };

  // Pie Chart Options (Apex)
  public pieChartOptions: any = {
    series: [],
    chart: { width: 250, type: "pie" },
    labels: [],
    colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 250 },
          legend: { position: "bottom" }
        }
      }
    ],
    tooltip: {
      y: { formatter: function (val: number) { return "₹" + val.toLocaleString(); } }
    },
    title: {
      text: 'Expenses by Category',
      align: 'center',
      style: { fontSize: '10px' }
    },
    legend: { position: 'bottom' }
  };

  // Inline confirmation modal state
  showConfirmModal = false;
  transactionToDelete: Transaction | null = null;

  @ViewChild(TransactionModalComponent) modal!: TransactionModalComponent;

  constructor(private txService: TransactionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.transactions = this.txService.getTransactions();
    this.financialSummary = this.txService.getFinancialSummary();
    this.updateAvailableCategories();
    this.applyFiltersAndSort();
    this.updateChartData();
  }

  updateAvailableCategories() {
    const categories = new Set<string>();
    this.transactions.forEach(tx => categories.add(tx.category));
    this.availableCategories = Array.from(categories).sort();
  }

  applyFiltersAndSort() {
    let filtered = [...this.transactions];

    // Apply filters
    if (this.filterType) {
      filtered = filtered.filter(tx => tx.type === this.filterType);
    }

    if (this.filterCategory) {
      filtered = filtered.filter(tx => tx.category === this.filterCategory);
    }

    if (this.startDate) {
      filtered = filtered.filter(tx => new Date(tx.date) >= new Date(this.startDate));
    }

    if (this.endDate) {
      filtered = filtered.filter(tx => new Date(tx.date) <= new Date(this.endDate));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (this.sortBy === 'amount') {
        compareValue = a.amount - b.amount;
      } else if (this.sortBy === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return this.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    this.filteredTransactions = filtered;
  }

  onFilterChange() {
    this.applyFiltersAndSort();
  }

  onSortChange() {
    this.applyFiltersAndSort();
  }

  clearFilters() {
    this.filterType = '';
    this.filterCategory = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFiltersAndSort();
  }

  updateChartData() {
    this.updateBarChartData();
    this.updatePieChartData();
  }

  updateBarChartData() {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    this.transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expense: 0 };
      if (tx.type === 'Income') monthlyData[monthKey].income += tx.amount;
      else monthlyData[monthKey].expense += tx.amount;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const categories = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    const incomeData = sortedMonths.map(month => monthlyData[month].income);
    const expenseData = sortedMonths.map(month => monthlyData[month].expense);

    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        { name: "Income", data: incomeData },
        { name: "Expenses", data: expenseData }
      ],
      xaxis: { ...this.barChartOptions.xaxis, categories: categories }
    };
  }

  updatePieChartData() {
    const categoryData: { [key: string]: number } = {};
    
    this.transactions
      .filter(tx => tx.type === 'Expense')
      .forEach(tx => {
        categoryData[tx.category] = (categoryData[tx.category] || 0) + tx.amount;
      });

    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);

    this.pieChartOptions = {
      ...this.pieChartOptions,
      series: amounts,
      labels: categories
    };
  }

  openAddModal() { 
    this.modal.open(); 
  }

  openEditModal(transaction: Transaction) { 
    this.modal.openForEdit(transaction); 
  }

  addTransaction(tx: Transaction) { 
    this.txService.addTransaction(tx); 
    this.loadData(); 
  }

  updateTransaction(tx: Transaction) { 
    this.txService.updateTransaction(tx); 
    this.loadData(); 
  }

  confirmDelete(transaction: Transaction) {
    this.transactionToDelete = transaction;
    this.showConfirmModal = true;
  }

  executeDelete() {
    if (this.transactionToDelete) {
      this.txService.deleteTransaction(this.transactionToDelete.id);
      this.loadData();
    }
    this.cancelDelete();
  }

  cancelDelete() {
    this.showConfirmModal = false;
    this.transactionToDelete = null;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Helper method to get transaction count info
  getTransactionInfo(): string {
    const total = this.transactions.length;
    const filtered = this.filteredTransactions.length;
    
    if (total === filtered) {
      return `${total} transaction${total !== 1 ? 's' : ''}`;
    } else {
      return `${filtered} of ${total} transaction${total !== 1 ? 's' : ''}`;
    }
  }
}