import { Account } from './Account';
import { User } from './User';

export class Loan {
  "id": string;
  "userId": string;
  "user": User;
  "accountId": string;
  "account": Account;
  "principal": number;
  "interestRate": number;
  "termMonths": number;
  "amountDue": number;
  "dueDate": Date;
  "status": string;
  "payments": LoanPayment[];
  "createdAt": Date;
  "updatedAt": Date;

  constructor(data: Partial<Loan>) {
    Object.assign(this, data);
    
    // Initialize nested entities
    if (data.user) {
      this.user = new User(data.user);
    }
    if (data.account) {
      this.account = new Account(data.account);
    }
    if (data.payments) {
      this.payments = data.payments.map(p => new LoanPayment(p));
    }
  }

  // Calculate remaining principal
  get remainingPrincipal(): number {
    return this.principal - this.totalPrincipalPaid;
  }

  // Calculate total principal paid
  get totalPrincipalPaid(): number {
    return this.payments.reduce((sum, payment) => sum + payment.principalPaid, 0);
  }

  // Calculate total interest paid
  get totalInterestPaid(): number {
    return this.payments.reduce((sum, payment) => sum + payment.interestPaid, 0);
  }

  // Check if loan is fully paid
  get isFullyPaid(): boolean {
    return this.remainingPrincipal <= 0;
  }

  // Calculate next payment due date (simple monthly schedule)
  get nextPaymentDueDate(): Date {
    const lastPaymentDate = this.payments.length > 0 
      ? new Date(Math.max(...this.payments.map(p => p.paymentDate.getTime())))
      : this.createdAt;
    
    const nextDate = new Date(lastPaymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  // Check if loan is overdue
  get isOverdue(): boolean {
    return new Date() > this.dueDate && !this.isFullyPaid;
  }

  // Calculate current outstanding balance
  get outstandingBalance(): number {
    return this.amountDue - this.totalAmountPaid;
  }

  // Calculate total amount paid
  get totalAmountPaid(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  // Validate loan parameters
  validate(): string[] {
    const errors: string[] = [];
    
    if (this.interestRate < 0 || this.interestRate > 100) {
      errors.push('Interest rate must be between 0 and 100');
    }
    
    if (this.termMonths < 1) {
      errors.push('Term must be at least 1 month');
    }
    
    return errors;
  }
}





export class LoanPayment {
    "id": string;
    "loanId": string;
    "amount": number;
    "principalPaid": number;
    "interestPaid": number;
    "paymentDate": Date;
    "reference"?: string;
    "createdAt": Date;
  
    constructor(data: Partial<LoanPayment>) {
      Object.assign(this, data);
    }
  
    // Validate payment allocation
    validate(): string[] {
      const errors: string[] = [];
      
      if (this.principalPaid + this.interestPaid !== this.amount) {
        errors.push('Payment amount must equal principal + interest');
      }
      
      return errors;
    }
  }