
import { PreferredGoal, PreferredMood } from './../../common/enums/enum';
import { Prisma } from '@prisma/client';

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

    getFullAddress(): string {
        return `${this.city}, ${this.district}`;
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

    /**
     * Format the user for API responses
     * @returns Formatted user object matching frontend expectations
     */
    toResponseFormat(): any {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            city: this.city,
            district: this.district,
            job: this.job,
            preferredMood: this.preferredMood,
            preferredGoal: this.preferredGoal,
            currentBalance: this.currentBalance,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            profileComplete: this.isProfileComplete()
        };
    }

    /**
     * Convert a Prisma user object to a User entity
     * @param prismaUser Prisma user object from database
     * @returns User entity
     */
    static fromPrisma(prismaUser: any): User {
        return new User({
            id: String(prismaUser.id),
            name: prismaUser.name,
            email: prismaUser.email,
            phone: prismaUser.phone || '',
            city: prismaUser.city || '',
            district: prismaUser.district || '',
            job: prismaUser.job || '',
            preferredMood: prismaUser.preferredMood as PreferredMood,
            preferredGoal: prismaUser.preferredGoal as PreferredGoal,
            currentBalance: Number(prismaUser.currentBalance || 0),
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            transactions: prismaUser.transactions,
            recurringTransactions: prismaUser.recurringTransactions,
            budgets: prismaUser.budgets,
            goals: prismaUser.goals,
            loans: prismaUser.loans
        });
    }
}