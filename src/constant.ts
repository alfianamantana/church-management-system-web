export interface IBasicResponse {
    code: number;
    status: 'success' | 'error';
    message: IMessage;
}

export interface IAsset {
    id: number;
    name: string;
    description?: string;
    value?: number;
    acquisition_date?: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    location?: string;
    category?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface IMessage {
    id: string[];
    en: string[];
}

// Helper function to get message based on current language
export const getMessage = (message: IMessage): string => {
    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    const langKey = currentLang === 'id' ? 'id' : 'en';
    return message[langKey]?.[0] || message.en?.[0] || 'Unknown error';
};

export type UserRole = 'superadmin' | 'user';

export interface IMusician {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

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
    serviceAssignments: IServiceAssignment[];
}

export interface IServiceAssignment {
    id: number;
    schedule_id: number;
    member_id: number;
    role_id: number;
    createdAt: string;
    updatedAt: string;
    member?: IMember;
    role?: IRole;
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
    unique_key: string;
    phone_number: string;
    subscribe_until: string | null;
    role: UserRole;
    subscribe_type: 'bibit' | 'bertumbuh' | 'full';
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
    gender: 'male' | 'female';
    age: number;
    createdAt: string | Date;
    updatedAt: string | Date;

    // Field yang bisa bernilai null
    mom_id: number | null;
    dad_id: number | null;
    phone_number: string | null;
    baptism_date: string | Date | null;
    family_id: number | null;
    dad: IJemaat | null;
    mom: IJemaat | null;
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

export interface IPriorityNeed {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
