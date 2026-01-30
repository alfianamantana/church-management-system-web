export interface IBasicResponse {
    code: number;
    status: 'success' | 'error';
    message: string[];
}

export type UserRole = 'superadmin' | 'user';

export interface IUser {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    subscribe_until: string | null;
    role: UserRole;
    subscribe_type: 'basic' | 'full';
    createdAt: string;
    updatedAt: string;
}

export interface IPagination {
    total: number;
    page: number;
}
