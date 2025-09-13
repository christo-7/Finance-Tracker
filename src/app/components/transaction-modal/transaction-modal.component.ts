// transaction-modal.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Transaction } from '../../services/transaction.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html'
})
export class TransactionModalComponent implements OnInit {
  @Output() save = new EventEmitter<Transaction>();
  @Output() update = new EventEmitter<Transaction>();
  
  isOpen = false;
  isEditMode = false;
  currentTransactionId: string | null = null;
  form!: FormGroup;

  // Categories based on type - Updated to match requirements exactly
  typeCategories: { [key: string]: string[] } = {
    Income: ['Salary', 'Misc'],
    Expense: ['Food', 'Transport', 'Bills', 'Rent', 'Misc']
  };

  categories: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['Income', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Initialize categories based on default type
    this.updateCategories(this.form.value.type);

    // Listen for type changes
    this.form.get('type')?.valueChanges.subscribe((value) => {
      this.updateCategories(value);
    });
  }

  // Open modal for adding new transaction
  open() {
    this.isEditMode = false;
    this.currentTransactionId = null;
    this.isOpen = true;
    this.form.reset({ 
      type: 'Income', 
      category: '',
      date: new Date().toISOString().split('T')[0] // Set today's date as default
    });
    this.updateCategories('Income');
  }

  // Open modal for editing existing transaction
  openForEdit(transaction: Transaction) {
    this.isEditMode = true;
    this.currentTransactionId = transaction.id;
    this.isOpen = true;
    
    // Populate form with transaction data
    this.form.patchValue({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description
    });
    
    // Update categories for the current type
    this.updateCategories(transaction.type);
  }

  close() {
    this.isOpen = false;
    this.isEditMode = false;
    this.currentTransactionId = null;
    this.form.reset({ type: 'Income', category: '' });
    this.updateCategories('Income');
  }

  updateCategories(type: string) {
    this.categories = this.typeCategories[type] || [];
    
    // If current category is not in new type's categories, reset it
    const currentCategory = this.form.get('category')?.value;
    if (currentCategory && !this.categories.includes(currentCategory)) {
      this.form.get('category')?.setValue('');
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.form.value;
    
    if (this.isEditMode && this.currentTransactionId) {
      // Update existing transaction
      const updatedTransaction: Transaction = {
        id: this.currentTransactionId,
        ...formValue
      };
      this.update.emit(updatedTransaction);
    } else {
      // Create new transaction
      const newTransaction: Transaction = {
        id: uuidv4(),
        ...formValue
      };
      this.save.emit(newTransaction);
    }

    this.close();
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors?.['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.errors?.['min']) {
      return 'Amount must be greater than 0';
    }
    return '';
  }

  getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
}