import { PreferredGoal, PreferredMood } from './../../common/enums/enum';

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

    addBalance(amount: number): void {
        if (amount < 0) {
            throw new Error('Amount must be positive');
        }
        this.currentBalance += amount;
        this.updatedAt = new Date();
    }

    subtractBalance(amount: number): void {
        if (amount < 0) {
            throw new Error('Amount must be positive');
        }
        if (this.canAffordTransaction(amount) === false) {
            throw new Error('Insufficient balance');
        }
        this.currentBalance -= amount;
        this.updatedAt = new Date();
    }

    canAffordTransaction(amount: number): boolean {
        return this.currentBalance >= amount;
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