export interface IBasicResponse {
    code: number;
    status: 'success' | 'error';
    message: string[];
}

export type UserRole = 'superadmin' | 'user';

export interface IMember {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface ISchedule {
    id: number;
    service_name: string;
    scheduled_at: string;
    createdAt: string;
    updatedAt: string;
}

export interface IRole {
    id: number;
    role_name: string;
    createdAt: string;
    updatedAt: string;
}

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

export interface IEvent {
    id: number | string;
    title: string;
    start: string;
    end: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IJemaat {
    id: number;
    name: string;
    birth_date: string | Date;
    born_place: string;
    is_married: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;

    // Field yang bisa bernilai null
    mom_id: number | null;
    dad_id: number | null;
    phone_number: string | null;
    baptism_date: string | Date | null;
}

export interface ICategory {
    id: number;
    name: string;
    type: 'income' | 'expense';
    createdAt: string;
    updatedAt: string;
}

export interface IFamily {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    jemaats?: IJemaat[];
}

export interface ITransaction {
    id: number;
    date: string;
    category_id: number;
    amount: number | string;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    category?: ICategory;
}
