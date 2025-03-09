import { Loan } from './../../loans/entities/loans.entity';
import { Budget } from './../../budgets/entities/budget.entity';
import { RecurringTransaction } from './../../recurring-transactions/entities/recurring-transactions.entity';
import { Transaction } from './../../transactions/entities/transaction.entity';
import { PreferredGoal, PreferredMood } from './../../common/enums/enum';
import { Goals, Prisma } from '@prisma/client';

export class User {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    job: string;
    preferredMood: PreferredMood;
    preferredGoal: PreferredGoal;
    currentBalance: number;
    createdAt: Date;
    updatedAt: Date;

    transactions: Prisma.TransactionsGetPayload<{ include: {category: true} }>;
    recurringTransactions: Prisma.RecurringTransactionsGetPayload<{ include: {category: true} }>;
    budgets: Prisma.BudgetsGetPayload<{ include: {category: true} }>;
    goals: Prisma.GoalsGetPayload<{}>;
    loans: Prisma.LoansGetPayload<{}>;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getEmail(): string {
        return this.email;
    }

    getPhone(): string {
        return this.phone;
    }

    getCity(): string {
        return this.city;
    }

    getDistrict(): string {
        return this.district;
    }

    getFullAddress(): string {
        return `${this.city}, ${this.district}`;
    }

    getJob(): string {
        return this.job;
    }

    getPreferredMood(): PreferredMood {
        return this.preferredMood;
    }

    getPreferredGoal(): PreferredGoal {
        return this.preferredGoal;
    }

    getCurrentBalance(): number {
        return this.currentBalance;
    }

    getCreatedDate(): Date {
        return this.createdAt;
    }

    getUpdatedDate(): Date {
        return this.updatedAt;
    }

    getTransactions(): any {
        return this.transactions;
    }

    getRecurringTransactions(): any {
        return this.recurringTransactions;
    }

    getBudgets(): any {
        return this.budgets;
    }

    getGoals(): any {
        return this.goals;
    }

    getLoans(): any {
        return this.loans;
    }

    setName(name: string): void {
        this.name = name;
        this.updatedAt = new Date();
    }

    setEmail(email: string): void {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Invalid email format');
        }
        this.email = email;
        this.updatedAt = new Date();
    }

    setPhone(phone: string): void {
        this.phone = phone;
        this.updatedAt = new Date();
    }

    setCity(city: string): void {
        this.city = city;
        this.updatedAt = new Date();
    }

    setDistrict(district: string): void {
        this.district = district;
        this.updatedAt = new Date();
    }

    setJob(job: string): void {
        this.job = job;
        this.updatedAt = new Date();
    }

    setPreferredMood(preferredMood: PreferredMood): void {
        this.preferredMood = preferredMood;
        this.updatedAt = new Date();
    }

    setPreferredGoal(preferredGoal: PreferredGoal): void {
        this.preferredGoal = preferredGoal;
        this.updatedAt = new Date();
    }

    setTransactions(transactions: any): void {
        this.transactions = transactions;
    }

    setRecurringTransactions(recurringTransactions: any): void {
        this.recurringTransactions = recurringTransactions;
    }

    setBudgets(budgets: any): void {
        this.budgets = budgets;
    }

    setGoals(goals: any): void {
        this.goals = goals;
    }

    setLoans(loans: any): void {
        this.loans = loans;
    }

    updateBalance(amount: number): void {
        this.currentBalance += amount;
        this.updatedAt = new Date();
    }

    updateLastActivity(): void {
        this.updatedAt = new Date();
    }

    isProfileComplete(): boolean {
        return (
            this.name !== '' &&
            this.email !== '' &&
            this.phone !== '' &&
            this.city !== '' &&
            this.district !== '' &&
            this.job !== '' &&
            this.preferredMood !== null &&
            this.preferredGoal !== null
        );
    }

    static createNewUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
        const now = new Date();
        return new User({
            ...userData,
            id: undefined,
            createdAt: now,
            updatedAt: now,
        });
    }
}